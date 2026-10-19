// Who sees what in the app (the database enforces it; this only decides what to show).
// Staff (migration 0011) see their projects only and never ads; owners and editors see the whole org.
// DMs (migration 0012) are owners only.

/** True when any of the user's memberships is a full one (owner or editor). */
export const seesAds = (roles: readonly string[]): boolean => roles.some((r) => r !== "staff");

/** True when any of the user's memberships is an owner one. */
export const seesInbox = (roles: readonly string[]): boolean => roles.includes("owner");
