"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Email magic link. `shouldCreateUser: false` means only people already invited in Supabase can
// sign in; nobody can sign themselves up.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; message?: string }>({ kind: "idle" });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    const { error } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setState(error ? { kind: "error", message: "That email isn't invited, or sign-in is busy. Try again in a minute." } : { kind: "sent" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-mono text-xl font-semibold">LWS Publisher</h1>
      <p className="mt-1 text-sm text-muted">Approve ready posts. Nothing goes out without you.</p>
      {state.kind === "sent" ? (
        <p role="status" className="mt-8 rounded-md border border-accent/40 bg-panel p-4 text-sm">
          Check <strong>{email}</strong> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={send} className="mt-8 space-y-3">
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
          <button type="submit" className="btn btn-primary w-full" disabled={state.kind === "sending"}>
            {state.kind === "sending" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {state.kind === "error" && <p role="alert" className="text-sm text-danger">{state.message}</p>}
        </form>
      )}
    </main>
  );
}
