"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { AlertMessage } from "./alert-message"
import { Mail } from 'lucide-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError("Login failed")
      setLoading(false)
      return
    }

    // Persist auth cookies on server so middleware sees the session
    if (data.session?.access_token && data.session.refresh_token) {
      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      })
    }

    // Step 1: fetch numeric role id from Users
    const { data: userRow, error: usersError } = await supabase
      .from("Users")
      .select("id, role")
      .eq("id", data.user.id)
      .single()

    setLoading(false)

    if (usersError || !userRow) {
      setError("Account niet gevonden in Users")
      return
    }

    // Step 2: look up role name from roles table
    let roleName: string | null = null
    if ((userRow as any)?.role !== undefined && (userRow as any)?.role !== null) {
      const { data: roleRow } = await supabase
        .from("roles")
        .select("role_name")
        .eq("id", (userRow as any).role)
        .single()
      roleName = (roleRow as any)?.role_name ?? null
    }

    const isAdmin = roleName === "admin" || roleName === "supa_admin"
    console.log("Login roleName:", roleName, "isAdmin:", isAdmin)
    const destination = isAdmin ? "/admin" : "/dashboard"
    router.push(destination)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AlertMessage error={error || undefined} success successMessage="Logged in successfully!" />
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 justify-center">
        <Mail />
        <a href="/login/sign-in">
          Sign In with Magic Link
        </a>
      </div>
    </div>
  )
}
