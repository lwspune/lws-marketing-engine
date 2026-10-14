import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Shared bits for the local setup scripts. They run on your computer with the service-role key
// from .env.local (never committed) and talk to the LIVE Supabase project.

config({ path: ".env.local" });

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** --name=value flags → { name: value }. */
export function flags(argv = process.argv.slice(2)): Record<string, string> {
  return Object.fromEntries(argv.filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.join("=")];
  }));
}

export function need(f: Record<string, string>, name: string): string {
  const v = f[name];
  if (!v) throw new Error(`Missing --${name}=…`);
  return v;
}

export function run(main: () => Promise<void>) {
  main().catch((e) => {
    console.error(`\n✗ ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
}
