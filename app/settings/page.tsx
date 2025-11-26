// "use client"

// import React, { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"

// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Switch } from "@/components/ui/switch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Header } from "@/components/dashboard/header"
// import { SettingsIcon, UsersIcon, BellIcon, WalletIcon } from "@/components/icons"

// type GroupRow = {
//   id: string
//   name: string
//   description?: string | null
//   currency?: string | null
//   shared_wallet_balance?: number | null
//   large_payment_threshold?: number | null
//   require_approval_above_threshold?: boolean | null
//   allow_member_invites?: boolean | null
//   default_member_role?: string | null
//   created_by?: string | null
//   created_at?: string | null
//   updated_at?: string | null
// }

// type ProfileRow = {
//   id: string
//   email?: string | null
//   phone?: string | null
//   full_name?: string | null
//   avatar_url?: string | null
//   role?: string | null
//   created_at?: string | null
//   updated_at?: string | null
// }

// const currencies = [
//   { code: "USD", name: "US Dollar", symbol: "$" },
//   { code: "EUR", name: "Euro", symbol: "€" },
//   { code: "GBP", name: "British Pound", symbol: "£" },
//   { code: "JPY", name: "Japanese Yen", symbol: "¥" },
//   { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
//   { code: "AUD", name: "Australian Dollar", symbol: "A$" },
//   { code: "INR", name: "Indian Rupee", symbol: "₹" },
// ]

// export default function SettingsPage() {
//   const router = useRouter()
//   const supabase = createClient()

//   // page state
//   const [loading, setLoading] = useState(true)
//   const [savingGroup, setSavingGroup] = useState(false)
//   const [savingProfile, setSavingProfile] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const [userId, setUserId] = useState<string | null>(null)

//   // group state
//   const [group, setGroup] = useState<GroupRow | null>(null)
//   const [groupName, setGroupName] = useState("")
//   const [groupDescription, setGroupDescription] = useState("")
//   const [currency, setCurrency] = useState("INR")
//   const [largePaymentThreshold, setLargePaymentThreshold] = useState<number | "">(50000)
//   const [requireApprovalAboveThreshold, setRequireApprovalAboveThreshold] = useState(true)
//   const [allowMemberInvites, setAllowMemberInvites] = useState(false)
//   const [defaultMemberRole, setDefaultMemberRole] =
//     useState<"member" | "co-admin" | "admin">("member")

//   // profile state
//   const [profile, setProfile] = useState<ProfileRow | null>(null)
//   const [fullName, setFullName] = useState("")
//   const [avatarUrl, setAvatarUrl] = useState("")

//   // Local notification prefs
//   const [emailNotifications, setEmailNotifications] = useState(true)
//   const [pushNotifications, setPushNotifications] = useState(true)
//   const [expenseAlerts, setExpenseAlerts] = useState(true)
//   const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true)
//   const [lowBalanceThreshold, setLowBalanceThreshold] =
//     useState<number | "">(500)

//   useEffect(() => {
//     let mounted = true

//     async function load() {
//       setLoading(true)
//       setError(null)

//       try {
//         // 1️⃣ load auth user
//         const {
//           data: { user },
//           error: userErr,
//         } = await supabase.auth.getUser()

//         if (userErr) throw userErr
//         if (!user) return router.push("/auth/login")

//         setUserId(user.id)

//         // 2️⃣ load profile using email (correct identifier)
//         const { data: profileRow, error: pErr } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("email", user.email)
//           .maybeSingle()

//         if (pErr) throw pErr
//         if (!profileRow) throw new Error("Profile not found")

//         setProfile(profileRow)
//         setFullName(profileRow.full_name || "")
//         setAvatarUrl(profileRow.avatar_url || "")

//         // ⭐ correct profile id
//         const profileId = profileRow.id

//         // 3️⃣ find user's group
//         const { data: gm, error: gmErr } = await supabase
//           .from("group_members")
//           .select("group_id")
//           .eq("profile_id", profileId)
//           .maybeSingle()

//         if (gmErr) throw gmErr

