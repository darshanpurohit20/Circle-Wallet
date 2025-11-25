"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ChevronRightIcon } from "@/components/icons"
import { formatINR, type Family } from "@/lib/mock-data"

interface FamilyCardProps {
  family: Family
  onClick: () => void
}

export function FamilyCard({ family, onClick }: FamilyCardProps) {
  const adults = family.members.filter((m) => m.type === "adult").length
  const children = family.members.filter((m) => m.type !== "adult").length

  return (
    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {family.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="w-10 h-10 border-2 border-background">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {family.members.length > 3 && (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{family.members.length - 3}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground">{family.name}</h3>
            <p className="text-sm text-muted-foreground">
              {adults} adult{adults !== 1 ? "s" : ""}
              {children > 0 && `, ${children} ${children === 1 ? "child" : "children"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-foreground">{formatINR(family.balance)}</p>
            <p className="text-xs text-muted-foreground">balance</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}
