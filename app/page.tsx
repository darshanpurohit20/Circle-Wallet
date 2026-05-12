// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"

// import { Header } from "@/components/dashboard/header"
// import { WalletCard } from "@/components/dashboard/wallet-card"
// import { StatsCards } from "@/components/dashboard/stats-cards"
// import { FamilyCard } from "@/components/dashboard/family-card"
// import { TransactionItem } from "@/components/dashboard/transaction-item"
// import { QuickActions } from "@/components/dashboard/quick-actions"

// import { AddFundsDialog } from "@/components/wallet/add-funds-dialog"
// import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"

// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { ChevronRightIcon } from "@/components/icons"

// import Link from "next/link"

// export default function DashboardPage() {
//   const supabase = createClient()
//   const router = useRouter()

//   const [loading, setLoading] = useState(true)
//   const [group, setGroup] = useState<any>(null)
//   const [families, setFamilies] = useState<any[]>([])
//   const [transactions, setTransactions] = useState<any[]>([])

//   const [addFundsOpen, setAddFundsOpen] = useState(false)
//   const [payMerchantOpen, setPayMerchantOpen] = useState(false)

//   useEffect(() => {
//     let mounted = true
//     ;(async () => {
//       setLoading(true)

//       try {
//         const { data: userData } = await supabase.auth.getUser()
//         const user = userData?.user

//         if (!user) {
//           router.push("/auth/login")
//           return
//         }

//         const { data: gm } = await supabase
//           .from("group_members")
//           .select("group_id")
//           .eq("profile_id", user.id)
//           .maybeSingle()

//         if (!gm) {
//           router.push("/settings")
//           return
//         }

//         const groupId = gm.group_id

//         const { data: groupRow } = await supabase
//           .from("groups")
//           .select("*")
//           .eq("id", groupId)
//           .maybeSingle()

//         const { data: familyRows } = await supabase
//           .from("families")
//           .select("*, family_members(*)")
//           .eq("group_id", groupId)

//         const { data: trx } = await supabase
//           .from("transactions")
//           .select("*")
//           .eq("group_id", groupId)
//           .order("created_at", { ascending: false })
//           .limit(10)

//         if (!mounted) return

//         const normalizedFamilies = (familyRows || []).map((family) => ({
//           id: family.id,
//           name: family.name,
//           balance: Number(family.balance || 0),
//           totalContribution: Number(family.total_contribution || 0),
//           members: (family.family_members || []).map((m: any) => ({
//             id: m.id,
//             name: m.name,
//             type: m.member_type,
//             age: m.age,
//             shareRatio: Number(m.share_ratio),
//             avatar: m.avatar_url || null,
//           })),
//         }))

//         setGroup(groupRow || null)
//         setFamilies(normalizedFamilies)
//         setTransactions(trx || [])
//       } catch (error) {
//         console.error("Error loading dashboard data:", error)
//       } finally {
//         setLoading(false)
//       }
//     })()

//     return () => {
//       mounted = false
//     }
//   }, [router, supabase])

//   useEffect(() => {
//     if (!group) return
    
//     const channel = supabase
//       .channel("realtime-dashboard")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "transactions", filter: `group_id=eq.${group.id}` },
//         (payload) => {
//           const newRow = payload.new
//           if (!newRow) return
          
//           setTransactions((prev) => [newRow, ...prev].slice(0, 10))
          
//           if (newRow.type === "deposit") {
//             setGroup((g: any) => ({ 
//               ...g, 
//               shared_wallet_balance: Number(g.shared_wallet_balance || 0) + Number(newRow.amount || 0) 
//             }))
//           } else if (newRow.type === "payment") {
//             setGroup((g: any) => ({ 
//               ...g, 
//               shared_wallet_balance: Number(g.shared_wallet_balance || 0) - Number(newRow.amount || 0),
//               total_spent: Number(g.total_spent || 0) + Number(newRow.amount || 0)
//             }))
//           }
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [group, supabase])

