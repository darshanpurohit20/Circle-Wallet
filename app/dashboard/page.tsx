import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  // 1️⃣ Create Supabase client (server-safe cookies)
  const supabase = createClient()

  // 2️⃣ Get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 3️⃣ Does the user OWN a group?
  const { data: ownedGroup } = await supabase
    .from("groups")
    .select("id")
    .eq("created_by", user.id)
    .maybeSingle()

  // 4️⃣ Is the user a MEMBER of a group?
  const { data: memberGroup } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", user.id)
    .maybeSingle()

  // 5️⃣ Determine the user's active group
  const userGroup = ownedGroup?.id || memberGroup?.group_id || null

  // 6️⃣ ❌ NEW USER → No group → instant redirect
  if (!userGroup) {
    redirect("/settings")  // ⬅ instantly redirects
  }

  // 7️⃣ ✔ User has a group → load dashboard
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Your Group ID: {userGroup}
      </p>
    </div>
  )
}
