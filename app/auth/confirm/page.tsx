"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { VerifyOtpParams } from "@supabase/supabase-js"
import { sessionService } from "@/lib/session"

export default function AuthConfirmPage() {
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

      const params: VerifyOtpParams = {
        type,
        token_hash: tokenHash,
      }
      try {
        await sessionService.verifyOtpAndPersist(params)
      } catch {
        router.replace("/login")
        return
      }

      router.replace("/dashboard")
    }

    run()
  }, [router])

  return null
}
