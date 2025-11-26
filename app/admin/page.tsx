"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatINR } from "@/lib/mock-data"
import {
  CheckCircleIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  ReceiptIcon,
  SettingsIcon,
} from "@/components/icons"

const GROUP_ID = "PUT-YOUR-GROUP-ID-HERE" // <— IMPORTANT
const supabase = createClient()
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pending")

  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  // -----------------------------
  // 🚀 FETCH ALL DATA FROM SUPABASE
  // -----------------------------
  const loadData = async () => {
    // 1️⃣ Fetch group info
    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", GROUP_ID)
      .single()

    setGroup(groupData)

    // 2️⃣ Fetch families
    const { data: familiesData } = await supabase
      .from("families")
      .select("*")
      .eq("group_id", GROUP_ID)

    setFamilies(familiesData || [])

    // 3️⃣ Fetch family members
    const { data: membersData } = await supabase
      .from("family_members")
      .select("*")
      .in(
        "family_id",
        (familiesData || []).map((f) => f.id)
      )

    setMembers(membersData || [])

    // 4️⃣ Fetch transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("group_id", GROUP_ID)
      .order("created_at", { ascending: false })

    setTransactions(txData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!group) return <p className="p-10">Loading admin panel...</p>

  // -----------------------------
  // 🧮 COMPUTED ITEMS
  // -----------------------------
  const pendingTransactions = transactions.filter((t) => t.status === "pending")
  const allMembers = members

  // -----------------------------
  // ✔ APPROVE / DECLINE LOGIC
  // -----------------------------
  const handleApprove = async (transactionId: string) => {
    await supabase
      .from("transactions")
      .update({
        status: "confirmed",
        approved_at: new Date().toISOString(),
        approved_by: group.created_by,
      })
      .eq("id", transactionId)

    loadData()
  }

  const handleDecline = async (transactionId: string) => {
    await supabase
      .from("transactions")
      .update({ status: "declined" })
      .eq("id", transactionId)

    loadData()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage approvals, members, and group settings</p>
        </div>

        {/* 📊 ADMIN STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm">Pending</p>
                <p className="text-xl font-bold">{pendingTransactions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm">Members</p>
                <p className="text-xl font-bold">{allMembers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm">Wallet Balance</p>
                <p className="text-xl font-bold">
                  {formatINR(group.shared_wallet_balance)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm">Approval Threshold</p>
                <p className="text-xl font-bold">
                  {formatINR(group.large_payment_threshold)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ----------------------- */}
        {/*     TABS SECTION        */}
        {/* ----------------------- */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <ClockIcon className="w-4 h-4" /> Pending Approvals
              {pendingTransactions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                  {pendingTransactions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <UsersIcon className="w-4 h-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* 🔶 Pending Approvals */}
          <TabsContent value="pending">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>

              {pendingTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p>No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{tx.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {tx.merchant_name || `Paid by ${tx.paid_by_name}`} •{" "}
                            {new Date(tx.created_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{formatINR(tx.amount)}</span>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDecline(tx.id)}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(tx.id)}>
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

          {/* 👨‍👩‍👧 Members */}
          <TabsContent value="members">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Group Members</h2>

              <div className="space-y-4">
                {families.map((family) => (
                  <div key={family.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{family.name}</h3>
                      <Badge variant="outline">
                        {formatINR(family.total_contribution)} contributed
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {members
                        .filter((m) => m.family_id === family.id)
                        .map((member) => (
                          <div key={member.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {member.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {member.member_type}
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

          {/* ⚙ Settings */}
          <TabsContent value="settings">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Group Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Large Payment Threshold</p>
                    <p className="text-sm text-muted-foreground">
                      Payments above this amount require admin approval
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatINR(group.large_payment_threshold)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Require Approval Above Threshold</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically require approval for large payments
                    </p>
                  </div>
                  <Badge variant={group.require_approval_above_threshold ? "default" : "secondary"}>
                    {group.require_approval_above_threshold ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Allow Member Invites</p>
                    <p className="text-sm text-muted-foreground">
                      Allow non-admins to invite people
                    </p>
                  </div>
                  <Badge variant={group.allow_member_invites ? "default" : "secondary"}>
                    {group.allow_member_invites ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
