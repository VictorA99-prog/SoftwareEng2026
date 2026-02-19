"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const supabase = createClient();
  const [email, setEmail] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      
    alert(error ? error.message : "Check your email for the login link.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={signIn} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <input
          className="w-full border rounded p-2"
          type="email"
          required
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full rounded bg-black text-white p-2">
          Send magic link
        </button>
      </form>
    </div>
  );
}