//   const totalMembers = families.reduce((acc, fam) => acc + fam.members.length, 0)
//   const totalContributions = families.reduce((acc, fam) => acc + fam.totalContribution, 0)
//   const totalExpenses = transactions
//     .filter((t) => t.type !== "deposit")
//     .reduce((acc, t) => acc + Number(t.amount || 0), 0)
//   const pendingTransactions = transactions.filter((t) => t.status === "pending").length

//   const handleAddFundsSubmit = async ({ 
//     familyId, 
//     amount 
//   }: { 
//     familyId?: string
//     amount: number 
//   }) => {
//     if (!group) return

//     try {
//       const { data: inserted, error: insertError } = await supabase
//         .from("transactions")
//         .insert({
//           group_id: group.id,
//           type: "deposit",
//           description: familyId 
//             ? `${families.find(f => f.id === familyId)?.name || "Family"} deposit`
//             : "Group deposit",
//           amount: amount,
//           status: "confirmed",
//           paid_by: null,
//           paid_by_name: familyId 
//             ? families.find(f => f.id === familyId)?.name 
//             : "Group",
//         })
//         .select()
//         .single()

//       if (insertError) {
//         alert("Failed to add funds. Please try again.")
//         return
//       }

//       if (familyId) {
//         const family = families.find(f => f.id === familyId)
//         if (family) {
//           const newFamilyBalance = Number(family.balance || 0) + Number(amount)
//           const newFamilyContribution = Number(family.totalContribution || 0) + Number(amount)

//           await supabase
//             .from("families")
//             .update({ 
//               balance: newFamilyBalance,
//               total_contribution: newFamilyContribution 
//             })
//             .eq("id", familyId)
//         }
//       }

//       // 👇 FIX: Calculate wallet as sum of family balances
//       const { data: updatedFamilies } = await supabase
//         .from("families")
//         .select("*, family_members(*)")
//         .eq("group_id", group.id)

//       const normalizedFamilies = (updatedFamilies || []).map((family) => ({
//         id: family.id,
//         name: family.name,
//         balance: Number(family.balance || 0),
//         totalContribution: Number(family.total_contribution || 0),
//         members: (family.family_members || []).map((m: any) => ({
//           id: m.id,
//           name: m.name,
//           type: m.member_type,
//           age: m.age,
//           shareRatio: Number(m.share_ratio),
//           avatar: m.avatar || null,
//         })),
//       }))

//       const newWalletBalance = normalizedFamilies.reduce((sum, f) => sum + f.balance, 0)
      
//       const { error: updateError } = await supabase
//         .from("groups")
//         .update({ shared_wallet_balance: newWalletBalance })
//         .eq("id", group.id)

//       if (updateError) {
//         alert("Funds added but balance update failed. Please refresh.")
//       } else {
//         setGroup((g: any) => ({ ...g, shared_wallet_balance: newWalletBalance }))
//         setFamilies(normalizedFamilies)
//         setTransactions((prev) => [inserted, ...prev].slice(0, 10))
//       }

//       setAddFundsOpen(false)
//     } catch (error) {
//       alert("An unexpected error occurred.")
//     }
//   }

//   const handlePayMerchantSubmit = async (data: {
//     merchantName: string
//     amount: number
//     description: string
//     category: string
//     splitType?: string
//     splitAmong?: string[]
//   }) => {
//     if (!group) return

//     try {
//       let totalShares = 0
//       let familySplits: { familyId: string; shares: number; amount: number }[] = []

//       families.forEach(family => {
//         let familyShares = 0
        
//         family.members.forEach((member: any) => {
//           let shouldInclude = false

