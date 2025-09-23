"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { organisationService } from "@/lib/organisation"
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
      await organisationService.createUserOrganisationAdmin({
        email,
        password,
        displayName,
        location,
      })
      setSuccess(true)
      router.push("/login")
    } catch (err: any) {
      setError(err?.message || "Failed to create organisation")
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
