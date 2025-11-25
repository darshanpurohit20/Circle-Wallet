"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGroup, formatINR } from "@/lib/mock-data"
import { CheckCircleIcon, XIcon, ClockIcon, UsersIcon, ReceiptIcon, SettingsIcon } from "@/components/icons"

export default function AdminPage() {
  const [group] = useState(mockGroup)
  const [activeTab, setActiveTab] = useState("pending")

  const pendingTransactions = group.transactions.filter((t) => t.status === "pending")
  const allMembers = group.families.flatMap((f) => f.members)

  const handleApprove = (transactionId: string) => {
    console.log("Approving transaction:", transactionId)
  }

  const handleDecline = (transactionId: string) => {
    console.log("Declining transaction:", transactionId)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage approvals, members, and group settings</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-foreground">{pendingTransactions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-xl font-bold text-foreground">{allMembers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-xl font-bold text-foreground">{formatINR(group.sharedWalletBalance)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Threshold</p>
                <p className="text-xl font-bold text-foreground">{formatINR(group.settings.largePaymentThreshold)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <ClockIcon className="w-4 h-4" />
              Pending Approvals
              {pendingTransactions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                  {pendingTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <UsersIcon className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
              {pendingTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">All caught up! No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {transaction.merchantName || `Paid by ${transaction.paidByName}`} •{" "}
                            {new Date(transaction.date).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{formatINR(transaction.amount)}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecline(transaction.id)}
                            className="text-destructive"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(transaction.id)}>
                            <CheckCircleIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Group Members</h2>
              <div className="space-y-4">
                {group.families.map((family) => (
                  <div key={family.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{family.name}</h3>
                      <Badge variant="outline">{formatINR(family.totalContribution)} contributed</Badge>
                    </div>
                    <div className="space-y-2">
                      {family.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {member.type} • {(member.shareRatio * 100).toFixed(0)}% share
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Group Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Large Payment Threshold</p>
                    <p className="text-sm text-muted-foreground">Payments above this amount require admin approval</p>
                  </div>
                  <Badge variant="secondary">{formatINR(group.settings.largePaymentThreshold)}</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Require Approval Above Threshold</p>
                    <p className="text-sm text-muted-foreground">Automatically require approval for large payments</p>
                  </div>
                  <Badge variant={group.settings.requireApprovalAboveThreshold ? "default" : "secondary"}>
                    {group.settings.requireApprovalAboveThreshold ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Allow Member Invites</p>
                    <p className="text-sm text-muted-foreground">Allow regular members to invite others</p>
                  </div>
                  <Badge variant={group.settings.allowMemberInvites ? "default" : "secondary"}>
                    {group.settings.allowMemberInvites ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Default Member Role</p>
                    <p className="text-sm text-muted-foreground">Role assigned to new members by default</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {group.settings.defaultMemberRole}
                  </Badge>
                </div>

                <Button className="mt-4">Edit Settings</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
