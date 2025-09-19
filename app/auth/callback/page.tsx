"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)
      const tokenHash = url.searchParams.get("token_hash")
      const type = (url.searchParams.get("type") || "magiclink") as "magiclink" | "recovery" | "email_change" | "invite"

      if (!tokenHash) {
        router.replace("/login")
        return
      }

      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      } as any)

      if (error || !data?.session) {
        router.replace("/login")
        return
      }

      const { access_token, refresh_token } = data.session
      const res = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token }),
      })

      if (!res.ok) {
        router.replace("/login")
        return
      }

      router.replace("/dashboard")
    }

    run()
  }, [router])

  return null
}
