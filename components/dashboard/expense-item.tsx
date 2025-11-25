"use client"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, ClockIcon } from "@/components/icons"
import type { Expense } from "@/lib/mock-data"

interface ExpenseItemProps {
  expense: Expense
  currency: string
  onClick: () => void
}

export function ExpenseItem({ expense, currency, onClick }: ExpenseItemProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getSplitLabel = (splitType: string) => {
    switch (splitType) {
      case "adults":
        return "Adults only"
      case "children":
        return "Kids only"
      case "custom":
        return "Custom split"
      default:
        return "Everyone"
    }
  }

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
        {expense.category === "Accommodation" && "🏨"}
        {expense.category === "Food & Dining" && "🍽️"}
        {expense.category === "Drinks" && "🍷"}
        {expense.category === "Treats" && "🍦"}
        {expense.category === "Activities" && "🎯"}
        {expense.category === "Transport" && "🚗"}
        {expense.category === "Shopping" && "🛍️"}
        {!["Accommodation", "Food & Dining", "Drinks", "Treats", "Activities", "Transport", "Shopping"].includes(
          expense.category,
        ) && "📦"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{expense.description}</h4>
          {expense.status === "pending" ? (
            <ClockIcon className="w-4 h-4 text-warning flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Paid by {expense.paidByName}</span>
          <span>•</span>
          <span>{formatDate(expense.date)}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
        <Badge variant="secondary" className="text-xs">
          {getSplitLabel(expense.splitType)}
        </Badge>
      </div>
    </div>
  )
}
