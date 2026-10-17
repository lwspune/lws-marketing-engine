"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Nav";

// Email + password, with an email magic link as a fallback. Logins are created only by
// `npm run seed` (sign-ups are off in Supabase), and `shouldCreateUser: false` keeps the
// magic link from creating accounts either.
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "sent" | "error"; message?: string }>({ kind: "idle" });

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "busy" });
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) return setState({ kind: "error", message: "Wrong email or password." });
    router.replace("/");
    router.refresh();
  }

  async function sendLink() {
    if (!email.trim()) return setState({ kind: "error", message: "Enter your email first." });
    setState({ kind: "busy" });
    const { error } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setState(error ? { kind: "error", message: "That email isn't invited, or sign-in is busy. Try again in a minute." } : { kind: "sent" });
  }

  const busy = state.kind === "busy";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">LWS Publisher</h1>
        <p className="mt-1 text-sm text-muted">Approve ready posts. Nothing goes out without you.</p>
      </div>
      {state.kind === "sent" ? (
        <p role="status" className="card border-accent/40 p-5 text-sm">
          Check <strong>{email}</strong> for a sign-in link.
        </p>
      ) : (
        <form onSubmit={signIn} className="card space-y-4 p-6">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} className="field" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {state.kind === "error" && <p role="alert" className="text-sm text-danger">{state.message}</p>}
          <button type="button" onClick={sendLink} disabled={busy}
            className="w-full rounded-lg py-1 text-center text-sm text-muted underline decoration-muted/40 underline-offset-4 hover:text-fg">
            Forgot it? Email me a sign-in link instead
          </button>
        </form>
      )}
    </main>
  );
}
