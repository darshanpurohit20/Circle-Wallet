"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { TransactionItem } from "@/components/dashboard/transaction-item"
import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XIcon, PlusCircleIcon, ReceiptIcon } from "@/components/icons"

type SupaTransaction = {
  id: string
  group_id: string
  type: string
  description: string
  amount: number
  category: string | null
  paid_by: string | null
  paid_by_name: string | null
  merchant_name: string | null
  merchant_id: string | null
  split_type: string | null
  status: string
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  receipt_url?: string | null
  created_at: string
  updated_at: string
}

export default function TransactionsPage() {
  const supabase = createClient()
  const router = useRouter()

  // UI state
  const [groupId, setGroupId] = useState<string | null>(null)
  const [group, setGroup] = useState<any | null>(null)
  const [transactions, setTransactions] = useState<SupaTransaction[]>([])
  const [search, setSearch] = useState("")
  const [transactionType, setTransactionType] = useState("all")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<SupaTransaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // helper: get current user and group
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        const user = userData?.user
        if (!user) {
          // not logged in: redirect to login
          router.push("/auth/login")
          return
        }

        // get group_id from group_members
        const { data: gm, error: gmError } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", user.id)
          .maybeSingle()

        if (gmError) throw gmError
        const gid = gm?.group_id ?? null
        if (!gid) {
          // user not in group — optionally redirect / show message
          if (mounted) {
            setGroupId(null)
            setGroup(null)
            setTransactions([])
          }
          setLoading(false)
          return
        }

        // fetch group details (balance, thresholds, name)
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("*")
          .eq("id", gid)
          .maybeSingle()
        if (groupError) throw groupError

        if (mounted) {
          setGroupId(gid)
          setGroup(groupData)
        }

        // initial fetch of latest 50 transactions
        await fetchTransactions(gid)
      } catch (e) {
        console.error("Init error", e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // realtime subscription: updates when transactions change for this group
  useEffect(() => {
    if (!groupId) return
    // create channel
    const channel = supabase
      .channel(`public:transactions:group=${groupId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `group_id=eq.${groupId}` },
        (payload) => {
          // handle INSERT / UPDATE / DELETE
          const ev = payload.eventType
          const row = payload.new ?? payload.old
          if (!row) return

          setTransactions((prev) => {
            if (ev === "INSERT") {
              // insert at top
              return [row as SupaTransaction, ...prev].slice(0, 50)
            }
            if (ev === "UPDATE") {
              return prev.map((t) => (t.id === row.id ? (row as SupaTransaction) : t))
            }
            if (ev === "DELETE") {
              return prev.filter((t) => t.id !== row.id)
            }
            return prev
          })
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // console.log("Subscribed to transactions realtime")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  // fetch function used on init and when user triggers refresh
  const fetchTransactions = async (gid?: string) => {
    if (!gid && !groupId) return
    const gidToUse = gid ?? groupId!
    setLoading(true)
    try {
      // limit 50, newest first
      const { data, error } = await supabase
        .from<SupaTransaction>("transactions")
        .select("*")
        .eq("group_id", gidToUse)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setTransactions(data ?? [])
    } catch (e) {
      console.error("fetchTransactions error", e)
    } finally {
      setLoading(false)
    }
  }

  // Approve / Decline functions: update transaction in DB
  const handleApprove = async (transactionId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return
      const approver = userData.user.id

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "confirmed",
          approved_by: approver,
          approved_at: new Date().toISOString(),
        })
        .eq("id", transactionId)

      if (error) throw error
      // update is reflected via realtime subscription
    } catch (e) {
      console.error("approve error", e)
      alert("Could not approve transaction")
    }
  }

  const handleDecline = async (transactionId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return
      const approver = userData.user.id

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "declined",
          approved_by: approver,
          approved_at: new Date().toISOString(),
        })
        .eq("id", transactionId)

      if (error) throw error
    } catch (e) {
      console.error("decline error", e)
      alert("Could not decline transaction")
    }
  }

  // Pay merchant: insert transaction and (if confirmed) update group balance
  const handlePayMerchantSubmit = async (data: {
    merchantName: string
    merchantUpi?: string
    amount: number
    description: string
    category: string
    splitType: string
    splitAmong: string[]
  }) => {
    if (!groupId || !group) {
      alert("Group not loaded")
      return
    }
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        router.push("/auth/login")
        return
      }
      const user = userData.user

      // determine requires_approval & initial status
      const requiresApproval =
        group.require_approval_above_threshold && Number(data.amount) >= Number(group.large_payment_threshold)
      const initialStatus = requiresApproval ? "pending" : "confirmed"

      // insert transaction row
      const { error: insertError } = await supabase.from("transactions").insert({
        group_id: groupId,
        type: "payment",
        description: data.description,
        amount: data.amount,
        category: data.category || null,
        paid_by: null,
        paid_by_name: user.email ?? user.id,
        merchant_name: data.merchantName,
        merchant_id: data.merchantUpi ?? null,
        split_type: data.splitType,
        status: initialStatus,
        requires_approval: requiresApproval,
      })

      if (insertError) throw insertError

      // If the payment is auto-confirmed, deduct from group.shared_wallet_balance
      if (!requiresApproval) {
        const newBalance = Number(group.shared_wallet_balance) - Number(data.amount)
        const { error: updateGroupErr } = await supabase
          .from("groups")
          .update({ shared_wallet_balance: newBalance })
          .eq("id", groupId)
        if (updateGroupErr) throw updateGroupErr
        // refresh local group
        setGroup((g: any) => ({ ...g, shared_wallet_balance: newBalance }))
      }

      setPayMerchantOpen(false)
      // transactions list will update via realtime
    } catch (e) {
      console.error("pay merchant error", e)
      alert("Could not submit payment")
    }
  }

  // client-side filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) return false
      if (transactionType !== "all" && tx.type !== transactionType) return false
      if (status !== "all" && tx.status !== status) return false
      if (category !== "all" && (tx.category ?? "other") !== category) return false
      return true
    })
  }, [transactions, search, transactionType, status, category])

  // stats
  const totalDeposits = useMemo(
    () => transactions.filter((t) => t.type === "deposit" && t.status === "confirmed").reduce((a, b) => a + b.amount, 0),
    [transactions],
  )
  const totalPayments = useMemo(
    () => transactions.filter((t) => t.type === "payment" && t.status === "confirmed").reduce((a, b) => a + b.amount, 0),
    [transactions],
  )
  const pendingCount = transactions.filter((t) => t.status === "pending").length

  // small UI helper
  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: group?.currency ?? "INR" }).format(amount)

  // UI handlers
  const handleClearFilters = () => {
    setSearch("")
    setTransactionType("all")
    setStatus("all")
    setCategory("all")
  }

  const handleTransactionClick = (tx: SupaTransaction) => {
    setSelectedTransaction(tx)
    setDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group?.name ?? "Circle Wallet"} />

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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* gather existing categories from transactions */}
                {[...new Set(transactions.map((t) => t.category || "Other"))].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
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
            {loading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : filteredTransactions.length === 0 ? (
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
                  transaction={transaction as any}
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
        families={group?.families ?? []}
        walletBalance={group?.shared_wallet_balance ?? 0}
        onSubmit={handlePayMerchantSubmit}
      />

      <TransactionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={selectedTransaction as any}
        allMembers={group?.families?.flatMap((f: any) => f.members) ?? []}
        onApprove={() => selectedTransaction && handleApprove(selectedTransaction.id)}
        onDecline={() => selectedTransaction && handleDecline(selectedTransaction.id)}
      />
    </div>
  )
}
