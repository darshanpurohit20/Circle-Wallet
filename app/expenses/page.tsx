"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { ExpenseItem } from "@/components/dashboard/expense-item"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog"
import { ExpenseDetailDialog } from "@/components/expenses/expense-detail-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { mockGroup, type Expense } from "@/lib/mock-data"
import { PlusCircleIcon, ReceiptIcon } from "@/components/icons"

export default function ExpensesPage() {
  const [group] = useState(mockGroup)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [splitType, setSplitType] = useState("all")

  const allMembers = group.families.flatMap((f) => f.members)

  const filteredExpenses = useMemo(() => {
    return group.expenses.filter((expense) => {
      if (search && !expense.description.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (category !== "all" && expense.category !== category) {
        return false
      }
      if (status !== "all" && expense.status !== status) {
        return false
      }
      if (splitType !== "all") {
        if (splitType === "all-members" && expense.splitType !== "all") return false
        if (splitType === "adults" && expense.splitType !== "adults") return false
        if (splitType === "children" && expense.splitType !== "children") return false
        if (splitType === "custom" && expense.splitType !== "custom") return false
      }
      return true
    })
  }, [group.expenses, search, category, status, splitType])

  const handleClearFilters = () => {
    setSearch("")
    setCategory("all")
    setStatus("all")
    setSplitType("all")
  }

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setDetailOpen(true)
  }

  const handleAddExpenseSubmit = (data: {
    description: string
    amount: number
    category: string
    paidBy: string
    splitType: string
    splitAmong: string[]
  }) => {
    console.log("Adding expense:", data)
  }

  const totalPending = group.expenses.filter((e) => e.status === "pending").length
  const totalConfirmed = group.expenses.filter((e) => e.status === "confirmed").length
  const pendingAmount = group.expenses.filter((e) => e.status === "pending").reduce((acc, e) => acc + e.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: group.currency,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Track and manage all group expenses</p>
          </div>

          <Button onClick={() => setAddExpenseOpen(true)} className="gap-2">
            <PlusCircleIcon className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ReceiptIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(group.totalExpenses)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <span className="text-warning font-bold">{totalPending}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success font-bold">{totalConfirmed}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-bold text-foreground">{group.expenses.length} expenses</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 md:p-6">
          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            splitType={splitType}
            onSplitTypeChange={setSplitType}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-6 divide-y divide-border">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center">
                <ReceiptIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No expenses found</p>
                <Button variant="outline" onClick={handleClearFilters} className="mt-4 bg-transparent">
                  Clear Filters
                </Button>
              </div>
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
        families={group.families}
        currency={group.currency}
        onSubmit={handleAddExpenseSubmit}
      />

      <ExpenseDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        expense={selectedExpense}
        allMembers={allMembers}
        currency={group.currency}
        onConfirm={() => console.log("Confirm expense:", selectedExpense?.id)}
        onDelete={() => console.log("Delete expense:", selectedExpense?.id)}
      />
    </div>
  )
}
