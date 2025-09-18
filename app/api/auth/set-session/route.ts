import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.headers.get("cookie")?.split(`${name}=`)[1]
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: "", ...options })
          },
        },
      }
    )

    await supabase.auth.setSession({ access_token, refresh_token })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}


