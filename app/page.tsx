"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)

      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: gm } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", user.id)
          .maybeSingle()

        if (!gm) {
          router.push("/settings")
          return
        }

        const groupId = gm.group_id

        const { data: groupRow } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .maybeSingle()

        const { data: familyRows } = await supabase
          .from("families")
          .select("*, family_members(*)")
          .eq("group_id", groupId)

        const { data: trx } = await supabase
          .from("transactions")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (!mounted) return

        const normalizedFamilies = (familyRows || []).map((family) => ({
          id: family.id,
          name: family.name,
          balance: Number(family.balance || 0),
          totalContribution: Number(family.total_contribution || 0),
          members: (family.family_members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            type: m.member_type,
            age: m.age,
            shareRatio: Number(m.share_ratio),
            avatar: m.avatar || null,
          })),
        }))

        setGroup(groupRow || null)
        setFamilies(normalizedFamilies)
        setTransactions(trx || [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  useEffect(() => {
    if (!group) return
    
    const channel = supabase
      .channel("realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `group_id=eq.${group.id}` },
        (payload) => {
          const newRow = payload.new
          if (!newRow) return
          
          setTransactions((prev) => [newRow, ...prev].slice(0, 10))
          
          if (newRow.type === "deposit") {
            setGroup((g: any) => ({ 
              ...g, 
              shared_wallet_balance: Number(g.shared_wallet_balance || 0) + Number(newRow.amount || 0) 
            }))
          } else if (newRow.type === "payment") {
            setGroup((g: any) => ({ 
              ...g, 
              shared_wallet_balance: Number(g.shared_wallet_balance || 0) - Number(newRow.amount || 0),
              total_spent: Number(g.total_spent || 0) + Number(newRow.amount || 0)
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group, supabase])

  const totalMembers = families.reduce((acc, fam) => acc + fam.members.length, 0)
  const totalContributions = families.reduce((acc, fam) => acc + fam.totalContribution, 0)
  const totalExpenses = transactions
    .filter((t) => t.type !== "deposit")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length

  const handleAddFundsSubmit = async ({ 
    familyId, 
    amount 
  }: { 
    familyId?: string
    amount: number 
  }) => {
    if (!group) return

    try {
      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert({
          group_id: group.id,
          type: "deposit",
          description: familyId 
            ? `${families.find(f => f.id === familyId)?.name || "Family"} deposit`
            : "Group deposit",
          amount: amount,
          status: "confirmed",
          paid_by: null,
          paid_by_name: familyId 
            ? families.find(f => f.id === familyId)?.name 
            : "Group",
        })
        .select()
        .single()

      if (insertError) {
        alert("Failed to add funds. Please try again.")
        return
      }

      if (familyId) {
        const family = families.find(f => f.id === familyId)
        if (family) {
          const newFamilyBalance = Number(family.balance || 0) + Number(amount)
          const newFamilyContribution = Number(family.totalContribution || 0) + Number(amount)

          await supabase
            .from("families")
            .update({ 
              balance: newFamilyBalance,
              total_contribution: newFamilyContribution 
            })
            .eq("id", familyId)
        }
      }

      const newWalletBalance = Number(group.shared_wallet_balance || 0) + Number(amount)
      
      const { error: updateError } = await supabase
        .from("groups")
        .update({ shared_wallet_balance: newWalletBalance })
        .eq("id", group.id)

      if (updateError) {
        alert("Funds added but balance update failed. Please refresh.")
      } else {
        const { data: updatedFamilies } = await supabase
          .from("families")
          .select("*, family_members(*)")
          .eq("group_id", group.id)

        const normalizedFamilies = (updatedFamilies || []).map((family) => ({
          id: family.id,
          name: family.name,
          balance: Number(family.balance || 0),
          totalContribution: Number(family.total_contribution || 0),
          members: (family.family_members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            type: m.member_type,
            age: m.age,
            shareRatio: Number(m.share_ratio),
            avatar: m.avatar || null,
          })),
        }))

        setGroup((g: any) => ({ ...g, shared_wallet_balance: newWalletBalance }))
        setFamilies(normalizedFamilies)
        setTransactions((prev) => [inserted, ...prev].slice(0, 10))
      }

      setAddFundsOpen(false)
    } catch (error) {
      alert("An unexpected error occurred.")
    }
  }

  const handlePayMerchantSubmit = async (data: {
    merchantName: string
    amount: number
    description: string
    category: string
    splitType?: string
    splitAmong?: string[]
  }) => {
    if (!group) return

    try {
      let totalShares = 0
      let familySplits: { familyId: string; shares: number; amount: number }[] = []

      families.forEach(family => {
        let familyShares = 0
        
        family.members.forEach((member: any) => {
          let shouldInclude = false

          if (data.splitType === "everyone") {
            shouldInclude = true
          } else if (data.splitType === "adults") {
            shouldInclude = member.type === "adult"
          } else if (data.splitType === "kids") {
            shouldInclude = member.type !== "adult"
          } else if (data.splitType === "custom" && data.splitAmong) {
            shouldInclude = data.splitAmong.includes(member.id)
          } else {
            shouldInclude = true
          }

          if (shouldInclude) {
            familyShares += Number(member.shareRatio || 1)
          }
        })

        if (familyShares > 0) {
          totalShares += familyShares
          familySplits.push({
            familyId: family.id,
            shares: familyShares,
            amount: 0
          })
        }
      })

      familySplits = familySplits.map(split => ({
        ...split,
        amount: (split.shares / totalShares) * data.amount
      }))

      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert({
          group_id: group.id,
          type: "payment",
          description: data.description,
          amount: data.amount,
          merchant_name: data.merchantName,
          category: data.category,
          status: "confirmed",
          paid_by_name: "Group Wallet",
        })
        .select()
        .single()

      if (insertError) {
        alert("Payment failed. Please try again.")
        return
      }

      for (const split of familySplits) {
        const family = families.find(f => f.id === split.familyId)
        if (family) {
          const newFamilyBalance = Number(family.balance || 0) - split.amount

          await supabase
            .from("families")
            .update({ balance: newFamilyBalance })
            .eq("id", split.familyId)
        }
      }

      const newWalletBalance = Number(group.shared_wallet_balance || 0) - Number(data.amount)
      const newTotalSpent = Number(group.total_spent || 0) + Number(data.amount)

      const { error: updateError } = await supabase
        .from("groups")
        .update({
          shared_wallet_balance: newWalletBalance,
          total_spent: newTotalSpent,
        })
        .eq("id", group.id)

      if (updateError) {
        alert("Payment recorded but balance update failed. Please refresh.")
      } else {
        const { data: updatedFamilies } = await supabase
          .from("families")
          .select("*, family_members(*)")
          .eq("group_id", group.id)

        const normalizedFamilies = (updatedFamilies || []).map((family) => ({
          id: family.id,
          name: family.name,
          balance: Number(family.balance || 0),
          totalContribution: Number(family.total_contribution || 0),
          members: (family.family_members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            type: m.member_type,
            age: m.age,
            shareRatio: Number(m.share_ratio),
            avatar: m.avatar || null,
          })),
        }))

        setGroup((g: any) => ({ 
          ...g, 
          shared_wallet_balance: newWalletBalance, 
          total_spent: newTotalSpent 
        }))
        setFamilies(normalizedFamilies)
        setTransactions((prev) => [inserted, ...prev].slice(0, 10))
      }

      setPayMerchantOpen(false)
    } catch (error) {
      alert("An unexpected error occurred.")
    }
  }

  if (loading || !group)
    return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
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
                      onClick={() => {}}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions
              families={families}
              walletBalance={group.shared_wallet_balance}
            />

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
                  <FamilyCard key={family.id} family={family} onClick={() => {}} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

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
