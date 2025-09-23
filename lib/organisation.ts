import { supabase } from "./supabaseClient"

export type CreateOrganisationInput = {
  email: string
  password: string
  displayName: string
  location?: string
}

export type CreateOrganisationResult = {
  userId: string
  organisationId: number
}

export class OrganisationService {
  async createUserOrganisationAdmin(input: CreateOrganisationInput): Promise<CreateOrganisationResult> {
    const { email, password, displayName, location } = input

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !signUpData.user?.id) {
      throw new Error(signUpError?.message || "Failed to register user")
    }
    const userId = signUpData.user.id

    const { error: userError } = await supabase
      .from("Users")
      .upsert({ id: userId, email, role: 2 })
    if (userError) {
      throw new Error(userError.message)
    }

    const { data: orgInsert, error: orgError } = await supabase
      .from("organisations")
      .insert({ display_name: displayName, location })
      .select("id")
      .single()
    if (orgError || !orgInsert?.id) {
      throw new Error(orgError?.message || "Failed to create organisation")
    }

    const organisationId = orgInsert.id as number

    const { error: linkError } = await supabase
      .from("user_organisations")
      .insert({ user_id: userId, organisation_id: organisationId })
    if (linkError) {
      throw new Error(linkError.message)
    }

    return { userId, organisationId }
  }
}

export const organisationService = new OrganisationService()


