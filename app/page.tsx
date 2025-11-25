"use client"

import { useState } from "react"
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
import { mockGroup } from "@/lib/mock-data"
import { ChevronRightIcon } from "@/components/icons"
import Link from "next/link"

export default function Dashboard() {
  const [group] = useState(mockGroup)
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)

  const totalMembers = group.families.reduce((acc, fam) => acc + fam.members.length, 0)
  const totalContributions = group.families.reduce((acc, fam) => acc + fam.totalContribution, 0)
  const pendingTransactions = group.transactions.filter((t) => t.status === "pending").length

  const handleAddFundsSubmit = (data: { familyId: string; amount: number; method: string }) => {
    console.log("Adding funds:", data)
  }

  const handlePayMerchantSubmit = (data: {
    merchantName: string
    merchantUpi?: string
    amount: number
    description: string
    category: string
    splitType: string
    splitAmong: string[]
  }) => {
    console.log("Paying merchant:", data)
  }

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
              balance={group.sharedWalletBalance}
              totalContributions={totalContributions}
              totalSpent={group.totalSpent}
              onAddFunds={() => setAddFundsOpen(true)}
              onPayMerchant={() => setPayMerchantOpen(true)}
            />

            <StatsCards
              totalMembers={totalMembers}
              totalSpent={group.totalSpent}
              walletBalance={group.sharedWalletBalance}
              pendingApprovals={pendingTransactions}
            />

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/transactions">
                    View All
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-border">
                {group.transactions.slice(0, 5).map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => console.log("Transaction clicked:", transaction.id)}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions families={group.families} walletBalance={group.sharedWalletBalance} />

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Families & Members</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/members">
                    Manage
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {group.families.map((family) => (
                  <FamilyCard
                    key={family.id}
                    family={family}
                    onClick={() => console.log("Family clicked:", family.id)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <AddFundsDialog
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        families={group.families}
        onSubmit={handleAddFundsSubmit}
      />

      <PayMerchantDialog
        open={payMerchantOpen}
        onOpenChange={setPayMerchantOpen}
        families={group.families}
        walletBalance={group.sharedWalletBalance}
        onSubmit={handlePayMerchantSubmit}
      />
    </div>
  )
}
