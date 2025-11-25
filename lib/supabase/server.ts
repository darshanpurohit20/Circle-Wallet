import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          const store = await cookies()
          return store.getAll()
        },
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options)
            })
          } catch {
            // called during RSC rendering, ignore
          }
        },
      },
    }
  )
}