//         const groupId = gm?.group_id

//         if (!groupId) {
//           setGroup(null)
//           setLoading(false)
//           return
//         }

//         // 4️⃣ load group
//         const { data: gRow, error: gErr } = await supabase
//           .from("groups")
//           .select("*")
//           .eq("id", groupId)
//           .maybeSingle()

//         if (gErr) throw gErr

//         if (gRow) {
//           setGroup(gRow)
//           setGroupName(gRow.name || "")
//           setGroupDescription(gRow.description || "")
//           setCurrency(gRow.currency || "INR")
//           setLargePaymentThreshold(gRow.large_payment_threshold ?? 50000)
//           setRequireApprovalAboveThreshold(
//             !!gRow.require_approval_above_threshold
//           )
//           setAllowMemberInvites(!!gRow.allow_member_invites)
//           setDefaultMemberRole((gRow.default_member_role as any) || "member")
//         }

//         // 5️⃣ load notifications from localStorage
//         const prefs =
//           typeof window !== "undefined"
//             ? localStorage.getItem("cw_notification_prefs")
//             : null

//         if (prefs) {
//           const parsed = JSON.parse(prefs)
//           setEmailNotifications(parsed.emailNotifications)
//           setPushNotifications(parsed.pushNotifications)
//           setExpenseAlerts(parsed.expenseAlerts)
//           setLowBalanceAlerts(parsed.lowBalanceAlerts)
//           setLowBalanceThreshold(parsed.lowBalanceThreshold ?? 500)
//         }
//       } catch (err) {
//         console.error("Settings load error:", err)
//         setError(err instanceof Error ? err.message : String(err))
//       } finally {
//         if (mounted) setLoading(false)
//       }
//     }

//     load()
//     return () => {
//       mounted = false
//     }
//   }, [supabase, router])

//   // 💥 Create Group Button handler
//   const handleCreateGroup = () => {
//     router.push("/settings/create-group") // change route if you want
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p>Loading settings…</p>
//       </div>
//     )
//   }

//   // ⭐ If NO GROUP — show create group UI
//   if (!group) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
//         <h2 className="text-xl font-bold">You are not part of any group</h2>
//         <p className="text-muted-foreground">
//           Create your first group to get started.
//         </p>

//         <Button onClick={handleCreateGroup} className="mt-4">
//           Create Group
//         </Button>
//       </div>
//     )
//   }

//   // =============================
//   // NORMAL SETTINGS PAGE BELOW
//   // (UNCHANGED)
//   // =============================

//   return (
//     <div className="min-h-screen bg-background">
//       <Header groupName={group?.name || "My Group"} />

//       <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-foreground">
//             Settings
//           </h1>
//           <p className="text-muted-foreground">
//             Manage your group and account settings
//           </p>
//         </div>

//         {/** Everything below is exactly same UI, unchanged */}
//         {/* ——————————————— */}
//         {/* KEEPING REST SAME */}
//         {/* ——————————————— */}

//         {/* your tabs... */}
//         {/* your group form... */}
//         {/* your wallet... */}
//         {/* your notifications... */}
//         {/* your account tab... */}

//       </main>

