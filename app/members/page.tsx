"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { FamilySection } from "@/components/members/family-section"
import { AddMemberDialog } from "@/components/members/add-member-dialog"
import { AddFamilyDialog } from "@/components/members/add-family-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { mockGroup } from "@/lib/mock-data"
import { PlusCircleIcon, UsersIcon } from "@/components/icons"

export default function MembersPage() {
  const [group] = useState(mockGroup)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addFamilyOpen, setAddFamilyOpen] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)

  const selectedFamily = group.families.find((f) => f.id === selectedFamilyId)
  const totalMembers = group.families.reduce((acc, fam) => acc + fam.members.length, 0)
  const totalAdults = group.families.reduce((acc, fam) => acc + fam.members.filter((m) => m.type === "adult").length, 0)
  const totalChildren = totalMembers - totalAdults

  const handleAddMember = (familyId: string) => {
    setSelectedFamilyId(familyId)
    setAddMemberOpen(true)
  }

  const handleAddMemberSubmit = (data: { name: string; type: string; age?: number; shareRatio: number }) => {
    console.log("Adding member:", data, "to family:", selectedFamilyId)
  }

  const handleAddFamilySubmit = (data: { name: string; initialContribution: number }) => {
    console.log("Adding family:", data)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground">Manage families and members in your group</p>
          </div>

          <Button onClick={() => setAddFamilyOpen(true)} className="gap-2">
            <PlusCircleIcon className="w-4 h-4" />
            Add Family/Person
          </Button>
        </div>

        <Card className="p-4 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Group Overview</h2>
              <p className="text-sm text-muted-foreground">
                {group.families.length} {group.families.length === 1 ? "family" : "families"} • {totalMembers} members
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAdults}</p>
                <p className="text-xs text-muted-foreground">Adults</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalChildren}</p>
                <p className="text-xs text-muted-foreground">Children</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {group.families.map((family) => (
            <FamilySection
              key={family.id}
              family={family}
              currency={group.currency}
              onAddMember={handleAddMember}
              onManageMember={(memberId) => console.log("Manage member:", memberId)}
              onViewFamily={(familyId) => console.log("View family:", familyId)}
            />
          ))}
        </div>
      </main>

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        familyName={selectedFamily?.name || ""}
        onSubmit={handleAddMemberSubmit}
      />

      <AddFamilyDialog
        open={addFamilyOpen}
        onOpenChange={setAddFamilyOpen}
        onSubmit={handleAddFamilySubmit}
        currency={group.currency}
      />
    </div>
  )
}
