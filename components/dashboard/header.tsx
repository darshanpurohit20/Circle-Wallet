"use client"

import { useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface HeaderProps {
  groupName: string
}

export function Header({ groupName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <CircleWalletLogo className="w-8 h-8" />
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
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage src="/placeholder.svg?key=user" alt="User" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">RS</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
