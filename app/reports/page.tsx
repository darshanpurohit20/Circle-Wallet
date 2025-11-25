"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGroup, formatINR } from "@/lib/mock-data"
import { DownloadIcon, FileTextIcon, ReceiptIcon, TrendingUpIcon, UsersIcon, WalletIcon } from "@/components/icons"

export default function ReportsPage() {
  const [group] = useState(mockGroup)
  const [dateRange, setDateRange] = useState("all")
  const [reportType, setReportType] = useState("summary")

  const allMembers = group.families.flatMap((f) => f.members)

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (dateRange === "all") return group.transactions

    const now = new Date()
    const filterDate = new Date()

    switch (dateRange) {
      case "7days":
        filterDate.setDate(now.getDate() - 7)
        break
      case "30days":
        filterDate.setDate(now.getDate() - 30)
        break
      case "90days":
        filterDate.setDate(now.getDate() - 90)
        break
      default:
        return group.transactions
    }

    return group.transactions.filter((t) => new Date(t.date) >= filterDate)
  }, [group.transactions, dateRange])

  // Calculate stats
  const totalDeposits = filteredTransactions
    .filter((t) => t.type === "deposit" && t.status === "confirmed")
    .reduce((acc, t) => acc + t.amount, 0)

  const totalPayments = filteredTransactions
    .filter((t) => t.type === "payment" && t.status === "confirmed")
    .reduce((acc, t) => acc + t.amount, 0)

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    filteredTransactions
      .filter((t) => t.type === "payment" && t.status === "confirmed")
      .forEach((t) => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount
      })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [filteredTransactions])

  const familyContributions = useMemo(() => {
    return group.families.map((family) => ({
      name: family.name,
      contribution: family.totalContribution,
      balance: family.balance,
      members: family.members.length,
    }))
  }, [group.families])

  const memberSplits = useMemo(() => {
    const splits: Record<string, number> = {}

    filteredTransactions
      .filter((t) => t.type === "payment" && t.status === "confirmed" && t.splitAmong.length > 0)
      .forEach((t) => {
        const membersInSplit = allMembers.filter((m) => t.splitAmong.includes(m.id))
        const totalRatio = membersInSplit.reduce((acc, m) => acc + m.shareRatio, 0)

        membersInSplit.forEach((member) => {
          const share = (t.amount * member.shareRatio) / totalRatio
          splits[member.name] = (splits[member.name] || 0) + share
        })
      })

    return Object.entries(splits).sort((a, b) => b[1] - a[1])
  }, [filteredTransactions, allMembers])

  // Download functions
  const downloadCSV = () => {
    const headers = ["Date", "Type", "Description", "Category", "Merchant", "Amount", "Status", "Paid By"]
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type,
      t.description,
      t.category,
      t.merchantName || "-",
      t.amount.toString(),
      t.status,
      t.paidByName,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `circle-wallet-transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const downloadPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF
    console.log("Generating PDF report...")
    alert("PDF download would be implemented with a library like jsPDF or server-side generation.")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">View and download transaction reports</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={downloadCSV} className="gap-2 bg-transparent">
              <DownloadIcon className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={downloadPDF} className="gap-2 bg-transparent">
              <FileTextIcon className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-xl font-bold text-foreground">{formatINR(group.sharedWalletBalance)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatINR(totalPayments)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-xl font-bold text-foreground">{filteredTransactions.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="family">By Family</TabsTrigger>
            <TabsTrigger value="member">By Member</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 10).map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-IN")} • {t.category}
                        </p>
                      </div>
                      <span
                        className={`font-semibold ${
                          t.type === "deposit" ? "text-green-600 dark:text-green-400" : "text-foreground"
                        }`}
                      >
                        {t.type === "deposit" ? "+" : "-"}
                        {formatINR(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {categoryBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No spending data available</p>
                  ) : (
                    categoryBreakdown.map(([category, amount]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">{formatINR(amount)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(amount / totalPayments) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="category">
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Category</th>
                      <th className="text-right py-3 px-2 font-medium">Amount</th>
                      <th className="text-right py-3 px-2 font-medium">% of Total</th>
                      <th className="text-right py-3 px-2 font-medium">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map(([category, amount]) => {
                      const count = filteredTransactions.filter(
                        (t) => t.category === category && t.type === "payment",
                      ).length
                      return (
                        <tr key={category} className="border-b last:border-0">
                          <td className="py-3 px-2">{category}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatINR(amount)}</td>
                          <td className="py-3 px-2 text-right text-muted-foreground">
                            {((amount / totalPayments) * 100).toFixed(1)}%
                          </td>
                          <td className="py-3 px-2 text-right">{count}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50">
                      <td className="py-3 px-2 font-semibold">Total</td>
                      <td className="py-3 px-2 text-right font-semibold">{formatINR(totalPayments)}</td>
                      <td className="py-3 px-2 text-right font-semibold">100%</td>
                      <td className="py-3 px-2 text-right font-semibold">
                        {filteredTransactions.filter((t) => t.type === "payment").length}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Family Contributions & Balances</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Family</th>
                      <th className="text-right py-3 px-2 font-medium">Members</th>
                      <th className="text-right py-3 px-2 font-medium">Contributed</th>
                      <th className="text-right py-3 px-2 font-medium">Balance</th>
                      <th className="text-right py-3 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyContributions.map((family) => (
                      <tr key={family.name} className="border-b last:border-0">
                        <td className="py-3 px-2 font-medium">{family.name}</td>
                        <td className="py-3 px-2 text-right">{family.members}</td>
                        <td className="py-3 px-2 text-right">{formatINR(family.contribution)}</td>
                        <td className="py-3 px-2 text-right font-medium">{formatINR(family.balance)}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant={family.balance >= 0 ? "default" : "destructive"}>
                            {family.balance >= 0 ? "Credit" : "Debit"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="member">
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Individual Member Spending</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Amount each member owes based on their share ratio in split transactions
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Member</th>
                      <th className="text-right py-3 px-2 font-medium">Total Share</th>
                      <th className="text-right py-3 px-2 font-medium">% of Spending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberSplits.map(([name, amount]) => (
                      <tr key={name} className="border-b last:border-0">
                        <td className="py-3 px-2 font-medium">{name}</td>
                        <td className="py-3 px-2 text-right">{formatINR(amount)}</td>
                        <td className="py-3 px-2 text-right text-muted-foreground">
                          {((amount / totalPayments) * 100).toFixed(1)}%
                        </td>
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
