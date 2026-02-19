"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  async function refreshUser() {
    const { data } = await supabase.auth.getUser();
    setUserEmail(data.user?.email ?? null);
  }

  useEffect(() => {
    refreshUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshUser());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      setStatus(error.message);
      return;
    }
  
    // Safety: ensure the user is actually available
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setStatus("Signed in, but session not ready. Refreshing…");
    }
  
    // Hard redirect so we don't depend on client router state
    window.location.assign("/admin");
  }
  
  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setStatus(error.message);
    else setStatus("Account created. Now sign in.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("Signed out.");
    setUserEmail(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 border-4 border-black p-6 bg-[#F7E8D6]">
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
          <form className="space-y-3" onSubmit={signIn}>
            <input
              className="w-full border-2 border-black rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              type="email"
              required
            />
            <input
              className="w-full border-2 border-black rounded p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
              required
            />

            <button className="w-full rounded bg-black text-white p-2">
              Sign in
            </button>

            <button
              type="button"
              onClick={signUp}
              className="w-full rounded border-2 border-black p-2"
            >
              Create admin account
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
