import Link from "next/link";

/** The green "G" mark, shared by the top bar and the sign-in page. */
export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-[#2a9d7a] font-bold text-on-accent shadow-glow ${size === "lg" ? "h-10 w-10 text-lg" : "h-7 w-7 text-sm"}`}>
      G
    </span>
  );
}

/**
 * Top bar shared by every page. `ads={false}` hides the Ads tab (staff logins); `inbox` shows the Inbox and Leads
 * tabs (owners only: DMs, migration 0012; leads, 0016).
 */
export function Nav({ current, ads = true, inbox = false }: { current: "queue" | "inbox" | "leads" | "ads" | "insights"; ads?: boolean; inbox?: boolean }) {
  const item = (href: string, id: typeof current, label: string) => (
    <Link href={href} aria-current={current === id ? "page" : undefined} className="seg-item px-2 sm:px-3">{label}</Link>
  );
  return (
    <header className="sticky top-0 z-10 border-b border-line/70 bg-bg/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:gap-3">
        <Link href="/" className="flex items-center gap-2 rounded-lg" aria-label="GoPost, go to the queue">
          <Logo />
          <span className="hidden font-semibold tracking-tight sm:inline">GoPost</span>
        </Link>
        <nav aria-label="Sections" className="seg sm:ml-4">
          {item("/", "queue", "Queue")}
          {inbox && item("/inbox", "inbox", "Inbox")}
          {inbox && item("/leads", "leads", "Leads")}
          {ads && item("/ads", "ads", "Ads")}
          {item("/insights", "insights", "Insights")}
        </nav>
        <form action="/auth/signout" method="post" className="ml-auto">
          <button type="submit" className="whitespace-nowrap rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-white/[0.06] hover:text-fg">Sign out</button>
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
