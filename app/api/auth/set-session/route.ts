import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

type CookieOptions = Partial<{
  path: string;
  domain: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  expires: Date;
}>;

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
          getAll() {
            const cookieHeader = request.headers.get("cookie") || ""
            if (!cookieHeader) return []
            return cookieHeader.split("; ").map((cookie) => {
              const index = cookie.indexOf("=")
              const name = cookie.substring(0, index)
              const value = cookie.substring(index + 1)
              return { name, value }
            })
          },
          setAll(cookies) {
            for (const { name, value, options } of cookies as Array<{ name: string; value: string; options?: CookieOptions }>) {
              response.cookies.set({ name, value, ...(options || {}) })
            }
          },
        },
      }
    )

    await supabase.auth.setSession({ access_token, refresh_token })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}


