import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Magic-link landing: swap the one-time code for a session cookie, then go to the dashboard.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await createSupabaseServerClient().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", url.origin));
    console.error("auth callback: code exchange failed", { error: error.message });
  }
  return NextResponse.redirect(new URL("/login", url.origin));
}
