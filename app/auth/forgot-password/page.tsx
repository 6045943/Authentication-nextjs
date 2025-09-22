"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password?recovery=1`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the password reset link.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-semibold">Forgot your password?</h1>
      <p className="text-sm text-gray-600">
        Enter your email, and we’ll send you a reset link.
      </p>
<form onSubmit={handleResetPassword} className="space-y-3">
  <div className="grid gap-2">
    <Label>Email</Label>
    <div className="flex items-center space-x-2">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />
      <Button asChild>
        <a href="/login">Back to login</a>
      </Button>
    </div>
  </div>

  <Button type="submit" disabled={loading} className="w-full">
    {loading ? "Sending..." : "Send reset link"}
  </Button>
</form>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
