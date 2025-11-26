"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const currencies = [
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
]

export default function CreateGroupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()

      if (userErr) throw userErr
      if (!user) {
        return router.push("/auth/login")
      }

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (pErr) throw pErr
      if (!profile) throw new Error("Profile not found")

      const profileId = profile.id

      const { data: newGroup, error: gErr } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          currency,
          shared_wallet_balance: 0,
          large_payment_threshold: 50000,
          require_approval_above_threshold: true,
          allow_member_invites: false,
          default_member_role: "member",
          created_by: profileId,
        })
        .select()
        .single()

      if (gErr) throw gErr

      const { error: gmErr } = await supabase.from("group_members").insert({
        group_id: newGroup.id,
        profile_id: profileId,
        family_id: null,
        role: "admin",
      })

      if (gmErr) throw gmErr

      router.push("/")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Create Your Group</h1>
          <p className="text-muted-foreground text-center text-sm sm:text-base">
            Set up a group to manage shared expenses and wallet
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Goa Trip 2025"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              className="min-h-[120px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add group purpose or details"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="h-11">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full h-11 text-base"
          disabled={loading || !name.trim()}
          onClick={handleCreate}
        >
          {loading ? "Creating…" : "Create Group"}
        </Button>
      </Card>
    </div>
  )
}
