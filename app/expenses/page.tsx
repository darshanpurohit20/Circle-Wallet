"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

import { Header } from "@/components/dashboard/header"
import { ExpenseItem } from "@/components/dashboard/expense-item"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog"
import { ExpenseDetailDialog } from "@/components/expenses/expense-detail-dialog"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircleIcon, ReceiptIcon } from "@/components/icons"

export default function ExpensesPage() {
  const supabase = createClient()

  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [splitType, setSplitType] = useState("all")

  // -------------------------
  // FETCH DATA FROM SUPABASE
  // -------------------------
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      // 1. Get the group this user belongs to
      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id)
        .maybeSingle()

      if (!membership) return

      // 2. Load group
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", membership.group_id)
        .single()

      setGroup(groupData)

      // 3. Load families
      const { data: fams } = await supabase
        .from("families")
        .select("*, family_members(*)")
        .eq("group_id", membership.group_id)

      setFamilies(fams || [])

      // 4. Load transactions
      const { data: txns } = await supabase
        .from("transactions")
        .select("*")
        .eq("group_id", membership.group_id)
        .order("created_at", { ascending: false })

      setTransactions(txns || [])

      setLoading(false)
    }

    loadData()
  }, [])

  // -------------------------
  // LOADING STATE
  // -------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading expenses...
      </div>
    )
  }

  const allMembers = families.flatMap((f) => f.family_members || [])

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filteredExpenses = useMemo(() => {
    return transactions.filter((expense) => {
      if (search && !expense.description.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== "all" && expense.category !== category) return false
      if (status !== "all" && expense.status !== status) return false

      if (splitType !== "all") {
        if (splitType === "adults" && expense.split_type !== "adults") return false
        if (splitType === "children" && expense.split_type !== "children") return false
        if (splitType === "custom" && expense.split_type !== "custom") return false
      }

      return true
    })
  }, [transactions, search, category, status, splitType])

  const totalPending = transactions.filter((e) => e.status === "pending").length
  const totalConfirmed = transactions.filter((e) => e.status === "confirmed").length
  const pendingAmount = transactions
    .filter((e) => e.status === "pending")
    .reduce((acc, e) => acc + Number(e.amount), 0)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: group.currency }).format(amount)

  const handleExpenseClick = (expense: any) => {
    setSelectedExpense(expense)
    setDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Track and manage all group expenses</p>
          </div>

          <Button onClick={() => setAddExpenseOpen(true)} className="gap-2">
            <PlusCircleIcon className="w-4 h-4" /> Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold">{formatCurrency(group.total_spent || 0)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-xl font-bold">{formatCurrency(pendingAmount)}</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-xl font-bold">{totalConfirmed} expenses</p>
          </Card>
        </div>

        {/* Expense List */}
        <Card className="p-6">
          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            splitType={splitType}
            onSplitTypeChange={setSplitType}
            onClearFilters={() => {
              setSearch("")
              setCategory("all")
              setStatus("all")
              setSplitType("all")
            }}
          />

          <div className="mt-6 divide-y divide-border">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No expenses found</div>
            ) : (
              filteredExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={group.currency}
                  onClick={() => handleExpenseClick(expense)}
                />
              ))
            )}
          </div>
        </Card>
      </main>

      <AddExpenseDialog
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
        families={families}
        currency={group.currency}
        onSubmit={(data) => console.log("Add expense", data)}
      />

      <ExpenseDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        expense={selectedExpense}
        allMembers={allMembers}
        currency={group.currency}
        onConfirm={() => console.log("Confirm:", selectedExpense?.id)}
        onDelete={() => console.log("Delete:", selectedExpense?.id)}
      />
    </div>
  )
}
