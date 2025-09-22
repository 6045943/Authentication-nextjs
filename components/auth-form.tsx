"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { AlertMessage } from "./alert-message"

type AuthFormProps = React.ComponentProps<"div"> & {
  title: string
  description: string
  submitLabel: string
  onSubmitCredentials: (email: string, password: string, setLoading: (v: boolean) => void, setError: (v: string | null) => void, setSuccess: (v: boolean) => void) => Promise<void> | void
  footer?: React.ReactNode
  beforeFields?: React.ReactNode
  successMessage?: string
  passwordRight?: React.ReactNode
}

export function AuthForm({ className, title, description, submitLabel, onSubmitCredentials, footer, beforeFields, successMessage, passwordRight, ...props }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    try {
      await onSubmitCredentials(email, password, setLoading, setError, setSuccess)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AlertMessage error={error || undefined} success={success || undefined} successMessage={successMessage}
      />
      {beforeFields}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {passwordRight && (
                    <div className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                      {passwordRight}
                    </div>
                  )}
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? `${submitLabel}...` : submitLabel}
                </Button>
              </div>
            </div>
            {footer && <div className="mt-4 text-center text-sm">{footer}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


