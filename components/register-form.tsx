"use client"

import { useRouter } from "next/navigation"
import { AuthForm } from "./auth-form"
import { authService } from "@/lib/auth"

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()

  return (
    <div className={"flex flex-col gap-6 " + (className ?? "")} {...props}>
      <AuthForm
        title="Create new account"
        description="Enter your email below to create a new account"
        submitLabel="Register"
        successMessage="Account created successfully!"
        onSubmitCredentials={async (email, password, _setLoading, setErr, setSucc) => {
          const result = await authService.signUpWithPassword(email, password)
          if (!result.userId || result.error) {
            setErr(result.error || "User not created")
            return
          }
          setSucc(true)
          router.push("/login")
        }}
        footer={
          <>
            Already have an account? <a href="/login" className="underline underline-offset-4">Log in</a>
          </>
        }
      />
    </div>
  )
}