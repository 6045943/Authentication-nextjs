import { supabase } from "./supabaseClient"

export class MagicLinkService {
  async sendMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      throw new Error(error.message)
    }
  }
}

export const magicLinkService = new MagicLinkService()


