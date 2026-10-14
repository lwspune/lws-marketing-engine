import http from "node:http";
import type { AddressInfo } from "node:net";

// A local stand-in for graph.facebook.com + rupload.facebook.com, speaking just enough of the
// Graph API for the publishing flows. Each test scripts its behaviour and inspects `calls`.

export interface FakeCall { method: string; path: string; params: Record<string, string>; headers: http.IncomingHttpHeaders }

export interface FakeMetaOptions {
  /** Status the IG container reports on each poll, in order (last one repeats). */
  containerStatuses?: string[];
  /** FB reel status payloads on each poll, in order (last one repeats). */
  fbStatuses?: object[];
  /** Force an error response for the first call whose path matches. */
  failOn?: { path: RegExp; status: number; message: string; once?: boolean };
}

export async function startFakeMeta(opts: FakeMetaOptions = {}) {
  const calls: FakeCall[] = [];
  let containerPoll = 0, fbPoll = 0, nextId = 100, failUsed = false;
  const id = () => String(nextId++);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://fake");
    const body = await new Promise<string>((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b)); });
    const params: Record<string, string> = Object.fromEntries(url.searchParams);
    if (body && (req.headers["content-type"] ?? "").includes("x-www-form-urlencoded")) Object.assign(params, Object.fromEntries(new URLSearchParams(body)));
    calls.push({ method: req.method ?? "GET", path: url.pathname, params, headers: req.headers });

    const send = (status: number, payload: object) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(payload)); };
    const f = opts.failOn;
    if (f && f.path.test(url.pathname) && !(f.once && failUsed)) {
      failUsed = true;
      return send(f.status, { error: { message: f.message, type: "OAuthException", code: 190, fbtrace_id: "trace" } });
    }

    const p = url.pathname;
    // --- Instagram
    if (req.method === "POST" && /^\/v[\d.]+\/ig1\/media$/.test(p)) return send(200, { id: `c${id()}` });
    if (req.method === "POST" && /^\/v[\d.]+\/ig1\/media_publish$/.test(p)) return send(200, { id: `m${id()}` });
    if (req.method === "GET" && /^\/v[\d.]+\/c\d+$/.test(p)) {
      const list = opts.containerStatuses ?? ["FINISHED"];
      const s = list[Math.min(containerPoll++, list.length - 1)];
      return send(200, { status_code: s, status: s === "ERROR" ? "Error: video too short" : s, id: p.split("/").pop() });
    }
    if (req.method === "GET" && /^\/v[\d.]+\/m\d+$/.test(p)) return send(200, { permalink: "https://www.instagram.com/reel/FAKE/", id: p.split("/").pop() });
    // --- Facebook Page reels
    if (req.method === "POST" && /^\/v[\d.]+\/page1\/video_reels$/.test(p)) {
      if (params.upload_phase === "start") return send(200, { video_id: `v${id()}`, upload_url: "unused" });
      if (params.upload_phase === "finish") return send(200, { success: true });
    }
    if (req.method === "POST" && /^\/video-upload\/v[\d.]+\/v\d+$/.test(p)) return send(200, { success: true });
    if (req.method === "GET" && /^\/v[\d.]+\/v\d+$/.test(p)) {
      if ((params.fields ?? "").includes("permalink_url")) return send(200, { permalink_url: "/reel/987654321/", id: p.split("/").pop() });
      const list = opts.fbStatuses ?? [{ video_status: "ready", publishing_phase: { status: "complete" } }];
      return send(200, { status: list[Math.min(fbPoll++, list.length - 1)], id: p.split("/").pop() });
    }
    send(404, { error: { message: `fake: no route for ${req.method} ${p}`, code: 803 } });
  });

  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    calls,
    config: { graphBase: base, ruploadBase: base, version: "v24.0" },
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}
