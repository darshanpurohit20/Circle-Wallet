// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"

// import { Header } from "@/components/dashboard/header"
// import { FamilySection } from "@/components/members/family-section"
// import { AddMemberDialog } from "@/components/members/add-member-dialog"
// import { AddFamilyDialog } from "@/components/members/add-family-dialog"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { PlusCircleIcon, UsersIcon } from "@/components/icons"

// export default function MembersPage() {
//   const supabase = createClient()
//   const router = useRouter()

//   const [group, setGroup] = useState<any>(null)
//   const [families, setFamilies] = useState<any[]>([])
//   const [members, setMembers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   const [addMemberOpen, setAddMemberOpen] = useState(false)
//   const [addFamilyOpen, setAddFamilyOpen] = useState(false)
//   const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)

//   // -------------------------------------
//   // LOAD GROUP + FAMILIES + MEMBERS
//   // -------------------------------------
//   useEffect(() => {
//     async function load() {
//       const { data: { user } } = await supabase.auth.getUser()

//       if (!user) {
//         router.push("/auth/login")
//         return
//       }

//       // Find user's group
//       const { data: gm } = await supabase
//         .from("group_members")
//         .select("group_id")
//         .eq("profile_id", user.id)
//         .maybeSingle()

//       if (!gm) {
//         setLoading(false)
//         return
//       }

//       const groupId = gm.group_id

//       // Load group data
//       const { data: groupData } = await supabase
//         .from("groups")
//         .select("*")
//         .eq("id", groupId)
//         .single()

//       // Load families
//       const { data: familyData } = await supabase
//         .from("families")
//         .select("*")
//         .eq("group_id", groupId)

//       // Load family members
//       const { data: memberData } = await supabase
//         .from("family_members")
//         .select("*")

//       setGroup(groupData)
//       setFamilies(familyData || [])
//       setMembers(memberData || [])

//       setLoading(false)
//     }

//     load()
//   }, [])

//   if (loading) return <div className="p-8 text-center text-muted-foreground">Loading members...</div>

//   // Combine families + member list
//   const familiesWithMembers = families.map((family) => ({
//     ...family,
//     members: members.filter((m) => m.family_id === family.id),
//   }))

//   const totalMembers = members.length
//   const totalAdults = members.filter((m) => m.member_type === "adult").length
//   const totalChildren = totalMembers - totalAdults

//   // -------------------------------------
//   // ADD MEMBER
//   // -------------------------------------
//   const handleAddMember = (familyId: string) => {
//     setSelectedFamilyId(familyId)
//     setAddMemberOpen(true)
//   }

//   const handleAddMemberSubmit = async (data: { name: string; type: string; age?: number; shareRatio: number }) => {
//     if (!selectedFamilyId) return

//     await supabase.from("family_members").insert({
//       family_id: selectedFamilyId,
//       name: data.name,
//       member_type: data.type,
//       age: data.age || null,
//       share_ratio: data.shareRatio,
//     })

//     // Refresh members
//     const { data: memberData } = await supabase.from("family_members").select("*")
//     setMembers(memberData || [])

//     setAddMemberOpen(false)
//   }

//   // -------------------------------------
//   // ADD FAMILY
//   // -------------------------------------
//   const handleAddFamilySubmit = async (data: { name: string; initialContribution: number }) => {
//     await supabase.from("families").insert({
//       group_id: group.id,
//       name: data.name,
//       total_contribution: data.initialContribution,
//       balance: data.initialContribution,
//     })

//     const { data: updatedFamilies } = await supabase
//       .from("families")
//       .select("*")
//       .eq("group_id", group.id)

//     setFamilies(updatedFamilies || [])
//     setAddFamilyOpen(false)
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Header groupName={group?.name || "Group"} />

//       <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

//         {/* HEADER */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-foreground">Members</h1>
//             <p className="text-muted-foreground">Manage families and members in your group</p>
//           </div>

//           <Button onClick={() => setAddFamilyOpen(true)} className="gap-2">
//             <PlusCircleIcon className="w-4 h-4" />
//             Add Family/Person
//           </Button>
//         </div>

//         {/* SUMMARY CARD */}
//         <Card className="p-4 md:p-6 mb-6">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
//               <UsersIcon className="w-6 h-6 text-primary" />
//             </div>

//             <div className="flex-1">
//               <h2 className="font-semibold text-foreground">Group Overview</h2>
//               <p className="text-sm text-muted-foreground">
//                 {families.length} {families.length === 1 ? "family" : "families"} • {totalMembers} members
//               </p>
//             </div>

//             <div className="flex gap-4 text-center">
//               <div>
//                 <p className="text-2xl font-bold text-foreground">{totalAdults}</p>
//                 <p className="text-xs text-muted-foreground">Adults</p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-foreground">{totalChildren}</p>
//                 <p className="text-xs text-muted-foreground">Children</p>
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* FAMILY SECTIONS */}
//         <div className="space-y-6">
//           {familiesWithMembers.map((family) => (
//             <FamilySection
//               key={family.id}
//               family={family}
//               currency={group.currency}
//               onAddMember={handleAddMember}
//               onManageMember={(memberId) => console.log("Manage member:", memberId)}
//               onViewFamily={(familyId) => console.log("View family:", familyId)}
//             />
//           ))}
//         </div>
//       </main>

