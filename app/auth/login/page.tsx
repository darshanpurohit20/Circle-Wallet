"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleIcon, MailIcon, PhoneIcon, ChromeIcon } from "@/components/icons"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const router = useRouter()

  // ---------------------------
  // Email + Password Login
  // ---------------------------
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      router.replace("/d")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------------------
  // Google Login (Fixed)
  // ---------------------------
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // ---------------------------
  // Phone OTP: Send OTP
  // ---------------------------
  const handleSendOtp = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
      })
      if (error) throw error

      setOtpSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------------------
  // Phone OTP: Verify OTP
  // ---------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        token: otp,
        type: "sms",
      })
      if (error) throw error

      router.replace("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <CircleIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Circle Wallet</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to manage your shared wallet</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="email" className="gap-2">
                  <MailIcon className="w-4 h-4" /> Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-2">
                  <PhoneIcon className="w-4 h-4" /> Phone
                </TabsTrigger>
                <TabsTrigger value="google" className="gap-2">
                  <ChromeIcon className="w-4 h-4" /> Google
                </TabsTrigger>
              </TabsList>

              {/* EMAIL LOGIN */}
              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In with Email"}
                  </Button>
                </form>
              </TabsContent>

              {/* PHONE LOGIN */}
              <TabsContent value="phone">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 bg-muted rounded-md border text-sm text-muted-foreground">
                          +91
                        </div>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button
                      onClick={handleSendOtp}
                      className="w-full"
                      disabled={isLoading || phone.length !== 10}
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Enter OTP</Label>
                      <Input
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        maxLength={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        OTP sent to +91{phone}
                      </p>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false)
                        setOtp("")
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </form>
                )}
              </TabsContent>

              {/* GOOGLE LOGIN */}
              <TabsContent value="google">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in with your Google account
                  </p>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full gap-2 bg-transparent"
                    disabled={isLoading}
                  >
                    <ChromeIcon className="w-5 h-5" />
                    {isLoading ? "Redirecting..." : "Continue with Google"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
