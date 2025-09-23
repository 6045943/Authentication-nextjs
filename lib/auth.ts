import { supabase } from "./supabaseClient"
import { userService } from "./user"

type SignInResult = { userId: string | null; accessToken?: string; refreshToken?: string; error?: string }
type SignUpResult = { userId: string | null; error?: string }

export class AuthService {
  async signInWithPassword(email: string, password: string): Promise<SignInResult> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { userId: null, error: error.message }
    const userId = data.user?.id ?? null
    return {
      userId,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    }
  }

  async signUpWithPassword(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { userId: null, error: error.message }
    const userId = data.user?.id ?? null
    return { userId }
  }

  async persistSessionOnServer(accessToken?: string, refreshToken?: string) {
    if (!accessToken || !refreshToken) return
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    })
  }

  async getUserRoleName(userId: string): Promise<string | null> {
    return userService.getUserRoleName(userId)
  }

  getDestinationForRole(roleName: string | null): string {
    return userService.getDestinationForRole(roleName)
  }
}

export const authService = new AuthService()


