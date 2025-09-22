"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { AlertMessage } from "@/components/alert-message"

export default function RegisterOrganisationPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      // 1) Maak auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError || !signUpData.user?.id) {
        setError(signUpError?.message || "Failed to register user")
        return
      }
      const userId = signUpData.user.id

      // 2) Maak Users entry met rol = admin
      // ⚠️ LET OP: hier gebruik ik upsert, zodat duplicate key errors niet meer voorkomen
      const { error: userError } = await supabase
        .from("Users")
        .upsert({ id: userId, email, role: 2 }) // 2 = admin
      if (userError) {
        setError(userError.message)
        return
      }

      // 3) Maak organisatie
      const { data: orgInsert, error: orgError } = await supabase
        .from("organisations")
        .insert({ display_name: displayName, location })
        .select("id")
        .single()
      if (orgError || !orgInsert?.id) {
        setError(orgError?.message || "Failed to create organisation")
        return
      }

      // 4) Link user aan organisatie
      const { error: linkError } = await supabase
        .from("user_organisations")
        .insert({ user_id: userId, organisation_id: orgInsert.id })
      if (linkError) {
        setError(linkError.message)
        return
      }

      // 5) Klaar
      setSuccess(true)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <AlertMessage error={error || undefined} success={success || undefined} successMessage="Account en organisatie aangemaakt! Log nu in."/>
      <Card>
        <CardHeader>
          <CardTitle>Create organisation</CardTitle>
          <CardDescription>Create an organisation while registering your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Organisation name</Label>
              <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Register & Create"}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/register">Back</a>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