//           if (data.splitType === "everyone") {
//             shouldInclude = true
//           } else if (data.splitType === "adults") {
//             shouldInclude = member.type === "adult"
//           } else if (data.splitType === "kids") {
//             shouldInclude = member.type !== "adult"
//           } else if (data.splitType === "custom" && data.splitAmong) {
//             shouldInclude = data.splitAmong.includes(member.id)
//           } else {
//             shouldInclude = true
//           }

//           if (shouldInclude) {
//             familyShares += Number(member.shareRatio || 1)
//           }
//         })

//         if (familyShares > 0) {
//           totalShares += familyShares
//           familySplits.push({
//             familyId: family.id,
//             shares: familyShares,
//             amount: 0
//           })
//         }
//       })

//       familySplits = familySplits.map(split => ({
//         ...split,
//         amount: (split.shares / totalShares) * data.amount
//       }))

//       // 👇 FIX: Validate family balances BEFORE payment
//       for (const split of familySplits) {
//         const family = families.find(f => f.id === split.familyId)
//         if (family) {
//           const newBalance = Number(family.balance || 0) - split.amount
//           if (newBalance < 0) {
//             alert(`${family.name} has insufficient balance (₹${family.balance.toFixed(2)}). They need ₹${Math.abs(newBalance).toFixed(2)} more.`)
//             return
//           }
//         }
//       }

//       const { data: inserted, error: insertError } = await supabase
//         .from("transactions")
//         .insert({
//           group_id: group.id,
//           type: "payment",
//           description: data.description,
//           amount: data.amount,
//           merchant_name: data.merchantName,
//           category: data.category,
//           status: "confirmed",
//           paid_by_name: "Group Wallet",
//           split_type: data.splitType || "everyone",      // 👈 ADD THIS
//           split_among: data.splitAmong || [],  
//         })
//         .select()
//         .single()

//       if (insertError) {
//         alert("Payment failed. Please try again.")
//         return
//       }

//       for (const split of familySplits) {
//         const family = families.find(f => f.id === split.familyId)
//         if (family) {
//           const newFamilyBalance = Number(family.balance || 0) - split.amount

//           await supabase
//             .from("families")
//             .update({ balance: newFamilyBalance })
//             .eq("id", split.familyId)
//         }
//       }

//       const newTotalSpent = Number(group.total_spent || 0) + Number(data.amount)

//       // 👇 FIX: Calculate wallet as sum of family balances
//       const { data: updatedFamilies } = await supabase
//         .from("families")
//         .select("*, family_members(*)")
//         .eq("group_id", group.id)

//       const normalizedFamilies = (updatedFamilies || []).map((family) => ({
//         id: family.id,
//         name: family.name,
//         balance: Number(family.balance || 0),
//         totalContribution: Number(family.total_contribution || 0),
//         members: (family.family_members || []).map((m: any) => ({
//           id: m.id,
//           name: m.name,
//           type: m.member_type,
//           age: m.age,
//           shareRatio: Number(m.share_ratio),
//           avatar: m.avatar || null,
//         })),
//       }))

//       const newWalletBalance = normalizedFamilies.reduce((sum, f) => sum + f.balance, 0)

//       const { error: updateError } = await supabase
//         .from("groups")
//         .update({
//           shared_wallet_balance: newWalletBalance,
//           total_spent: newTotalSpent,
//         })
//         .eq("id", group.id)

//       if (updateError) {
//         alert("Payment recorded but balance update failed. Please refresh.")
//       } else {
//         setGroup((g: any) => ({ 
//           ...g, 
//           shared_wallet_balance: newWalletBalance, 
//           total_spent: newTotalSpent 
//         }))
//         setFamilies(normalizedFamilies)
//         setTransactions((prev) => [inserted, ...prev].slice(0, 10))
//       }

//       setPayMerchantOpen(false)
//     } catch (error) {
//       alert("An unexpected error occurred.")
//     }
//   }

//   if (loading || !group)
//     return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>

//   return (
//     <div className="min-h-screen bg-background">
//       <Header groupName={group.name} />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{group.name}</h1>
//           <p className="text-muted-foreground">{group.description}</p>
//         </div>

