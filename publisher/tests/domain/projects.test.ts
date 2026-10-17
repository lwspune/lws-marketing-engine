import { describe, expect, it } from "vitest";
import { queueProjects } from "@/lib/domain/projects";

// The Queue's project buttons. "LWS Pune ads" only holds ads (Ads tab), never posts, so it has no button;
// a project you picked by link keeps its button even while it has nothing in it.
const lws = { id: "p1", name: "LWS Pune" };
const ads = { id: "p2", name: "LWS Pune ads" };
const pv = { id: "p3", name: "PYQ Vault" };

describe("queueProjects", () => {
  it("lists only projects that have at least one post, in the order given", () => {
    expect(queueProjects([lws, ads, pv], ["p3", "p1", "p1"], null)).toEqual([lws, pv]);
  });

  it("keeps the selected project even when it has no posts", () => {
    expect(queueProjects([lws, ads, pv], ["p1"], "p2")).toEqual([lws, ads]);
  });

  it("is empty when nothing has been queued yet", () => {
    expect(queueProjects([lws, ads, pv], [], null)).toEqual([]);
  });
});
