// Which projects get a button on the Queue. Some projects only ever hold ads (e.g. "LWS Pune ads"),
// so a button for them would always open an empty queue.

/** Projects with at least one post, plus the selected one, in their original order. */
export function queueProjects<T extends { id: string }>(projects: T[], postProjectIds: string[], selectedId: string | null): T[] {
  const used = new Set(postProjectIds);
  return projects.filter((p) => used.has(p.id) || p.id === selectedId);
}
