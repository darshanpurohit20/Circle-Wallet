"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DownloadIcon,
  FileTextIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable" 

// TYPES
type Tx = {
  id: string
  group_id: string
  type: string
  description: string
  amount: number
  category: string
  paid_by: string | null
  paid_by_name: string | null
  merchant_name: string | null
  merchant_id: string | null
  split_type: string | null
  status: string
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
}


type Split = {
  id: string
  transaction_id: string
  member_id: string
  amount: number
  created_at: string
}


type Family = {
  id: string
  name: string
  total_contribution: number
  balance: number
}


type Member = {
  id: string
  family_id: string
  name: string
  avatar_url?: string
  member_type: string
  age?: number
  share_ratio: number
}


export default function ReportsPage() {
  const supabase = createClient()

  // =====================
  // STATE
  // =====================
  const [group, setGroup] = useState<any | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [transactions, setTransactions] = useState<Tx[]>([])
  const [splits, setSplits] = useState<Split[]>([])
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState("all")
  const [reportType, setReportType] = useState("summary")

  // =====================
  // LOAD DATA
  // =====================
  useEffect(() => {
    let mounted = true

    async function loadData() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id)
        .maybeSingle()

      if (!membership?.group_id) {
        setLoading(false)
        return
      }

      const groupId = membership.group_id

      const { data: groupData } = await supabase.from("groups").select("*").eq("id", groupId).single()
      const { data: familiesData } = await supabase.from("families").select("*").eq("group_id", groupId)
      const { data: membersData } = await supabase
        .from("family_members")
        .select("*")
        .in("family_id", (familiesData || []).map((f) => f.id))

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      const txIds = (txData || []).map((t) => t.id)

      const { data: splitsData } =
        txIds.length > 0
          ? await supabase.from("transaction_splits").select("*").in("transaction_id", txIds)
          : { data: [] }

      if (!mounted) return

      setGroup(groupData || null)
      setFamilies(familiesData || [])
      setMembers(membersData || [])
      setTransactions(txData || [])
      setSplits(splitsData || [])
      setLoading(false)
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [supabase])

  // =====================
  // FILTERED TRANSACTIONS
  // =====================
  const filteredTransactions = useMemo(() => {
    if (dateRange === "all") return transactions

    const now = new Date()
    const cutoff = new Date(now)

    if (dateRange === "7days") cutoff.setDate(now.getDate() - 7)
    if (dateRange === "30days") cutoff.setDate(now.getDate() - 30)
    if (dateRange === "90days") cutoff.setDate(now.getDate() - 90)

    return transactions.filter((t) => new Date(t.created_at) >= cutoff)
  }, [transactions, dateRange])

  // =====================
  // CATEGORY BREAKDOWN
  // =====================
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filteredTransactions
      .filter((t) => t.type === "payment" && t.status === "confirmed")
      .forEach((t) => map.set(t.category || "Other", (map.get(t.category || "Other") || 0) + Number(t.amount)))

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredTransactions])

  // =====================
  // MEMBER SPLIT TOTALS
  // =====================
  const memberBreakdown = useMemo(() => {
    const map = new Map<string, number>()

    splits.forEach((s) => {
      const tx = filteredTransactions.find((t) => t.id === s.transaction_id)
      if (!tx || tx.status !== "confirmed" || tx.type !== "payment") return

      const member = members.find((m) => m.id === s.member_id)
      const name = member ? member.name : s.member_id

      map.set(name, (map.get(name) || 0) + Number(s.amount))
    })

    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [splits, filteredTransactions, members])

  // =====================
  // TOTALS
  // =====================
  const totalDeposits = filteredTransactions
    .filter((t) => t.type === "deposit" && t.status === "confirmed")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalPayments = filteredTransactions
    .filter((t) => t.type === "payment" && t.status === "confirmed")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const formatINR = (amount = 0) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: group?.currency || "INR" }).format(amount)

  // =====================
  // EXPORT CSV
  // =====================
  const downloadCSV = () => {
    const headers = ["Date", "Type", "Description", "Category", "Merchant", "Amount", "Status", "Paid By"]

    const rows = filteredTransactions.map((t) => [
      new Date(t.created_at).toLocaleString(),
      t.type,
      t.description,
      t.category || "-",
      t.merchant_name || "-",
      Number(t.amount),
      t.status,
      t.paid_by_name || "-",
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `circle-wallet-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  // =====================
  // EXPORT PDF
  // =====================
const downloadPDF = () => {
  const doc = new jsPDF({ unit: "pt", format: "a4" })

  doc.setFontSize(14)
  doc.text(`${group?.name} — Transactions Report`, 40, 40)

  const rows = filteredTransactions.map((t) => [
    new Date(t.created_at).toLocaleDateString(),
    t.type,
    t.description,
    t.category || "-",
    t.merchant_name || "-",
    formatINR(Number(t.amount)),
    t.status,
    t.paid_by_name || "-",
  ])

  autoTable(doc, {  // use autoTable imported function, pass doc explicitly
    head: [["Date", "Type", "Desc", "Category", "Merchant", "Amount", "Status", "Paid By"]],
    body: rows,
    startY: 70,
  })

  doc.save(`circle-report-${new Date().toISOString().slice(0, 10)}.pdf`)
}

  // =====================
  // RENDER UI
  // =====================
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-8">Loading reports...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group?.name || "Group"} />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* FILTERS */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and download transaction insights</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={downloadCSV} className="gap-2">
              <DownloadIcon className="w-4 h-4" /> CSV
            </Button>

            <Button variant="outline" onClick={downloadPDF} className="gap-2">
              <FileTextIcon className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <WalletIcon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-xl font-bold">{formatINR(Number(group?.shared_wallet_balance || 0))}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <TrendingUpIcon className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-xl font-bold text-green-600">{formatINR(totalDeposits)}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <ReceiptIcon className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold text-red-600">{formatINR(totalPayments)}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <UsersIcon className="w-5 h-5" />
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold">{filteredTransactions.length}</p>
            </div>
          </Card>
        </div>

        {/* REPORT TABS */}
        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="family">By Family</TabsTrigger>
            <TabsTrigger value="member">By Member</TabsTrigger>
          </TabsList>

          {/* SUMMARY TAB */}
          <TabsContent value="summary">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>

                <div className="space-y-3">
                  {filteredTransactions.slice(0, 10).map((t) => (
                    <div key={t.id} className="border-b pb-2 last:border-none flex justify-between">
                      <div>
                        <p className="font-medium text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString()} • {t.category}
                        </p>
                      </div>
                      <span className={`font-semibold ${t.type === "deposit" ? "text-green-600" : "text-red-500"}`}>
                        {t.type === "deposit" ? "+" : "-"} {formatINR(Number(t.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {categoryBreakdown.map(([cat, amt]) => (
                    <div key={cat}>
                      <div className="flex justify-between">
                        <span>{cat}</span>
                        <span className="text-muted-foreground">{formatINR(amt)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded mt-1 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${((amt / (totalPayments || 1)) * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* CATEGORY TABLE */}
          <TabsContent value="category">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Category</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-right">% of Total</th>
                      <th className="py-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map(([cat, amt]) => {
                      const count = filteredTransactions.filter(
                        (t) => t.category === cat && t.type === "payment"
                      ).length

                      return (
                        <tr key={cat} className="border-b last:border-none">
                          <td className="py-2">{cat}</td>
                          <td className="py-2 text-right">{formatINR(amt)}</td>
                          <td className="py-2 text-right">{((amt / (totalPayments || 1)) * 100).toFixed(1)}%</td>
                          <td className="py-2 text-right">{count}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* FAMILY TAB */}
          <TabsContent value="family">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Family Contributions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Family</th>
                      <th className="py-2 text-right">Members</th>
                      <th className="py-2 text-right">Contributed</th>
                      <th className="py-2 text-right">Balance</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {families.map((f) => {
                      const count = members.filter((m) => m.family_id === f.id).length

                      return (
                        <tr key={f.id} className="border-b last:border-none">
                          <td className="py-2">{f.name}</td>
                          <td className="py-2 text-right">{count}</td>
                          <td className="py-2 text-right">{formatINR(f.total_contribution)}</td>
                          <td className="py-2 text-right">{formatINR(f.balance)}</td>
                          <td className="py-2 text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                f.balance >= 0 ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {f.balance >= 0 ? "Credit" : "Debit"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* MEMBER TAB */}
          <TabsContent value="member">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Member Spending</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Member</th>
                      <th className="py-2 text-right">Total Share</th>
                      <th className="py-2 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberBreakdown.map(([name, amt]) => (
                      <tr key={name} className="border-b last:border-none">
                        <td className="py-2">{name}</td>
                        <td className="py-2 text-right">{formatINR(amt)}</td>
                        <td className="py-2 text-right">{((amt / (totalPayments || 1)) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
