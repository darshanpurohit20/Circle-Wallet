"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CheckCircleIcon, ClockIcon } from "@/components/icons"
import type { Transaction as Expense, FamilyMember } from "@/lib/mock-data"


interface ExpenseDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  allMembers: FamilyMember[]
  currency: string
  onConfirm?: () => void
  onDelete?: () => void
}

export function ExpenseDetailDialog({
  open,
  onOpenChange,
  expense,
  allMembers,
  currency,
  onConfirm,
  onDelete,
}: ExpenseDetailDialogProps) {
  if (!expense) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const splitMembers = allMembers.filter((m) => expense.splitAmong.includes(m.id))
  const totalRatio = splitMembers.reduce((acc, m) => acc + m.shareRatio, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
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
            <div>
              <DialogTitle>{expense.description}</DialogTitle>
              <DialogDescription>{expense.category}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-foreground">{formatCurrency(expense.amount)}</span>
            <Badge variant={expense.status === "confirmed" ? "default" : "secondary"} className="gap-1">
              {expense.status === "confirmed" ? (
                <CheckCircleIcon className="w-3 h-3" />
              ) : (
                <ClockIcon className="w-3 h-3" />
              )}
              {expense.status === "confirmed" ? "Confirmed" : "Pending"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">{formatDate(expense.date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Split Type</p>
              <p className="font-medium text-foreground">{getSplitLabel(expense.splitType)}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-2">Paid By</p>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {expense.paidByName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{expense.paidByName}</span>
            </div>
          </div>

          <Card className="p-4">
            <p className="text-sm font-medium text-foreground mb-3">Split Breakdown</p>
            <div className="space-y-3">
              {splitMembers.map((member) => {
                const share = (expense.amount * member.shareRatio) / totalRatio
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-[10px]">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{member.name}</span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {(member.shareRatio * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <span className="font-medium text-foreground">{formatCurrency(share)}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {expense.status === "pending" && onConfirm && (
            <Button onClick={onConfirm} className="gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              Confirm Expense
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
