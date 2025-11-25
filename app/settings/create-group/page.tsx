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
      // Get current logged-in user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()

      if (userErr) throw userErr
      if (!user) {
        return router.push("/auth/login")
      }

      // Fetch profile row via email (correct)
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (pErr) throw pErr
      if (!profile) throw new Error("Profile not found")

      const profileId = profile.id

      // Create new group
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

      // Add user to `group_members` as admin
      const { error: gmErr } = await supabase.from("group_members").insert({
        group_id: newGroup.id,
        profile_id: profileId,
        family_id: null,
        role: "admin",
      })

      if (gmErr) throw gmErr

      // Redirect to dashboard
      router.push("/")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create Your Group</h1>
          <p className="text-muted-foreground mt-1">
            Set up a group to manage shared expenses and wallet.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Goa Trip 2025"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Add group purpose"
            />
          </div>

          <div>
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
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
          className="w-full"
          disabled={loading || !name}
          onClick={handleCreate}
        >
          {loading ? "Creating…" : "Create Group"}
        </Button>
      </Card>
    </div>
  )
}
