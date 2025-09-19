import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
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

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = req.cookies.getAll()
            return cookies.map((c) => ({ name: c.name, value: c.value }))
          },
          setAll(cookies) {
            for (const { name, value, options } of cookies as Array<{ name: string; value: string; options?: CookieOptions }>) {
              res.cookies.set({ name, value, ...(options || {}) })
            }
          },
        },
      }
    )

    await supabase.auth.signOut()

    return res
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}


