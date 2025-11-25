"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { TransactionItem } from "@/components/dashboard/transaction-item"
import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockGroup, formatINR, type Transaction } from "@/lib/mock-data"
import { PlusCircleIcon, ReceiptIcon, XIcon } from "@/components/icons"

function SearchIconComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export default function TransactionsPage() {
  const [group] = useState(mockGroup)
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")

  const allMembers = group.families.flatMap((f) => f.members)

  const filteredTransactions = useMemo(() => {
    return group.transactions.filter((transaction) => {
      if (search && !transaction.description.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (transactionType !== "all" && transaction.type !== transactionType) {
        return false
      }
      if (status !== "all" && transaction.status !== status) {
        return false
      }
      if (category !== "all" && transaction.category !== category) {
        return false
      }
      return true
    })
  }, [group.transactions, search, transactionType, status, category])

  const handleClearFilters = () => {
    setSearch("")
    setTransactionType("all")
    setStatus("all")
    setCategory("all")
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailOpen(true)
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

  // Stats
  const totalDeposits = group.transactions
    .filter((t) => t.type === "deposit" && t.status === "confirmed")
    .reduce((acc, t) => acc + t.amount, 0)
  const totalPayments = group.transactions
    .filter((t) => t.type === "payment" && t.status === "confirmed")
    .reduce((acc, t) => acc + t.amount, 0)
  const pendingCount = group.transactions.filter((t) => t.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Track all wallet deposits and payments</p>
          </div>

          <Button onClick={() => setPayMerchantOpen(true)} className="gap-2">
            <PlusCircleIcon className="w-4 h-4" />
            Pay Merchant
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <PlusCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatINR(totalDeposits)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatINR(totalPayments)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-bold">{pendingCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-xl font-bold text-foreground">{pendingCount} transactions</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 md:p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>

            {(search || transactionType !== "all" || status !== "all" || category !== "all") && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-1">
                <XIcon className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-border">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <ReceiptIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <Button variant="outline" onClick={handleClearFilters} className="mt-4 bg-transparent">
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => handleTransactionClick(transaction)}
                />
              ))
            )}
          </div>
        </Card>
      </main>

      <PayMerchantDialog
        open={payMerchantOpen}
        onOpenChange={setPayMerchantOpen}
        families={group.families}
        walletBalance={group.sharedWalletBalance}
        onSubmit={handlePayMerchantSubmit}
      />

      <TransactionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={selectedTransaction}
        allMembers={allMembers}
        onApprove={() => console.log("Approve transaction:", selectedTransaction?.id)}
        onDecline={() => console.log("Decline transaction:", selectedTransaction?.id)}
      />
    </div>
  )
}
