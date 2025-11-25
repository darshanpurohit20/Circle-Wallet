"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircleIcon, UserPlusIcon, ReceiptIcon } from "@/components/icons"
import { AddFundsDialog } from "@/components/wallet/add-funds-dialog"
import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"
import { InviteMemberDialog } from "@/components/invites/invite-member-dialog"
import type { Family } from "@/lib/mock-data"
import Link from "next/link"

interface QuickActionsProps {
  families: Family[]
  walletBalance: number
}

export function QuickActions({ families, walletBalance }: QuickActionsProps) {
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleAddFundsSubmit = (data: { familyId: string; amount: number; method: string }) => {
    console.log("Adding funds:", data)
  }

  const handlePayMerchantSubmit = (data: {
    merchantName: string
    merchantUpi?: string
    amount: number
    description: string
    category: string
    splitType: string
    splitAmong: string[]
  }) => {
    console.log("Paying merchant:", data)
  }

  const handleInviteSubmit = (data: { method: string; contact: string; role: string }) => {
    console.log("Sending invite:", data)
  }

  return (
    <>
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAddFundsOpen(true)} className="gap-2">
            <PlusCircleIcon className="w-4 h-4" />
            Add Funds
          </Button>
          <Button variant="outline" onClick={() => setPayMerchantOpen(true)} className="gap-2">
            {/* CreditCardIcon component is moved to the top */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            Pay Merchant
          </Button>
          <Button variant="outline" onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlusIcon className="w-4 h-4" />
            Invite
          </Button>
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/transactions">
              <ReceiptIcon className="w-4 h-4" />
              All Transactions
            </Link>
          </Button>
        </div>
      </Card>

      <AddFundsDialog
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        families={families}
        onSubmit={handleAddFundsSubmit}
      />

      <PayMerchantDialog
        open={payMerchantOpen}
        onOpenChange={setPayMerchantOpen}
        families={families}
        walletBalance={walletBalance}
        onSubmit={handlePayMerchantSubmit}
      />

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} onSubmit={handleInviteSubmit} />
    </>
  )
}
