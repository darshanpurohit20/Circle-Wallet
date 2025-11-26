"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MemberDetailCard } from "./member-detail-card"
import { PlusCircleIcon, ChevronRightIcon } from "@/components/icons"
import type { Family } from "@/lib/mock-data"

interface FamilySectionProps {
  family: Family
  currency: string
  onAddMember: (familyId: string) => void
  onManageMember: (memberId: string) => void
  onViewFamily: (familyId: string) => void
}

export function FamilySection({ family, currency, onAddMember, onManageMember, onViewFamily }: FamilySectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // ✅ FIXED: Proper share_ratio field + safe number conversion
  const totalShareRatio = family.members.reduce(
    (acc, m) => acc + Number(m.share_ratio || 0),
    0
  )

  // FIX: Supabase uses total_contribution, not totalContribution
  const totalContribution = Number(family.total_contribution || 0)

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{family.name}</h3>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>
                {family.members.length} member{family.members.length !== 1 ? "s" : ""}
              </span>
              <span>•</span>

              {/* SAFE: totalShareRatio will NEVER be NaN now */}
              <span>Total ratio: {totalShareRatio.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Balance</p>

              {/* Safe currency formatting */}
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(Number(family.balance || 0))}
              </p>
            </div>

            <Button variant="ghost" size="icon" onClick={() => onViewFamily(family.id)}>
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* FIXED: Correct contributed field */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline">
            Contributed: {formatCurrency(totalContribution)}
          </Badge>
        </div>
      </div>

      {/* Members list */}
      <div className="p-4 md:p-6 space-y-3">
        {family.members.map((member, index) => (
          <MemberDetailCard
            key={member.id}
            member={member}
            isAdmin={index === 0 && family.id === "fam_001"}
            onManage={() => onManageMember(member.id)}
          />
        ))}

        <Button
          variant="outline"
          className="w-full gap-2 mt-4 bg-transparent"
          onClick={() => onAddMember(family.id)}
        >
          <PlusCircleIcon className="w-4 h-4" />
          Add Family Member
        </Button>
      </div>
    </Card>
  )
}
