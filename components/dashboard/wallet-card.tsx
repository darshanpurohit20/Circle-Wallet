"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletIcon, TrendingUpIcon, PlusCircleIcon, ArrowRightIcon } from "@/components/icons"
import { formatINR } from "@/lib/mock-data"

interface WalletCardProps {
  balance: number
  totalContributions: number
  totalSpent: number
  onAddFunds: () => void
  onPayMerchant: () => void
}

export function WalletCard({ balance, totalContributions, totalSpent, onAddFunds, onPayMerchant }: WalletCardProps) {
  return (
    <Card className="relative overflow-hidden bg-primary text-primary-foreground p-6 md:p-8">
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="currentColor" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="25" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <WalletIcon className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Circle Wallet</span>
          <span className="ml-auto text-xs bg-primary-foreground/20 px-2 py-0.5 rounded-full">Prepaid</span>
        </div>

        <div className="mb-6">
          <p className="text-sm opacity-75 mb-1">Available Balance</p>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">{formatINR(balance)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 opacity-75" />
            <div>
              <p className="text-xs opacity-75">Total Loaded</p>
              <p className="text-sm font-medium">{formatINR(totalContributions)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="w-4 h-4 opacity-75" />
            <div>
              <p className="text-xs opacity-75">Total Spent</p>
              <p className="text-sm font-medium">{formatINR(totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onAddFunds} variant="secondary" size="sm" className="gap-2 flex-1">
            <PlusCircleIcon className="w-4 h-4" />
            Add Funds
          </Button>
          <Button onClick={onPayMerchant} variant="secondary" size="sm" className="gap-2 flex-1">
            <CreditCardIcon className="w-4 h-4" />
            Pay Merchant
          </Button>
        </div>
      </div>
    </Card>
  )
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
