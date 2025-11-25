"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Header } from "@/components/dashboard/header"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FamilyCard } from "@/components/dashboard/family-card"
import { TransactionItem } from "@/components/dashboard/transaction-item"
import { QuickActions } from "@/components/dashboard/quick-actions"

import { AddFundsDialog } from "@/components/wallet/add-funds-dialog"
import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon } from "@/components/icons"

import Link from "next/link"

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)

  // -------------------------------
  // STEP 1: LOAD USER + GROUP
  // -------------------------------
  useEffect(() => {
    let mounted = true

    ;(async () => {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Find user's group
      const { data: gm } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id)
        .maybeSingle()

      if (!gm?.group_id) {
        alert("You are not part of any group.")
        return
      }

      const groupId = gm.group_id

      // Fetch group info
      const { data: groupRow } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .maybeSingle()

      // Fetch families + members
      const { data: familyRows } = await supabase
        .from("families")
        .select("*, family_members(*)")
        .eq("group_id", groupId)

      // Fetch last 5 transactions
      const { data: trx } = await supabase
        .from("transactions")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (mounted) {
        setGroup(groupRow)
        setFamilies(familyRows || [])
        setTransactions(trx || [])
      }

      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [])

  // -------------------------------
  // STEP 2: REALTIME UPDATES
  // -------------------------------
  useEffect(() => {
    if (!group) return

    const channel = supabase
      .channel("realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `group_id=eq.${group.id}` },
        (payload) => {
          const newRow = payload.new
          if (!newRow) return
          setTransactions((prev) => [newRow, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group])

  // -------------------------------
  // COMPUTED STATS
  // -------------------------------
  const totalMembers = families.reduce(
    (acc, fam) => acc + fam.family_members.length,
    0
  )

  const totalContributions = families.reduce(
    (acc, fam) => acc + (fam.initial_contribution || 0),
    0
  )

  const pendingTransactions = transactions.filter((t) => t.status === "pending").length

  // -------------------------------
  // FUND ADD / MERCHANT PAY HANDLERS
  // -------------------------------
  const handleAddFundsSubmit = async ({
    familyId,
    amount,
  }: {
    familyId: string
    amount: number
  }) => {
    if (!group) return

    // Add a deposit transaction
    await supabase.from("transactions").insert({
      group_id: group.id,
      type: "deposit",
      description: "Family deposit",
      amount,
      status: "confirmed",
    })

    // Update wallet balance
    await supabase
      .from("groups")
      .update({
        shared_wallet_balance: Number(group.shared_wallet_balance || 0) + Number(amount),
      })
      .eq("id", group.id)

    setAddFundsOpen(false)
  }

  const handlePayMerchantSubmit = async (data: {
    merchantName: string
    amount: number
    description: string
    category: string
  }) => {
    if (!group) return

    // Insert payment
    await supabase.from("transactions").insert({
      group_id: group.id,
      type: "payment",
      description: data.description,
      amount: data.amount,
      merchant_name: data.merchantName,
      category: data.category,
      status: "confirmed",
    })

    // Deduct from wallet
    await supabase
      .from("groups")
      .update({
        shared_wallet_balance:
          Number(group.shared_wallet_balance || 0) - Number(data.amount),
      })
      .eq("id", group.id)

    setPayMerchantOpen(false)
  }

  if (loading || !group)
    return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Group Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            <WalletCard
              balance={group.shared_wallet_balance}
              totalContributions={totalContributions}
              totalSpent={group.total_spent || 0}
              onAddFunds={() => setAddFundsOpen(true)}
              onPayMerchant={() => setPayMerchantOpen(true)}
            />

            <StatsCards
              totalMembers={totalMembers}
              totalSpent={group.total_spent || 0}
              walletBalance={group.shared_wallet_balance}
              pendingApprovals={pendingTransactions}
            />

            {/* Recent Transactions */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/transactions">
                    View All <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <p className="text-sm py-3 text-muted-foreground">No recent transactions</p>
                ) : (
                  transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => console.log("Clicked:", transaction.id)}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <QuickActions
              families={families}
              walletBalance={group.shared_wallet_balance}
            />

            {/* Families */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Families & Members</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/members">
                    Manage <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {families.map((family) => (
                  <FamilyCard
                    key={family.id}
                    family={{
                      id: family.id,
                      name: family.name,
                      members: family.family_members,
                      totalContribution: family.initial_contribution || 0,
                    }}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddFundsDialog
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        families={families}
        onSubmit={handleAddFundsSubmit}
      />

      <PayMerchantDialog
        open={payMerchantOpen}
        onOpenChange={setPayMerchantOpen}
        families={families}
        walletBalance={group.shared_wallet_balance}
        onSubmit={handlePayMerchantSubmit}
      />
    </div>
  )
}
