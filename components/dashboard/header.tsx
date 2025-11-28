"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleWalletLogo, BellIcon, MenuIcon, XIcon, LogOutIcon, SettingsIcon } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface HeaderProps {
  groupName: string
}

export function Header({ groupName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile on mount
  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && mounted) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()
        
        if (mounted) {
          setProfile(data)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [supabase])

  // Listen for profile updates from localStorage/storage events
  useEffect(() => {
    const handleStorageChange = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()
        
        setProfile(data)
      }
    }

    // Listen for custom event when profile is updated
    window.addEventListener("profile-updated", handleStorageChange)
    
    return () => {
      window.removeEventListener("profile-updated", handleStorageChange)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
  <img 
    src="/icon.svg" 
    alt="Circle Wallet Logo" 
    className="w-8 h-8"
  />
  <span className="font-bold text-lg text-foreground hidden sm:block">Circle Wallet</span>
</Link>

            <span className="text-muted-foreground hidden md:block">|</span>
            <span className="text-sm text-muted-foreground hidden md:block">{groupName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transactions">Transactions</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/members">Members</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/invites">Invites</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">Reports</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <ModeToggle />

            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profile && (
                  <>
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium">{profile.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/transactions">Transactions</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/members">Members</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/invites">Invites</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/reports">Reports</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
