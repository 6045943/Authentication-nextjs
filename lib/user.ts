import { supabase } from "./supabaseClient"

export class UserService {
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

export const userService = new UserService()


