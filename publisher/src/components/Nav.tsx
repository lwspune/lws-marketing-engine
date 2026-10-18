import Link from "next/link";

/** The green "L" mark, shared by the top bar and the sign-in page. */
export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-[#2a9d7a] font-bold text-on-accent shadow-glow ${size === "lg" ? "h-10 w-10 text-lg" : "h-7 w-7 text-sm"}`}>
      L
    </span>
  );
}

/** Top bar shared by the Queue, Ads and Insights pages. `ads={false}` hides the Ads tab (staff logins). */
export function Nav({ current, ads = true }: { current: "queue" | "ads" | "insights"; ads?: boolean }) {
  const item = (href: string, id: typeof current, label: string) => (
    <Link href={href} aria-current={current === id ? "page" : undefined} className="seg-item">{label}</Link>
  );
  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="LWS Publisher, go to the queue">
          <Logo />
          <span className="hidden font-semibold tracking-tight sm:inline">LWS Publisher</span>
        </Link>
        <nav aria-label="Sections" className="seg sm:ml-4">
          {item("/", "queue", "Queue")}
          {ads && item("/ads", "ads", "Ads")}
          {item("/insights", "insights", "Insights")}
        </nav>
        <form action="/auth/signout" method="post" className="ml-auto">
          <button type="submit" className="rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.06] hover:text-fg">Sign out</button>
        </form>
      </div>
    </header>
  );
}

/** Visible page title under the top bar. */
export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="page-title">{title}</h1>
      {children && <div className="page-sub">{children}</div>}
    </div>
  );
}
