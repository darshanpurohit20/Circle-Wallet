import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to home page which is the main dashboard
  redirect("/")
}
