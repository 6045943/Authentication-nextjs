import { supabase } from "./supabaseClient"

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
    const { data: userRow, error: usersError } = await supabase
      .from("Users")
      .select("id, role")
      .eq("id", userId)
      .single()

    if (usersError || !userRow) return null

    const { role: roleId } = userRow as { id: string; role: string | number | null }
    if (roleId === undefined || roleId === null) return null

    const { data: roleRow } = await supabase
      .from("roles")
      .select("role_name")
      .eq("id", roleId)
      .single()

    const roleName = (roleRow as { role_name: string } | null)?.role_name ?? null
    return roleName
  }

  getDestinationForRole(roleName: string | null): string {
    const isAdmin = roleName === "admin" || roleName === "supa_admin"
    return isAdmin ? "/admin" : "/dashboard"
  }
}

export const authService = new AuthService()


