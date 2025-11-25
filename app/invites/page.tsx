"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Header } from "@/components/dashboard/header"
import { InviteMemberDialog } from "@/components/invites/invite-member-dialog"
import { PendingInvites } from "@/components/invites/pending-invites"
import { PermissionsSettings } from "@/components/invites/permissions-settings"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlusIcon } from "@/components/icons"

export default function InvitesPage() {
  const supabase = createClient()

  const [group, setGroup] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // ----------------------------------
  // FETCH DATA FROM SUPABASE
  // ----------------------------------
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      // If not logged in → redirect
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      // 1. Find which group user belongs to
      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id)
        .maybeSingle()

      if (!membership) {
        setLoading(false)
        return
      }

      const groupId = membership.group_id

      // 2. Load group
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single()

      setGroup(groupData)

      // 3. Load invites
      const { data: invitesData } = await supabase
        .from("invites")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      setInvites(invitesData || [])

      // 4. Settings are already inside group row
      setSettings({
        largePaymentThreshold: groupData.large_payment_threshold,
        requireApprovalAboveThreshold: groupData.require_approval_above_threshold,
        allowMemberInvites: groupData.allow_member_invites,
        defaultMemberRole: groupData.default_member_role,
      })

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading...</div>
  }

  // ----------------------------------
  // INVITE MANAGEMENT
  // ----------------------------------

  const handleInviteSubmit = async (data: { method: string; contact: string; role: string }) => {
    const payload = {
      group_id: group.id,
      email: data.method === "email" ? data.contact : null,
      phone: data.method === "phone" ? data.contact : null,
      role: data.role,
      status: "pending",
      invited_by: group.created_by,
      invited_by_name: "Admin",
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    }

    await supabase.from("invites").insert(payload)
    setInvites((prev) => [payload, ...prev])
    setInviteDialogOpen(false)
  }

  const handleResendInvite = async (inviteId: string) => {
    console.log("Resend invite", inviteId)
    // optionally: update expires_at
  }

  const handleCancelInvite = async (inviteId: string) => {
    await supabase.from("invites").delete().eq("id", inviteId)
    setInvites((prev) => prev.filter((i) => i.id !== inviteId))
  }

  // ----------------------------------
  // SETTINGS UPDATE
  // ----------------------------------

  const handleSettingsChange = async (newSettings: any) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    await supabase
      .from("groups")
      .update({
        large_payment_threshold: updated.largePaymentThreshold,
        require_approval_above_threshold: updated.requireApprovalAboveThreshold,
        allow_member_invites: updated.allowMemberInvites,
        default_member_role: updated.defaultMemberRole,
      })
      .eq("id", group.id)
  }

  const pendingInvites = invites.filter((i) => i.status === "pending")
  const expiredInvites = invites.filter((i) => i.status === "expired")

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group?.name || "Group"} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Invites & Permissions</h1>
            <p className="text-muted-foreground">Manage invitations and group settings</p>
          </div>

          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Invite Someone
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invites" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invites">
              Invitations
              {pendingInvites.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingInvites.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Invitations Tab */}
          <TabsContent value="invites" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Pending Invitations</h2>
              <PendingInvites
                invites={pendingInvites}
                onResend={handleResendInvite}
                onCancel={handleCancelInvite}
              />
            </div>

            {expiredInvites.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Expired Invitations</h2>
                <PendingInvites
                  invites={expiredInvites}
                  onResend={handleResendInvite}
                  onCancel={handleCancelInvite}
                />
              </div>
            )}
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <PermissionsSettings
              settings={settings}
              currency={group.currency}
              onSettingsChange={handleSettingsChange}
            />
          </TabsContent>
        </Tabs>
      </main>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSubmit={handleInviteSubmit}
      />
    </div>
  )
}
