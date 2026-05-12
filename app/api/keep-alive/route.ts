import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET(request: Request) {
  // Security check: ensure the request is actually coming from Vercel Cron
  // If CRON_SECRET is not set in env, we allow it (for local testing)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Perform a lightweight query to register activity on the Supabase database
    const { error } = await supabase.from('profiles').select('id').limit(1)
    
    if (error) throw error

    return NextResponse.json({ 
      status: "success", 
      message: "Database pinged successfully to prevent auto-pause.", 
      timestamp: new Date().toISOString() 
    })
  } catch (error: any) {
    console.error("Keep-alive error:", error)
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 })
  }
}
