"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refreshUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // sends them back to your site after clicking the email link
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) setStatus(error.message);
    else setStatus("Magic link sent! Check your email.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("Signed out.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 border-4 border-black p-6">
        <h1 className="text-2xl font-black uppercase">Admin Login</h1>

        {userEmail ? (
          <>
            <p className="font-semibold">Logged in as:</p>
            <p className="break-all">{userEmail}</p>

            <div className="flex gap-3">
              <a
                href="/admin"
                className="inline-flex items-center rounded bg-black text-white px-4 py-2"
              >
                Go to Admin
              </a>
              <button
                onClick={signOut}
                className="inline-flex items-center rounded border-2 border-black px-4 py-2"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              className="w-full border-2 border-black rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              type="email"
              required
            />
            <button className="w-full rounded bg-black text-white p-2">
              Send magic link
            </button>
          </form>
        )}

        {status ? (
          <div className="text-sm border-2 border-black p-2">{status}</div>
        ) : null}
      </div>
    </div>
  );
}