//       {/* DIALOGS */}
//       <AddMemberDialog
//         open={addMemberOpen}
//         onOpenChange={setAddMemberOpen}
//         familyName={families.find((f) => f.id === selectedFamilyId)?.name || ""}
//         onSubmit={handleAddMemberSubmit}
//       />

//       <AddFamilyDialog
//         open={addFamilyOpen}
//         onOpenChange={setAddFamilyOpen}
//         onSubmit={handleAddFamilySubmit}
//         currency={group.currency}
//       />
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Header } from "@/components/dashboard/header"
import { FamilySection } from "@/components/members/family-section"
import { AddMemberDialog } from "@/components/members/add-member-dialog"
import { AddFamilyDialog } from "@/components/members/add-family-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircleIcon, UsersIcon } from "@/components/icons"

export default function MembersPage() {
  const supabase = createClient()
  const router = useRouter()

  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addFamilyOpen, setAddFamilyOpen] = useState(false)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null)

  // -------------------------------------
  // LOAD GROUP + FAMILIES + MEMBERS
  // -------------------------------------
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Find user's group
      const { data: gm } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id)
        .maybeSingle()

      if (!gm) {
        setLoading(false)
        return
      }

      const groupId = gm.group_id

      // Load group data
      const { data: groupData } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single()

      // Load families
      const { data: familyData } = await supabase
        .from("families")
        .select("*")
        .eq("group_id", groupId)

      // Load family members
      const { data: memberData } = await supabase
        .from("family_members")
        .select("*")

      setGroup(groupData)
      setFamilies(familyData || [])
      setMembers(memberData || [])

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading members...</div>

  // Combine families + member list
  const familiesWithMembers = families.map((family) => ({
    ...family,
    members: members.filter((m) => m.family_id === family.id),
  }))

  const totalMembers = members.length
  const totalAdults = members.filter((m) => m.member_type === "adult").length
  const totalChildren = totalMembers - totalAdults

  // -------------------------------------
  // ADD MEMBER
  // -------------------------------------
  const handleAddMember = (familyId: string) => {
    setSelectedFamilyId(familyId)
    setAddMemberOpen(true)
  }

  const handleAddMemberSubmit = async (data: { name: string; type: string; age?: number; shareRatio: number }) => {
    if (!selectedFamilyId) return

    await supabase.from("family_members").insert({
      family_id: selectedFamilyId,
      name: data.name,
      member_type: data.type,
      age: data.age || null,
      share_ratio: data.shareRatio,
    })

    // Refresh members
    const { data: memberData } = await supabase.from("family_members").select("*")
    setMembers(memberData || [])

    setAddMemberOpen(false)
  }

  // -------------------------------------
  // ADD FAMILY (WITH WALLET UPDATE)
  // -------------------------------------
  const handleAddFamilySubmit = async (data: { name: string; initialContribution: number }) => {
    try {
      // 1. Insert the new family
      const { error: familyError } = await supabase.from("families").insert({
        group_id: group.id,
        name: data.name,
        total_contribution: data.initialContribution,
        balance: data.initialContribution,
      })

      if (familyError) throw familyError

      // 2. Create a transaction for the initial contribution (if > 0)
      if (data.initialContribution > 0) {
        await supabase.from("transactions").insert({
          group_id: group.id,
          type: "deposit",
          description: `${data.name} initial contribution`,
          amount: data.initialContribution,
          status: "confirmed",
          paid_by_name: data.name,
        })
      }

      // 3. Reload all families
      const { data: updatedFamilies } = await supabase
        .from("families")
        .select("*")
        .eq("group_id", group.id)

      setFamilies(updatedFamilies || [])

      // 👇 4. RECALCULATE AND UPDATE WALLET BALANCE
      const totalBalance = (updatedFamilies || []).reduce(
        (sum, f) => sum + Number(f.balance || 0),
        0
      )

      const { error: updateError } = await supabase
        .from("groups")
        .update({ shared_wallet_balance: totalBalance })
        .eq("id", group.id)

      if (updateError) {
        console.error("Failed to update wallet balance:", updateError)
      } else {
        // Update local group state
        setGroup((prev: any) => ({ ...prev, shared_wallet_balance: totalBalance }))
        console.log("✅ Wallet balance updated to:", totalBalance)
      }

      setAddFamilyOpen(false)
    } catch (error) {
      console.error("Error adding family:", error)
      alert("Failed to add family. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group?.name || "Group"} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* HEADER */}
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

        {/* SUMMARY CARD */}
        <Card className="p-4 md:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Group Overview</h2>
              <p className="text-sm text-muted-foreground">
                {families.length} {families.length === 1 ? "family" : "families"} • {totalMembers} members
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

        {/* FAMILY SECTIONS */}
        <div className="space-y-6">
          {familiesWithMembers.map((family) => (
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

      {/* DIALOGS */}
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        familyName={families.find((f) => f.id === selectedFamilyId)?.name || ""}
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