//       {error && (
//         <div className="fixed bottom-4 right-4 p-3 bg-destructive/10 rounded">
//           <p className="text-sm text-destructive">Error: {error}</p>
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/dashboard/header"
import { SettingsIcon, UsersIcon, BellIcon, WalletIcon } from "@/components/icons"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --------------------------
  // GROUP + PROFILE STATE
  // --------------------------
  const [group, setGroup] = useState<any>(null)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")

  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [expenseAlerts, setExpenseAlerts] = useState(true)
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true)
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState<number | "">(500)

  // --------------------------
  // Load settings data
  // --------------------------
  useEffect(() => {
    let mounted = true

    ;(async () => {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Profile
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()

        setProfile(p)
        setFullName(p?.full_name || "")
        setAvatarUrl(p?.avatar_url || "")

        // Group membership
        const { data: gm } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", p.id)
          .maybeSingle()

        if (!gm?.group_id) {
          setGroup(null)
          setLoading(false)
          return
        }

        const { data: g } = await supabase
          .from("groups")
          .select("*")
          .eq("id", gm.group_id)
          .maybeSingle()

        setGroup(g)
        setGroupName(g?.name || "")
        setGroupDescription(g?.description || "")

        // notification prefs local
        const prefs = localStorage.getItem("cw_notification_prefs")
        if (prefs) {
          const parsed = JSON.parse(prefs)
          setEmailNotifications(parsed.emailNotifications)
          setPushNotifications(parsed.pushNotifications)
          setExpenseAlerts(parsed.expenseAlerts)
          setLowBalanceAlerts(parsed.lowBalanceAlerts)
          setLowBalanceThreshold(parsed.lowBalanceThreshold)
        }
      } catch (err) {
        setError("Failed to load settings")
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // --------------------------
  // Save Notification Prefs
  // --------------------------
  const saveNotificationPrefs = () => {
    const prefs = {
      emailNotifications,
      pushNotifications,
      expenseAlerts,
      lowBalanceAlerts,
      lowBalanceThreshold,
    }
    localStorage.setItem("cw_notification_prefs", JSON.stringify(prefs))
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading settings…
      </div>
    )

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <h2 className="text-xl font-bold">You are not part of any group</h2>
        <p className="text-muted-foreground">Create your first group to continue.</p>
        <Button onClick={() => router.push("/settings/create-group")}>
          Create Group
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your group and account settings
        </p>

        <Tabs defaultValue="group" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="group"><SettingsIcon className="w-4 h-4 mr-1" /> Group</TabsTrigger>
            <TabsTrigger value="wallet"><WalletIcon className="w-4 h-4 mr-1" /> Wallet</TabsTrigger>
            <TabsTrigger value="notifications"><BellIcon className="w-4 h-4 mr-1" /> Notifications</TabsTrigger>
            <TabsTrigger value="account"><UsersIcon className="w-4 h-4 mr-1" /> Account</TabsTrigger>
          </TabsList>

          {/* ------------------ GROUP SETTINGS ------------------- */}
          <TabsContent value="group">
            <Card className="p-5 space-y-4">
              <h2 className="text-xl font-semibold">Group Settings</h2>

              <div>
                <Label>Group Name</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>

              <Button>Save Group</Button>
            </Card>
          </TabsContent>

          {/* ------------------ WALLET SETTINGS ------------------- */}
          <TabsContent value="wallet">
            <Card className="p-5 space-y-4">
              <h2 className="text-xl font-semibold">Wallet Settings</h2>

              <div>
                <Label>Low Balance Alerts</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={lowBalanceAlerts}
                    onCheckedChange={setLowBalanceAlerts}
                  />
                  <span className="text-sm">Enable alerts</span>
                </div>
              </div>

              <div>
                <Label>Low Balance Threshold (₹)</Label>
                <Input
                  type="number"
                  value={lowBalanceThreshold}
                  onChange={(e) => setLowBalanceThreshold(Number(e.target.value))}
                />
              </div>

              <Button onClick={saveNotificationPrefs}>Save Wallet Settings</Button>
            </Card>
          </TabsContent>

          {/* ------------------ NOTIFICATION SETTINGS ------------------- */}
          <TabsContent value="notifications">
            <Card className="p-5 space-y-4">
              <h2 className="text-xl font-semibold">Notifications</h2>

              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Expense Alerts</span>
                <Switch
                  checked={expenseAlerts}
                  onCheckedChange={setExpenseAlerts}
                />
              </div>

              <Button onClick={saveNotificationPrefs}>Save Notifications</Button>
            </Card>
          </TabsContent>

          {/* ------------------ ACCOUNT SETTINGS ------------------- */}
          <TabsContent value="account">
            <Card className="p-5 space-y-4">
              <h2 className="text-xl font-semibold">Account</h2>

              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    {fullName ? fullName.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <Button>Save Profile</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {error && (
        <div className="fixed bottom-4 right-4 p-3 bg-red-200 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