//         <div className="grid gap-6 lg:grid-cols-3">
//           <div className="lg:col-span-2 space-y-6">
//             <WalletCard
//               balance={group.shared_wallet_balance}
//               totalContributions={totalContributions}
//               totalSpent={group.total_spent || 0}
//               onAddFunds={() => setAddFundsOpen(true)}
//               onPayMerchant={() => setPayMerchantOpen(true)}
//             />

//             <StatsCards
//               totalMembers={totalMembers}
//               totalSpent={group.total_spent || 0}
//               walletBalance={group.shared_wallet_balance}
//               pendingApprovals={pendingTransactions}
//             />

//             <Card className="p-4 md:p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
//                 <Button variant="ghost" size="sm" asChild className="gap-1">
//                   <Link href="/transactions">
//                     View All <ChevronRightIcon className="w-4 h-4" />
//                   </Link>
//                 </Button>
//               </div>

//               <div className="divide-y divide-border">
//                 {transactions.length === 0 ? (
//                   <p className="text-sm py-3 text-muted-foreground">No recent transactions</p>
//                 ) : (
//                   transactions.map((transaction) => (
//                     <TransactionItem
//                       key={transaction.id}
//                       transaction={transaction}
//                       onClick={() => {}}
//                     />
//                   ))
//                 )}
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-6">
//             <QuickActions
//               families={families}
//               walletBalance={group.shared_wallet_balance}
//             />

//             <Card className="p-4 md:p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-foreground">Families & Members</h2>
//                 <Button variant="ghost" size="sm" asChild className="gap-1">
//                   <Link href="/members">
//                     Manage <ChevronRightIcon className="w-4 h-4" />
//                   </Link>
//                 </Button>
//               </div>

//               <div className="space-y-3">
//                 {families.map((family) => (
//                   <FamilyCard key={family.id} family={family} onClick={() => {}} />
//                 ))}
//               </div>
//             </Card>
//           </div>
//         </div>
//       </main>

//       <AddFundsDialog
//         open={addFundsOpen}
//         onOpenChange={setAddFundsOpen}
//         families={families}
//         onSubmit={handleAddFundsSubmit}
//       />

//       <PayMerchantDialog
//         open={payMerchantOpen}
//         onOpenChange={setPayMerchantOpen}
//         families={families}
//         walletBalance={group.shared_wallet_balance}
//         onSubmit={handlePayMerchantSubmit}
//       />
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Header } from "@/components/dashboard/header"
import { WalletCard } from "@/components/dashboard/wallet-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FamilyCard } from "@/components/dashboard/family-card"
import { TransactionItem } from "@/components/dashboard/transaction-item"
import { QuickActions } from "@/components/dashboard/quick-actions"

import { AddFundsDialog } from "@/components/wallet/add-funds-dialog"
import { PayMerchantDialog } from "@/components/wallet/pay-merchant-dialog"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon } from "@/components/icons"

