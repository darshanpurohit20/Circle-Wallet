"use client"

import { Card } from "@/components/ui/card"
import { UsersIcon, ReceiptIcon, TrendingUpIcon, WalletIcon } from "@/components/icons"
import { formatINR } from "@/lib/mock-data"

interface StatsCardsProps {
  totalMembers: number
  totalSpent: number
  walletBalance: number
  pendingApprovals: number
}

export function StatsCards({ totalMembers, totalSpent, walletBalance, pendingApprovals }: StatsCardsProps) {
  const stats = [
    {
      label: "Members",
      value: totalMembers.toString(),
      icon: UsersIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Spent",
      value: formatINR(totalSpent),
      icon: ReceiptIcon,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Wallet Balance",
      value: formatINR(walletBalance),
      icon: WalletIcon,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Pending",
      value: pendingApprovals.toString(),
      icon: TrendingUpIcon,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
