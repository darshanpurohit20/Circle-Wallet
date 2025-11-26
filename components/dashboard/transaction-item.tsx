// "use client"

// import { Badge } from "@/components/ui/badge"
// import { CheckCircleIcon, ClockIcon, PlusCircleIcon } from "@/components/icons"
// import { formatINR, type Transaction } from "@/lib/mock-data"

// interface TransactionItemProps {
//   transaction: Transaction
//   onClick: () => void
// }

// export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       month: "short",
//       day: "numeric",
//     })
//   }

//   const getSplitLabel = (splitType: string) => {
//     switch (splitType) {
//       case "adults":
//         return "Adults only"
//       case "children":
//         return "Kids only"
//       case "custom":
//         return "Custom split"
//       default:
//         return "Everyone"
//     }
//   }

//   const getTransactionIcon = () => {
//     if (transaction.type === "deposit") {
//       return (
//         <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//           <PlusCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
//         </div>
//       )
//     }

//     // Payment categories
//     const categoryIcons: Record<string, string> = {
//       Accommodation: "🏨",
//       "Food & Dining": "🍽️",
//       Drinks: "🍷",
//       Treats: "🍦",
//       Activities: "🎯",
//       Transport: "🚗",
//       Shopping: "🛍️",
//       Utilities: "⚡",
//       Medical: "🏥",
//     }

//     return (
//       <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
//         {categoryIcons[transaction.category] || "📦"}
//       </div>
//     )
//   }

//   const isDeposit = transaction.type === "deposit"

//   return (
//     <div
//       className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
//       onClick={onClick}
//     >
//       {getTransactionIcon()}

//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <h4 className="font-medium text-foreground truncate">{transaction.description}</h4>
//           {transaction.status === "pending" ? (
//             <ClockIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
//           ) : (
//             <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
//           )}
//         </div>
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           {isDeposit ? (
//             <span>Added by {transaction.paidByName}</span>
//           ) : (
//             <>
//               <span>{transaction.merchantName || `Paid by ${transaction.paidByName}`}</span>
//             </>
//           )}
//           <span>•</span>
//           <span>{formatDate(transaction.date)}</span>
//         </div>
//       </div>

//       <div className="text-right flex-shrink-0">
//         <p className={`font-semibold ${isDeposit ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
//           {isDeposit ? "+" : "-"}
//           {formatINR(transaction.amount)}
//         </p>
//         {!isDeposit && transaction.splitType && (
//           <Badge variant="secondary" className="text-xs">
//             {getSplitLabel(transaction.splitType)}
//           </Badge>
//         )}
//         {isDeposit && (
//           <Badge variant="outline" className="text-xs text-green-600 border-green-200">
//             Deposit
//           </Badge>
//         )}
//       </div>
//     </div>
//   )
// }

"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, ClockIcon, PlusCircleIcon } from "@/components/icons"
import { formatINR, type Transaction } from "@/lib/mock-data"

interface TransactionItemProps {
  transaction: Transaction
  onClick: () => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  // ✅ FIX: correct date field from Supabase
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
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
      Shopping: "🛍️",
      Utilities: "⚡",
      Medical: "🏥",
    }

    return (
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
        {categoryIcons[transaction.category] || "📦"}
      </div>
    )
  }

  const isDeposit = transaction.type === "deposit"

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {getTransactionIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{transaction.description}</h4>
          {transaction.status === "pending" ? (
            <ClockIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isDeposit ? (
            // ✅ FIX: correct paid_by_name
            <span>Added by {transaction.paid_by_name}</span>
          ) : (
            <>
              {/* Merchant first, fallback to paid_by_name */}
              <span>{transaction.merchant_name || `Paid by ${transaction.paid_by_name}`}</span>
            </>
          )}

          <span>•</span>

          {/* ✅ FIX: correct date field */}
          <span>{formatDate(transaction.created_at)}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p
          className={`font-semibold ${
            isDeposit ? "text-green-600 dark:text-green-400" : "text-foreground"
          }`}
        >
          {isDeposit ? "+" : "-"}
          {formatINR(transaction.amount)}
        </p>

        {/* Split badge */}
        {!isDeposit && transaction.split_type && (
          <Badge variant="secondary" className="text-xs">
            {getSplitLabel(transaction.split_type)}
          </Badge>
        )}

        {/* Deposit badge */}
        {isDeposit && (
          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
            Deposit
          </Badge>
        )}
      </div>
    </div>
  )
}
