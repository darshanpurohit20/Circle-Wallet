"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SettingsIcon } from "@/components/icons"
import type { FamilyMember } from "@/lib/mock-data"

interface MemberDetailCardProps {
  member: FamilyMember
  isAdmin?: boolean
  isCoAdmin?: boolean
  onManage?: () => void
}

export function MemberDetailCard({ member, isAdmin, isCoAdmin, onManage }: MemberDetailCardProps) {
  // --- FIX 1: Use correct DB field names ---
  const type = member.member_type || "adult"
  const age = member.age || null

  // --- FIX 2: Use correct share_ratio field ---
  const shareRatio = Number(member.share_ratio || 0)

  // Show human-readable type
  const getTypeLabel = () => {
    if (type === "child") return `Child${age ? ` (${age}y)` : ""}`
    if (type === "teenager") return `Teen${age ? ` (${age}y)` : ""}`
    return "Adult"
  }

  // Show readable share (without causing NaN)
  const getShareRatioDisplay = () => {
    if (!shareRatio || shareRatio === 0) return "0% share"
    if (shareRatio === 1) return "100% share"
    return `${(shareRatio * 100).toFixed(1)}% share`
  }

  return (
    <Card className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground">{member.name}</h4>
            {isAdmin && <Badge className="bg-primary text-primary-foreground">Admin</Badge>}
            {isCoAdmin && <Badge variant="secondary">Co-Admin</Badge>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{getTypeLabel()}</span>
            <span>•</span>
            <span>{getShareRatioDisplay()}</span>
          </div>
        </div>

        {onManage && (
          <Button variant="ghost" size="icon" onClick={onManage}>
            <SettingsIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
