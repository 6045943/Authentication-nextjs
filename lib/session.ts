import { supabase } from "./supabaseClient"
import type { VerifyOtpParams } from "@supabase/supabase-js"

export class SessionService {
  async verifyOtpAndPersist(params: VerifyOtpParams): Promise<void> {
    const { data, error } = await supabase.auth.verifyOtp(params)
    if (error || !data?.session) {
      throw new Error(error?.message || "Invalid or expired token")
    }
    const { access_token, refresh_token } = data.session
    const res = await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, refresh_token }),
    })
    if (!res.ok) {
      throw new Error("Failed to persist session")
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      // ignore
    }
  }
}

export const sessionService = new SessionService()


