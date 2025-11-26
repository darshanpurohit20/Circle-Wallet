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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Header } from "@/components/dashboard/header"
import { SettingsIcon, UsersIcon, BellIcon, WalletIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/icons"

type ToastType = "success" | "error" | "warning"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [savingGroup, setSavingGroup] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Group & Profile state
  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
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

  // Show toast helper
  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Load settings data
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

        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()

        setProfile(p)
        setFullName(p?.full_name || "")
        setAvatarUrl(p?.avatar_url || "")

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

        const { data: familyRows } = await supabase
          .from("families")
          .select("id")
          .eq("group_id", gm.group_id)

        setFamilies(familyRows || [])

        const prefs = localStorage.getItem("cw_notification_prefs")
        if (prefs) {
          const parsed = JSON.parse(prefs)
          setEmailNotifications(parsed.emailNotifications ?? true)
          setPushNotifications(parsed.pushNotifications ?? true)
          setExpenseAlerts(parsed.expenseAlerts ?? true)
          setLowBalanceAlerts(parsed.lowBalanceAlerts ?? true)
          setLowBalanceThreshold(parsed.lowBalanceThreshold ?? 500)
        }
      } catch (err) {
        showToast("Failed to load settings", "error")
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  // Save Group Settings
  const handleSaveGroup = async () => {
    if (!group) return
    
    setSavingGroup(true)
    try {
      const { error } = await supabase
        .from("groups")
        .update({
          name: groupName,
          description: groupDescription,
        })
        .eq("id", group.id)

      if (error) throw error

      setGroup({ ...group, name: groupName, description: groupDescription })
      showToast("Group settings saved successfully!", "success")
    } catch (err) {
      console.error("Save group error:", err)
      showToast("Failed to save group settings", "error")
    } finally {
      setSavingGroup(false)
    }
  }

  // Save Profile Settings
  const handleSaveProfile = async () => {
    if (!profile) return

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, full_name: fullName, avatar_url: avatarUrl })
      showToast("Profile updated successfully!", "success")
    } catch (err) {
      console.error("Save profile error:", err)
      showToast("Failed to save profile", "error")
    } finally {
      setSavingProfile(false)
    }
  }

  // Save Notification Prefs
  const saveNotificationPrefs = () => {
    const prefs = {
      emailNotifications,
      pushNotifications,
      expenseAlerts,
      lowBalanceAlerts,
      lowBalanceThreshold,
    }
    localStorage.setItem("cw_notification_prefs", JSON.stringify(prefs))
    showToast("Notification preferences saved!", "success")
  }

  // Delete Group (with dialog)
  const handleDeleteGroup = async () => {
    if (!group) return

    const expectedText = `DELETE ${groupName}`
    
    if (deleteConfirmText !== expectedText) {
      showToast(`Please type "${expectedText}" to confirm`, "warning")
      return
    }

    try {
      if (families.length > 0) {
        await supabase
          .from("family_members")
          .delete()
          .in("family_id", families.map(f => f.id))
      }

      await supabase.from("families").delete().eq("group_id", group.id)
      await supabase.from("transactions").delete().eq("group_id", group.id)
      await supabase.from("group_members").delete().eq("group_id", group.id)

      const { error } = await supabase.from("groups").delete().eq("id", group.id)

      if (error) throw error

      showToast("Group deleted successfully", "success")
      setTimeout(() => router.push("/settings/create-group"), 1500)
    } catch (err) {
      console.error("Delete group error:", err)
      showToast("Failed to delete group", "error")
    } finally {
      setDeleteDialogOpen(false)
      setDeleteConfirmText("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <h2 className="text-2xl font-bold">You are not part of any group</h2>
        <p className="text-muted-foreground text-center">Create your first group to continue.</p>
        <Button size="lg" onClick={() => router.push("/settings/create-group")}>
          Create Group
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your group and account preferences
          </p>
        </div>

        <Tabs defaultValue="group" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4">
            <TabsTrigger value="group" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Group</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <WalletIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <BellIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <UsersIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* GROUP SETTINGS */}
          <TabsContent value="group" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Group Information</h2>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="group-name" className="text-base">Group Name</Label>
                  <Input
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="group-desc" className="text-base">Description</Label>
                  <Textarea
                    id="group-desc"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What's this group for?"
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleSaveGroup} disabled={savingGroup} className="w-full sm:w-auto">
                  {savingGroup ? "Saving..." : "Save Group Settings"}
                </Button>
              </div>
            </Card>

            {/* DANGER ZONE */}
            <Card className="p-6 border-2 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-2 text-destructive mb-4">
                <AlertCircleIcon className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Danger Zone</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Once you delete this group, there is no going back. All families, members, 
                transactions, and balances will be permanently deleted.
              </p>

              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                Delete "{groupName}" Group
              </Button>
            </Card>
          </TabsContent>

          {/* WALLET SETTINGS */}
          <TabsContent value="wallet">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Wallet Preferences</h2>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base">Low Balance Alerts</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get notified when your wallet balance is running low
                    </p>
                  </div>
                  <Switch
                    checked={lowBalanceAlerts}
                    onCheckedChange={setLowBalanceAlerts}
                  />
                </div>

                {lowBalanceAlerts && (
                  <div>
                    <Label htmlFor="threshold" className="text-base">Alert Threshold (₹)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={lowBalanceThreshold}
                      onChange={(e) => setLowBalanceThreshold(Number(e.target.value))}
                      placeholder="500"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You'll be notified when balance falls below this amount
                    </p>
                  </div>
                )}

                <Button onClick={saveNotificationPrefs} className="w-full sm:w-auto">
                  Save Wallet Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* NOTIFICATION SETTINGS */}
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 py-3">
                  <div className="flex-1">
                    <p className="font-medium text-base">Email Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive transaction updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 py-3 border-t">
                  <div className="flex-1">
                    <p className="font-medium text-base">Push Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get instant alerts on your device
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 py-3 border-t">
                  <div className="flex-1">
                    <p className="font-medium text-base">Expense Alerts</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Notify when new expenses are added
                    </p>
                  </div>
                  <Switch
                    checked={expenseAlerts}
                    onCheckedChange={setExpenseAlerts}
                  />
                </div>

                <Button onClick={saveNotificationPrefs} className="w-full sm:w-auto mt-4">
                  Save Notification Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* ACCOUNT SETTINGS */}
          <TabsContent value="account">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Account Information</h2>

              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-3xl">
                      {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium text-lg">{fullName || "No name set"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile?.email || "No email"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="full-name" className="text-base">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="avatar-url" className="text-base">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar-url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full sm:w-auto">
                  {savingProfile ? "Saving..." : "Save Profile"}
                </Button>

                <div className="pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push("/auth/login")
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="w-5 h-5" />
              Delete Group
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Type <strong>DELETE {groupName}</strong> to confirm:</Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`DELETE ${groupName}`}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteConfirmText("")
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              disabled={deleteConfirmText !== `DELETE ${groupName}`}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <Card className={`p-4 pr-6 shadow-lg border-l-4 ${
            toast.type === "success" ? "border-l-green-500 bg-green-50 dark:bg-green-950" :
            toast.type === "error" ? "border-l-red-500 bg-red-50 dark:bg-red-950" :
            "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === "success" && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
              {toast.type === "error" && <AlertCircleIcon className="w-5 h-5 text-red-600" />}
              {toast.type === "warning" && <AlertCircleIcon className="w-5 h-5 text-yellow-600" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
