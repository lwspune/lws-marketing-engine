import Link from "next/link";

/** Top bar shared by the Queue and Insights pages. */
export function Nav({ current }: { current: "queue" | "insights" }) {
  const item = (href: string, id: typeof current, label: string) => (
    <Link href={href} aria-current={current === id ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 text-sm ${current === id ? "bg-panel text-fg" : "text-muted hover:text-fg"}`}>{label}</Link>
  );
  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <div className="flex items-center gap-2">
        <span className="mr-2 font-mono text-lg font-semibold">LWS Publisher</span>
        <nav aria-label="Sections" className="flex gap-1">
          {item("/", "queue", "Queue")}
          {item("/insights", "insights", "Insights")}
        </nav>
      </div>
      <form action="/auth/signout" method="post">
        <button type="submit" className="btn px-3 py-1.5 text-xs">Sign out</button>
      </form>
    </header>
  );
}
