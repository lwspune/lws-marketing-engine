import { describe, expect, it } from "vitest";
import {
  applyEvent, canReject, canUnapprove, derivePostStatus, isDue, MAX_ATTEMPTS, planApproval, supportedPlatforms,
} from "@/lib/domain/workflow";
import { DomainError, type Post, type Publication } from "@/lib/domain/types";

const NOW = new Date("2026-10-12T12:00:00Z");
const ALL = ["instagram", "facebook", "youtube"] as const;

const post = (over: Partial<Post> = {}): Post => ({
  id: "p1", orgId: "o1", projectId: "pr1", kind: "reel", status: "ready",
  captions: {
    instagram: "Q74 #NDA", facebook: "Q74",
    youtube: { title: "NDA 2026 Maths Q74 #shorts", description: "pyqvault.com" },
  },
  ...over,
});

const pub = (over: Partial<Publication> = {}): Publication => ({
  id: "x1", postId: "p1", platform: "instagram", status: "pending", scheduledAt: null,
  attempts: 0, externalRef: null, externalId: null, permalink: null, error: null, ...over,
});

function codeOf(fn: () => unknown): string | undefined {
  try { fn(); } catch (e) { return e instanceof DomainError ? e.code : "not-a-domain-error"; }
  return undefined;
}

describe("supportedPlatforms", () => {
  it("reels go everywhere; carousels are Instagram-only for now", () => {
    expect(supportedPlatforms("reel")).toEqual(["instagram", "facebook", "youtube"]);
    expect(supportedPlatforms("carousel")).toEqual(["instagram"]);
  });

  it("stories are Instagram-only", () => {
    expect(supportedPlatforms("story")).toEqual(["instagram"]);
  });
});

describe("planApproval — story", () => {
  it("needs no caption (a story has none)", () => {
    const plan = planApproval(post({ kind: "story", captions: {} }), {
      platforms: ["instagram"], scheduledAt: null, now: NOW, connected: [...ALL],
    });
    expect(plan.publications).toEqual([{ platform: "instagram", scheduledAt: null }]);
  });

  it("can't go to Facebook", () => {
    expect(codeOf(() => planApproval(post({ kind: "story", captions: {} }), {
      platforms: ["facebook"], scheduledAt: null, now: NOW, connected: [...ALL],
    }))).toBe("unsupported_platform");
  });
});

describe("planApproval", () => {
  const base = { platforms: ["instagram", "facebook"] as const, scheduledAt: null, now: NOW, connected: [...ALL] };

  it("plans one pending publication per chosen platform", () => {
    const plan = planApproval(post(), { ...base, platforms: [...base.platforms] });
    expect(plan.publications).toEqual([
      { platform: "instagram", scheduledAt: null },
      { platform: "facebook", scheduledAt: null },
    ]);
  });

  it("carries a future schedule onto every publication", () => {
    const at = new Date("2026-10-12T14:00:00Z");
    const plan = planApproval(post(), { ...base, platforms: ["instagram"], scheduledAt: at });
    expect(plan.publications[0].scheduledAt).toEqual(at);
  });

  it("refuses unless the post is ready", () => {
    for (const status of ["approved", "published", "rejected", "failed", "partially_published"] as const) {
      expect(codeOf(() => planApproval(post({ status }), { ...base, platforms: ["instagram"] })), status).toBe("not_ready");
    }
  });

  it("refuses no platforms and duplicate platforms", () => {
    expect(codeOf(() => planApproval(post(), { ...base, platforms: [] }))).toBe("no_platforms");
    expect(codeOf(() => planApproval(post(), { ...base, platforms: ["instagram", "instagram"] }))).toBe("duplicate_platform");
  });

  it("refuses a platform the post kind can't go to", () => {
    expect(codeOf(() => planApproval(post({ kind: "carousel" }), { ...base, platforms: ["youtube"] }))).toBe("unsupported_platform");
  });

  it("refuses a platform that isn't connected for the project", () => {
    expect(codeOf(() => planApproval(post(), { ...base, platforms: ["youtube"], connected: ["instagram"] }))).toBe("not_connected");
  });

  it("refuses when a chosen platform's caption is invalid, naming the problem", () => {
    const p = post({ captions: { instagram: "ok" } });
    expect(codeOf(() => planApproval(p, { ...base, platforms: ["instagram", "youtube"] }))).toBe("invalid_caption");
    expect(() => planApproval(p, { ...base, platforms: ["youtube"] })).toThrow(/YouTube title is empty/);
  });

  it("ignores captions for platforms that weren't chosen", () => {
    const p = post({ captions: { instagram: "ok" } });
    expect(planApproval(p, { ...base, platforms: ["instagram"] }).publications).toHaveLength(1);
  });

  it("refuses a schedule in the past or more than 75 days out", () => {
    expect(codeOf(() => planApproval(post(), { ...base, platforms: ["instagram"], scheduledAt: new Date(NOW.getTime() - 1000) }))).toBe("schedule_in_past");
    const far = new Date(NOW.getTime() + 76 * 86400_000);
    expect(codeOf(() => planApproval(post(), { ...base, platforms: ["instagram"], scheduledAt: far }))).toBe("schedule_too_far");
  });
});

