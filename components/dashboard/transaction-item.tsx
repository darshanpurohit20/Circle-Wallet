"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, ClockIcon, PlusCircleIcon, UsersIcon } from "@/components/icons"
import { formatINR, type Transaction } from "@/lib/mock-data"
import { formatTimeAgo, formatFullDateTime } from "@/lib/utils"

interface TransactionItemProps {
  transaction: Transaction
  onClick: () => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const getSplitLabel = (splitType: string) => {
    switch (splitType) {
      case "adults":
        return "Adults"
      case "kids":
        return "Kids"
      case "custom":
        return "Custom"
      case "everyone":
      default:
        return "Everyone"
    }
  }

  const getSplitBadgeColor = (splitType: string) => {
    switch (splitType) {
      case "adults":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "kids":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "custom":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      case "everyone":
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    }
  }

  const getTransactionIcon = () => {
    if (transaction.type === "deposit") {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <PlusCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      )
    }

    // Payment categories
    const categoryIcons: Record<string, string> = {
      Accommodation: "🏨",
      "Food & Dining": "🍽️",
      Drinks: "🍷",
      Treats: "🍦",
      Activities: "🎯",
      Transport: "🚗",
      Transportation: "🚗",
      Shopping: "🛍️",
      Utilities: "⚡",
      Medical: "🏥",
      Healthcare: "🏥",
      Entertainment: "🎬",
      Education: "📚",
      Other: "📋",
    }

    return (
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
        {categoryIcons[transaction.category] || "💳"}
      </div>
    )
  }

  const isDeposit = transaction.type === "deposit"
  const splitAmongCount = transaction.split_among?.length || 0

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {getTransactionIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">
            {transaction.merchant_name || transaction.description}
          </h4>
          
          {/* Status Icon */}
          {transaction.status === "pending" ? (
            <ClockIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}

          {/* Split Type Badge */}
          {!isDeposit && transaction.split_type && (
            <Badge className={`text-xs font-medium ${getSplitBadgeColor(transaction.split_type)}`}>
              {getSplitLabel(transaction.split_type)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {/* Time Ago with hover tooltip */}
          <span title={formatFullDateTime(transaction.created_at)}>
            {formatTimeAgo(transaction.created_at)}
          </span>

          {/* Member Count for payments */}
          {!isDeposit && splitAmongCount > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {splitAmongCount} {splitAmongCount === 1 ? "member" : "members"}
              </span>
            </>
          )}

          {/* Category or Paid By */}
          {!isDeposit && transaction.category && (
            <>
              <span>•</span>
              <span>{transaction.category}</span>
            </>
          )}

          {/* For deposits, show who added it */}
          {isDeposit && transaction.paid_by_name && (
            <>
              <span>•</span>
              <span>Added by {transaction.paid_by_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className={`font-semibold mb-1 ${
            isDeposit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {isDeposit ? "+" : "-"}
          {formatINR(transaction.amount)}
        </p>

        {/* Deposit badge */}
        {isDeposit && (
          <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:border-green-800">
            Deposit
          </Badge>
        )}

        {/* Paid by (for payments) */}
        {!isDeposit && transaction.paid_by_name && (
          <p className="text-xs text-muted-foreground">
            {transaction.paid_by_name}
          </p>
        )}
      </div>
    </div>
  )
}
