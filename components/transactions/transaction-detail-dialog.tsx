// "use client"

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { formatINR, type Transaction, type FamilyMember } from "@/lib/mock-data"
// import { CheckCircleIcon, ClockIcon, XIcon, BuildingIcon } from "@/components/icons"

// interface TransactionDetailDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   transaction: Transaction | null
//   allMembers: FamilyMember[]
//   onApprove: () => void
//   onDecline: () => void
// }

// export function TransactionDetailDialog({
//   open,
//   onOpenChange,
//   transaction,
//   allMembers,
//   onApprove,
//   onDecline,
// }: TransactionDetailDialogProps) {
//   if (!transaction) return null

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const getSplitLabel = (splitType: string) => {
//     switch (splitType) {
//       case "adults":
//         return "Adults Only"
//       case "children":
//         return "Kids Only"
//       case "custom":
//         return "Custom Split"
//       default:
//         return "Everyone"
//     }
//   }

//   const membersInSplit = allMembers.filter((m) => transaction.splitAmong.includes(m.id))
//   const totalRatio = membersInSplit.reduce((acc, m) => acc + m.shareRatio, 0)

//   const isDeposit = transaction.type === "deposit"
//   const isPending = transaction.status === "pending"

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             {isDeposit ? (
//               <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                 <span className="text-green-600 dark:text-green-400 text-xl">+</span>
//               </div>
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
//                 <BuildingIcon className="w-6 h-6 text-muted-foreground" />
//               </div>
//             )}
//             <div>
//               <DialogTitle className="text-left">{transaction.description}</DialogTitle>
//               <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
//             </div>
//           </div>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           <div className="flex items-center justify-between">
//             <span className="text-muted-foreground">Amount</span>
//             <span
//               className={`text-2xl font-bold ${isDeposit ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
//             >
//               {isDeposit ? "+" : "-"}
//               {formatINR(transaction.amount)}
//             </span>
//           </div>

//           <div className="flex items-center justify-between">
//             <span className="text-muted-foreground">Status</span>
//             <Badge
//               variant={
//                 transaction.status === "confirmed"
//                   ? "default"
//                   : transaction.status === "pending"
//                     ? "secondary"
//                     : "destructive"
//               }
//               className="gap-1"
//             >
//               {transaction.status === "confirmed" && <CheckCircleIcon className="w-3 h-3" />}
//               {transaction.status === "pending" && <ClockIcon className="w-3 h-3" />}
//               {transaction.status === "declined" && <XIcon className="w-3 h-3" />}
//               {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
//             </Badge>
//           </div>

//           <div className="flex items-center justify-between">
//             <span className="text-muted-foreground">Type</span>
//             <Badge variant="outline">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</Badge>
//           </div>

//           {transaction.category && (
//             <div className="flex items-center justify-between">
//               <span className="text-muted-foreground">Category</span>
//               <span className="font-medium">{transaction.category}</span>
//             </div>
//           )}

//           {transaction.merchantName && (
//             <div className="flex items-center justify-between">
//               <span className="text-muted-foreground">Merchant</span>
//               <span className="font-medium">{transaction.merchantName}</span>
//             </div>
//           )}

//           <div className="flex items-center justify-between">
//             <span className="text-muted-foreground">{isDeposit ? "Added by" : "Paid by"}</span>
//             <span className="font-medium">{transaction.paidByName}</span>
//           </div>

//           {!isDeposit && transaction.splitType && (
//             <>
//               <div className="flex items-center justify-between">
//                 <span className="text-muted-foreground">Split Type</span>
//                 <Badge variant="secondary">{getSplitLabel(transaction.splitType)}</Badge>
//               </div>

//               <div className="border-t pt-4">
//                 <p className="text-sm font-medium text-foreground mb-3">Split Breakdown</p>
//                 <div className="space-y-2 max-h-48 overflow-y-auto">
//                   {membersInSplit.map((member) => {
//                     const share = (transaction.amount * member.shareRatio) / totalRatio
//                     return (
//                       <div key={member.id} className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Avatar className="w-6 h-6">
//                             <AvatarImage src={member.avatar || "/placeholder.svg"} />
//                             <AvatarFallback className="text-[10px]">
//                               {member.name
//                                 .split(" ")
//                                 .map((n) => n[0])
//                                 .join("")}
//                             </AvatarFallback>
//                           </Avatar>
//                           <span className="text-sm">{member.name}</span>
//                         </div>
//                         <span className="text-sm font-medium">{formatINR(share)}</span>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             </>
//           )}

//           {transaction.requiresApproval && (
//             <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
//               <p className="text-sm text-amber-800 dark:text-amber-200">
//                 This transaction requires admin approval as it exceeds the threshold.
//               </p>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="flex-col sm:flex-row gap-2">
//           {isPending && (
//             <>
//               <Button
//                 variant="outline"
//                 onClick={onDecline}
//                 className="w-full sm:w-auto text-destructive bg-transparent"
//               >
//                 Decline
//               </Button>
//               <Button onClick={onApprove} className="w-full sm:w-auto">
//                 Approve
//               </Button>
//             </>
//           )}
//           {!isPending && (
//             <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
//               Close
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatINR, type Transaction, type FamilyMember } from "@/lib/mock-data"
import { CheckCircleIcon, ClockIcon, XIcon, BuildingIcon } from "@/components/icons"

interface TransactionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  allMembers: FamilyMember[]
  onApprove: () => void
  onDecline: () => void
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  allMembers,
  onApprove,
  onDecline,
}: TransactionDetailDialogProps) {
  if (!transaction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSplitLabel = (splitType: string) => {
    switch (splitType) {
      case "adults":
        return "Adults Only"
      case "children":
        return "Kids Only"
      case "custom":
        return "Custom Split"
      default:
        return "Everyone"
    }
  }

  // ✅ FIXED: Correct DB field names
  const splitAmong = transaction.split_among || []

  const membersInSplit = allMembers.filter((m) => splitAmong.includes(m.id))

  // ✅ FIXED: Proper share_ratio field + number guard
  const totalRatio = membersInSplit.reduce(
    (acc, m) => acc + Number(m.share_ratio || 0),
    0
  )

  const isDeposit = transaction.type === "deposit"
  const isPending = transaction.status === "pending"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isDeposit ? (
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">+</span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <BuildingIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <DialogTitle className="text-left">{transaction.description}</DialogTitle>
              <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span
              className={`text-2xl font-bold ${isDeposit ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
            >
              {isDeposit ? "+" : "-"}
              {formatINR(transaction.amount)}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant={
                transaction.status === "confirmed"
                  ? "default"
                  : transaction.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
              className="gap-1"
            >
              {transaction.status === "confirmed" && <CheckCircleIcon className="w-3 h-3" />}
              {transaction.status === "pending" && <ClockIcon className="w-3 h-3" />}
              {transaction.status === "declined" && <XIcon className="w-3 h-3" />}
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Badge>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline">
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </Badge>
          </div>

          {/* Category */}
          {transaction.category && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{transaction.category}</span>
            </div>
          )}

          {/* Merchant */}
          {transaction.merchant_name && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Merchant</span>
              <span className="font-medium">{transaction.merchant_name}</span>
            </div>
          )}

          {/* Paid by */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{isDeposit ? "Added by" : "Paid by"}</span>
            <span className="font-medium">{transaction.paid_by_name}</span>
          </div>

          {/* Split Breakdown */}
          {!isDeposit && transaction.split_type && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Split Type</span>
                <Badge variant="secondary">{getSplitLabel(transaction.split_type)}</Badge>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-foreground mb-3">Split Breakdown</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {membersInSplit.map((member) => {
                    const ratio = Number(member.share_ratio || 0)
                    const share = totalRatio > 0 ? (transaction.amount * ratio) / totalRatio : 0

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
                          <span className="text-sm">{member.name}</span>
                        </div>
                        <span className="text-sm font-medium">{formatINR(share)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Approval */}
          {transaction.requires_approval && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This transaction requires admin approval as it exceeds the threshold.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isPending ? (
            <>
              <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto text-destructive bg-transparent">
                Decline
              </Button>
              <Button onClick={onApprove} className="w-full sm:w-auto">
                Approve
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
