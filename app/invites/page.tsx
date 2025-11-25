"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { InviteMemberDialog } from "@/components/invites/invite-member-dialog"
import { PendingInvites } from "@/components/invites/pending-invites"
import { PermissionsSettings } from "@/components/invites/permissions-settings"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGroup, mockInvites, mockGroupSettings, type GroupSettings } from "@/lib/mock-data"
import { UserPlusIcon } from "@/components/icons"

export default function InvitesPage() {
  const [group] = useState(mockGroup)
  const [invites, setInvites] = useState(mockInvites)
  const [settings, setSettings] = useState(mockGroupSettings)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const handleInviteSubmit = (data: { method: string; contact: string; role: string }) => {
    console.log("Sending invite:", data)
    // Would add new invite to the list
  }

  const handleResendInvite = (inviteId: string) => {
    console.log("Resending invite:", inviteId)
  }

  const handleCancelInvite = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId))
  }

  const handleSettingsChange = (newSettings: Partial<GroupSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const pendingInvites = invites.filter((i) => i.status === "pending")
  const expiredInvites = invites.filter((i) => i.status === "expired")

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Invites & Permissions</h1>
            <p className="text-muted-foreground">Manage invitations and group settings</p>
          </div>

          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Invite Someone
          </Button>
        </div>

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

          <TabsContent value="invites" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Pending Invitations</h2>
              <PendingInvites invites={pendingInvites} onResend={handleResendInvite} onCancel={handleCancelInvite} />
            </div>

            {expiredInvites.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Expired Invitations</h2>
                <PendingInvites invites={expiredInvites} onResend={handleResendInvite} onCancel={handleCancelInvite} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsSettings
              settings={settings}
              currency={group.currency}
              onSettingsChange={handleSettingsChange}
            />
          </TabsContent>
        </Tabs>
      </main>

      <InviteMemberDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} onSubmit={handleInviteSubmit} />
    </div>
  )
}
