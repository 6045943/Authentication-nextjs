import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect admin route and ensure user has admin role
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/login"
      redirectUrl.searchParams.set("redirectedFrom", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Fetch role id from Users, then role name from roles
    const { data: userRow } = await supabase
      .from("Users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    let roleName: string | null = null
    if ((userRow as any)?.role !== undefined && (userRow as any)?.role !== null) {
      const { data: rolesRow } = await supabase
        .from("roles")
        .select("role_name")
        .eq("id", (userRow as any).role)
        .single()
      roleName = (rolesRow as any)?.role_name ?? null
    }

    const isAdmin = roleName === "admin" || roleName === "supa_admin"
    console.log("Middleware roleName:", roleName, "isAdmin:", isAdmin, "path:", pathname) // ZICHTBAAR IN TERMINAL
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
}