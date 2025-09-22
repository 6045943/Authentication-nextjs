"use client"

import { useRouter } from "next/navigation"
import { Mail } from 'lucide-react';
import { AuthForm } from "./auth-form"
import { authService } from "@/lib/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  return (
    <div className={"flex flex-col gap-6 " + (className ?? "")} {...props}>
      <AuthForm
        title="Login to your account"
        description="Enter your email below to login to your account"
        submitLabel="Login"
        successMessage="Logged in successfully!"
        beforeFields={
          <div className="hidden" />
        }
        footer={
          <>
            Don&apos;t have an account? <a href="/register" className="underline underline-offset-4">Sign up</a>
          </>
        }
        onSubmitCredentials={async (email, password, _setLoading, setErr, setSucc) => {
          const result = await authService.signInWithPassword(email, password)
          if (!result.userId || result.error) {
            setErr(result.error || "Login failed")
            return
          }
          setSucc(true)
          await authService.persistSessionOnServer(result.accessToken, result.refreshToken)
          const roleName = await authService.getUserRoleName(result.userId)
          const destination = authService.getDestinationForRole(roleName)
          router.push(destination)
        }}
      />
      <div className="flex items-center gap-2 justify-center">
        <Mail />
        <a href="/login/sign-in">
          Sign In with Magic Link
        </a>
      </div>
    </div>
  )
}