describe("reject / unapprove guards", () => {
  it("only a ready post can be rejected", () => {
    expect(canReject(post())).toBe(true);
    expect(canReject(post({ status: "approved" }))).toBe(false);
  });

  it("an approved post can go back to ready only while nothing has started", () => {
    expect(canUnapprove(post({ status: "approved" }), [pub(), pub({ platform: "facebook" })])).toBe(true);
    expect(canUnapprove(post({ status: "approved" }), [pub(), pub({ status: "processing" })])).toBe(false);
    expect(canUnapprove(post({ status: "ready" }), [])).toBe(false);
  });
});

describe("applyEvent — publication state machine", () => {
  it("pending → processing on start, counting the attempt", () => {
    const next = applyEvent(pub(), { type: "started", externalRef: "container-1" });
    expect(next).toMatchObject({ status: "processing", attempts: 1, externalRef: "container-1", error: null });
  });

  it("processing → published with the live id and link", () => {
    const next = applyEvent(pub({ status: "processing", attempts: 1 }), { type: "published", externalId: "m1", permalink: "https://instagram.com/reel/abc" });
    expect(next).toMatchObject({ status: "published", externalId: "m1", permalink: "https://instagram.com/reel/abc" });
  });

  it("pending or processing → failed with the error", () => {
    expect(applyEvent(pub(), { type: "failed", error: "token expired" })).toMatchObject({ status: "failed", error: "token expired" });
    expect(applyEvent(pub({ status: "processing" }), { type: "failed", error: "ERROR" }).status).toBe("failed");
  });

  it("failed → pending on retry, clearing the old container, up to the attempt limit", () => {
    const failed = pub({ status: "failed", attempts: 1, externalRef: "c1", error: "boom" });
    expect(applyEvent(failed, { type: "retry" })).toMatchObject({ status: "pending", externalRef: null, error: null });
    expect(codeOf(() => applyEvent(pub({ status: "failed", attempts: MAX_ATTEMPTS }), { type: "retry" }))).toBe("retry_limit");
  });

  it("never leaves published (the never-post-twice guard)", () => {
    const done = pub({ status: "published" });
    for (const ev of [{ type: "started", externalRef: "c2" }, { type: "retry" }, { type: "failed", error: "x" }, { type: "published" }] as const) {
      expect(codeOf(() => applyEvent(done, ev)), ev.type).toBe("terminal");
    }
  });

  it("rejects transitions that skip a step", () => {
    expect(codeOf(() => applyEvent(pub(), { type: "published" }))).toBe("invalid_transition");
    expect(codeOf(() => applyEvent(pub({ status: "processing" }), { type: "started", externalRef: "c" }))).toBe("invalid_transition");
    expect(codeOf(() => applyEvent(pub(), { type: "retry" }))).toBe("invalid_transition");
  });

  it("does not mutate its input", () => {
    const p = pub();
    applyEvent(p, { type: "started", externalRef: "c" });
    expect(p.status).toBe("pending");
  });
});

describe("derivePostStatus", () => {
  it("is approved while anything is pending or processing", () => {
    expect(derivePostStatus([pub({ status: "published" }), pub({ status: "processing" })])).toBe("approved");
  });
  it("is published when every platform published", () => {
    expect(derivePostStatus([pub({ status: "published" }), pub({ status: "published" })])).toBe("published");
  });
  it("is partially_published when some published and the rest failed", () => {
    expect(derivePostStatus([pub({ status: "published" }), pub({ status: "failed" })])).toBe("partially_published");
  });
  it("is failed when every platform failed", () => {
    expect(derivePostStatus([pub({ status: "failed" })])).toBe("failed");
  });
});

describe("isDue", () => {
  it("a pending publication with no schedule is due now", () => {
    expect(isDue(pub(), NOW)).toBe(true);
  });
  it("a scheduled one is due at or after its time", () => {
    expect(isDue(pub({ scheduledAt: new Date(NOW.getTime() + 1000) }), NOW)).toBe(false);
    expect(isDue(pub({ scheduledAt: NOW }), NOW)).toBe(true);
  });
  it("processing publications stay due (they need polling); finished ones don't", () => {
    expect(isDue(pub({ status: "processing" }), NOW)).toBe(true);
    expect(isDue(pub({ status: "published" }), NOW)).toBe(false);
    expect(isDue(pub({ status: "failed" }), NOW)).toBe(false);
  });
});
