"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Your password has been updated! You can now log in.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-semibold">Set a new password</h1>
      <form onSubmit={handleUpdatePassword} className="space-y-3">
        <div className="grid gap-2">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Update password</Button>
      </form>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