import Link from "next/link"
import { normalizeSplitType } from "@/lib/utils"

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<any>(null)
  const [families, setFamilies] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [payMerchantOpen, setPayMerchantOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)

      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: gm } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("profile_id", user.id)
          .maybeSingle()

        if (!gm) {
          router.push("/settings")
          return
        }

        const groupId = gm.group_id

        const { data: groupRow } = await supabase
          .from("groups")
          .select("*")
          .eq("id", groupId)
          .maybeSingle()

        const { data: familyRows } = await supabase
          .from("families")
          .select("*, family_members(*)")
          .eq("group_id", groupId)

        // Load ALL transactions for accurate aggregate stats; UI slices to last 10 for the Recent list.
        const { data: trx } = await supabase
          .from("transactions")
          .select("*")
          .eq("group_id", groupId)
          .order("created_at", { ascending: false })

        if (!mounted) return

        const normalizedFamilies = (familyRows || []).map((family) => ({
          id: family.id,
          name: family.name,
          balance: Number(family.balance || 0),
          totalContribution: Number(family.total_contribution || 0),
          members: (family.family_members || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            type: m.member_type,
            age: m.age,
            shareRatio: Number(m.share_ratio),
            avatar: m.avatar_url || null,
          })),
        }))

        setGroup(groupRow || null)
        setFamilies(normalizedFamilies)
        setTransactions(trx || [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  useEffect(() => {
    if (!group) return
    
    const channel = supabase
      .channel("realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `group_id=eq.${group.id}` },
        (payload) => {
          const newRow = payload.new
          if (!newRow) return
          
          setTransactions((prev) => [newRow, ...prev].slice(0, 10))
          
          // Wallet balance is now derived from `transactions` state, no manual mutation needed.
          console.log("🔔 New transaction received via realtime:", newRow)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [group, supabase])

  // ----------------------------------
  // SINGLE SOURCE OF TRUTH FOR WALLET BALANCE
  // walletBalance = totalDeposits − totalPayments (only confirmed rows)
  // ----------------------------------
  const totalMembers = families.reduce((acc, fam) => acc + fam.members.length, 0)
  const totalContributions = families.reduce((acc, fam) => acc + fam.totalContribution, 0)
  const totalDeposits = transactions
    .filter((t) => t.type === "deposit" && t.status === "confirmed")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  const totalPayments = transactions
    .filter((t) => t.type === "payment" && t.status === "confirmed")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0)
  const walletBalance = totalDeposits - totalPayments
  const totalExpenses = totalPayments
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length

  // Family balances are derived so that sum(family.balance) === walletBalance.
  // Each family bears the wallet balance in proportion to its contribution share.
  const displayFamilies = families.map((f) => {
    const share = totalContributions > 0 ? f.totalContribution / totalContributions : 0
    return { ...f, balance: walletBalance * share }
  })

  console.log("📊 Dashboard stats", {
    totalDeposits,
    totalPayments,
    walletBalance,
    totalContributions,
    storedSharedWalletBalance: group?.shared_wallet_balance,
    families: displayFamilies.map((f) => ({ name: f.name, contribution: f.totalContribution, derivedBalance: f.balance })),
  })

  const handleAddFundsSubmit = async ({ 
    familyId, 
    amount 
  }: { 
    familyId?: string
    amount: number 
  }) => {
    if (!group) return

    try {
      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert({
          group_id: group.id,
          type: "deposit",
          description: familyId 
            ? `${families.find(f => f.id === familyId)?.name || "Family"} deposit`
            : "Group deposit",
          amount: amount,
          status: "confirmed",
          paid_by: null,
          paid_by_name: familyId 
            ? families.find(f => f.id === familyId)?.name 
            : "Group",
        })
        .select()
        .single()

      if (insertError) {
        alert("Failed to add funds. Please try again.")
        return
      }

      if (familyId) {
        const family = families.find(f => f.id === familyId)
        if (family) {
          const newFamilyBalance = Number(family.balance || 0) + Number(amount)
          const newFamilyContribution = Number(family.totalContribution || 0) + Number(amount)

          await supabase
            .from("families")
            .update({ 
              balance: newFamilyBalance,
              total_contribution: newFamilyContribution 
            })
            .eq("id", familyId)
        }
      }

      const { data: updatedFamilies } = await supabase
        .from("families")
        .select("*, family_members(*)")
        .eq("group_id", group.id)

      const normalizedFamilies = (updatedFamilies || []).map((family) => ({
        id: family.id,
        name: family.name,
        balance: Number(family.balance || 0),
        totalContribution: Number(family.total_contribution || 0),
        members: (family.family_members || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          type: m.member_type,
          age: m.age,
          shareRatio: Number(m.share_ratio),
          avatar: m.avatar || null,
        })),
      }))

      const newWalletBalance = normalizedFamilies.reduce((sum, f) => sum + f.balance, 0)
      
      const { error: updateError } = await supabase
        .from("groups")
        .update({ shared_wallet_balance: newWalletBalance })
        .eq("id", group.id)

      if (updateError) {
        alert("Funds added but balance update failed. Please refresh.")
      } else {
        setGroup((g: any) => ({ ...g, shared_wallet_balance: newWalletBalance }))
        setFamilies(normalizedFamilies)
        setTransactions((prev) => [inserted, ...prev].slice(0, 10))
      }

      setAddFundsOpen(false)
    } catch (error) {
      alert("An unexpected error occurred.")
    }
  }

  const handlePayMerchantSubmit = async (data: {
    merchantName: string
    amount: number
    description: string
    category: string
    splitType?: string
    splitAmong?: string[]
  }) => {
    if (!group) return

    console.log("💰 Dashboard received:", data)
    console.log("👥 Split among:", data.splitAmong)

    try {
      let totalShares = 0
      let familySplits: { familyId: string; shares: number; amount: number }[] = []

      console.log("🔍 All families:", families.map(f => ({ 
        name: f.name, 
        members: f.members.map(m => ({ name: m.name, id: m.id.substring(0, 8) + "...", type: m.type }))
      })))

      families.forEach(family => {
        let familyShares = 0
        
        family.members.forEach((member: any) => {
          let shouldInclude = false

          if (data.splitType === "everyone") {
            shouldInclude = true
          } else if (data.splitType === "adults") {
            shouldInclude = member.type === "adult"
          } else if (data.splitType === "kids") {
            shouldInclude = member.type !== "adult"
          } else if (data.splitType === "custom" && data.splitAmong) {
            shouldInclude = data.splitAmong.includes(member.id)
          } else {
            shouldInclude = true
          }

          console.log(`👤 ${member.name} (${member.id.substring(0, 8)}...): type=${member.type}, included=${shouldInclude}`)

          if (shouldInclude) {
            familyShares += Number(member.shareRatio || 1)
          }
        })

        console.log(`👨‍👩‍👧 ${family.name}: ${familyShares} shares`)

        if (familyShares > 0) {
          totalShares += familyShares
          familySplits.push({
            familyId: family.id,
            shares: familyShares,
            amount: 0
          })
        }
      })

      console.log("📊 Total shares:", totalShares)
      console.log("📊 Family splits BEFORE amount:", familySplits)

      familySplits = familySplits.map(split => ({
        ...split,
        amount: (split.shares / totalShares) * data.amount
      }))

      console.log("📊 Family splits AFTER amount:", familySplits)

      // Validate family balances BEFORE payment
      for (const split of familySplits) {
        const family = families.find(f => f.id === split.familyId)
        if (family) {
          const newBalance = Number(family.balance || 0) - split.amount
          if (newBalance < 0) {
            alert(`${family.name} has insufficient balance (₹${family.balance.toFixed(2)}). They need ₹${Math.abs(newBalance).toFixed(2)} more.`)
            return
          }
        }
      }

      const splitAmong: string[] = data.splitAmong || []

      const txPayload = {
        group_id: group.id,
        type: "payment",
        description: data.description,
        amount: data.amount,
        merchant_name: data.merchantName,
        category: data.category,
        status: "confirmed",
        paid_by_name: "Group Wallet",
        split_type: normalizeSplitType(data.splitType),
      }
      console.log("📦 Transaction insert payload:", txPayload)

      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert(txPayload)
        .select()
        .single()

      if (insertError) {
        console.error("❌ Insert error:", insertError)
        alert("Payment failed. Please try again.")
        return
      }

      console.log("✅ Transaction inserted:", inserted)

      // Insert per-member split rows into the normalized transaction_splits table
      if (inserted && splitAmong.length > 0) {
        const perMemberAmount = Number(data.amount) / splitAmong.length
        const splitRows = splitAmong.map((memberId) => ({
          transaction_id: inserted.id,
          member_id: memberId,
          amount: perMemberAmount,
        }))

        const { data: splitsInserted, error: splitsError } = await supabase
          .from("transaction_splits")
          .insert(splitRows)
          .select()

        if (splitsError) {
          console.error("❌ Transaction splits insert error:", splitsError)
        } else {
          console.log("✅ Transaction splits inserted:", splitsInserted)
        }
      }

      for (const split of familySplits) {
        const family = families.find(f => f.id === split.familyId)
        if (family) {
          const newFamilyBalance = Number(family.balance || 0) - split.amount

          await supabase
            .from("families")
            .update({ balance: newFamilyBalance })
            .eq("id", split.familyId)
          
          console.log(`💸 ${family.name}: ${family.balance} → ${newFamilyBalance}`)
        }
      }

      const { data: updatedFamilies } = await supabase
        .from("families")
        .select("*, family_members(*)")
        .eq("group_id", group.id)

      const normalizedFamilies = (updatedFamilies || []).map((family) => ({
        id: family.id,
        name: family.name,
        balance: Number(family.balance || 0),
        totalContribution: Number(family.total_contribution || 0),
        members: (family.family_members || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          type: m.member_type,
          age: m.age,
          shareRatio: Number(m.share_ratio),
          avatar: m.avatar || null,
        })),
      }))

      const newWalletBalance = normalizedFamilies.reduce((sum, f) => sum + f.balance, 0)

      console.log("💰 New wallet balance:", newWalletBalance)

      const { error: updateError } = await supabase
        .from("groups")
        .update({
          shared_wallet_balance: newWalletBalance,
        })
        .eq("id", group.id)

      if (updateError) {
        console.error("❌ Group update error:", updateError)
        alert("Payment recorded but balance update failed. Please refresh.")
      } else {
        setGroup((g: any) => ({ 
          ...g, 
          shared_wallet_balance: newWalletBalance, 
        }))
        setFamilies(normalizedFamilies)
        setTransactions((prev) => [inserted, ...prev].slice(0, 10))
        console.log("✅ Payment complete!")
      }

      setPayMerchantOpen(false)
    } catch (error) {
      console.error("❌ Unexpected error:", error)
      alert("An unexpected error occurred.")
    }
  }

  if (loading || !group)
    return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <WalletCard
              balance={walletBalance}
              totalContributions={totalDeposits}
              totalSpent={totalPayments}
              onAddFunds={() => setAddFundsOpen(true)}
              onPayMerchant={() => setPayMerchantOpen(true)}
            />

            <StatsCards
              totalMembers={totalMembers}
              totalSpent={totalPayments}
              walletBalance={walletBalance}
              pendingApprovals={pendingTransactions}
            />

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/transactions">
                    View All <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <p className="text-sm py-3 text-muted-foreground">No recent transactions</p>
                ) : (
                  transactions.slice(0, 10).map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => {}}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions
              families={displayFamilies}
              walletBalance={walletBalance}
              onAddFunds={() => setAddFundsOpen(true)}
              onPayMerchant={() => setPayMerchantOpen(true)}
            />

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Families & Members</h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link href="/members">
                    Manage <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {displayFamilies.map((family) => (
                  <FamilyCard key={family.id} family={family} onClick={() => {}} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <AddFundsDialog
        open={addFundsOpen}
        onOpenChange={setAddFundsOpen}
        families={displayFamilies}
        onSubmit={handleAddFundsSubmit}
      />

      <PayMerchantDialog
        open={payMerchantOpen}
        onOpenChange={setPayMerchantOpen}
        families={displayFamilies}
        walletBalance={walletBalance}
        onSubmit={handlePayMerchantSubmit}
      />
    </div>
  )
}
