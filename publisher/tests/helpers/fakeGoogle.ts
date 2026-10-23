import http from "node:http";
import type { AddressInfo } from "node:net";

// A local stand-in for oauth2.googleapis.com + www.googleapis.com, speaking just enough of the
// YouTube Data API for uploading a Short: token refresh, resumable upload, status polling,
// statistics. It also serves the video file the worker downloads (`/files/v.mp4`).

export interface FakeGoogleCall { method: string; path: string; query: Record<string, string>; headers: http.IncomingHttpHeaders; body: Buffer; json?: unknown }

export interface FakeGoogleOptions {
  /** Size of the served video file in bytes (default 1000). */
  fileSize?: number;
  /** The only refresh token the fake accepts (default "REFRESH-OK"). */
  refreshToken?: string;
  /** What a status query (an empty PUT with `Content-Range: bytes *` + `/N`) on an existing session finds. */
  session?: { kind: "complete"; videoId: string } | { kind: "partial"; received: number } | { kind: "gone" };
  /** The PUT receives only this many bytes, then the connection is cut (a run cut off mid-upload). */
  cutPutAfter?: number;
  /** status.uploadStatus on each poll, in order (last one repeats); plus failure/rejection reasons. */
  uploadStatuses?: string[];
  failureReason?: string;
  rejectionReason?: string;
  privacyStatus?: string;
  /** No items for GET /videos (the video was deleted). */
  videoMissing?: boolean;
  /** Payload for GET /videos?part=statistics. */
  statistics?: Record<string, string>;
  /** Force a Google-style error for calls matching method + path. */
  failOn?: { method?: string; path: RegExp; status: number; reason?: string; message: string; once?: boolean };
}

export async function startFakeGoogle(opts: FakeGoogleOptions = {}) {
  const calls: FakeGoogleCall[] = [];
  const fileSize = opts.fileSize ?? 1000;
  const file = Buffer.alloc(fileSize, 7);
  let poll = 0, nextId = 1, failUsed = false;
  /** Bytes the fake has received per upload session. */
  const received = new Map<string, number>();
  let base = "";

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://fake");
    const chunks: Buffer[] = [];
    let cut = false;
    await new Promise<void>((r) => {
      req.on("data", (c: Buffer) => {
        chunks.push(c);
        if (opts.cutPutAfter !== undefined && req.method === "PUT" && Buffer.concat(chunks).length >= opts.cutPutAfter && !cut) {
          cut = true;
          req.socket.destroy();
          r();
        }
      });
      req.on("end", () => r());
      req.on("close", () => r());
    });
    const body = Buffer.concat(chunks);
    const query = Object.fromEntries(url.searchParams);
    const type = req.headers["content-type"] ?? "";
    const json = type.includes("application/json") && body.length ? JSON.parse(body.toString()) : undefined;
    calls.push({ method: req.method ?? "GET", path: url.pathname, query, headers: req.headers, body, json });
    if (cut) return;

    const send = (status: number, payload?: object, headers: Record<string, string> = {}) => {
      res.writeHead(status, { "content-type": "application/json", ...headers });
      res.end(payload ? JSON.stringify(payload) : "");
    };
    const f = opts.failOn;
    if (f && f.path.test(url.pathname) && (!f.method || f.method === req.method) && !(f.once && failUsed)) {
      failUsed = true;
      return send(f.status, { error: { code: f.status, message: f.message, errors: [{ reason: f.reason ?? "badRequest", message: f.message }] } });
    }
    const p = url.pathname;
    const authed = req.headers.authorization === "Bearer ya29.fake-access";

    if (req.method === "GET" && p === "/files/v.mp4") {
      res.writeHead(200, { "content-type": "video/mp4", "content-length": String(fileSize) });
      return res.end(file);
    }
    if (req.method === "POST" && p === "/token") {
      const form = new URLSearchParams(body.toString());
      if (form.get("grant_type") === "refresh_token" && form.get("refresh_token") === (opts.refreshToken ?? "REFRESH-OK")
        && form.get("client_id") === "client-1" && form.get("client_secret") === "secret-1") {
        return send(200, { access_token: "ya29.fake-access", expires_in: 3599, token_type: "Bearer" });
      }
      return send(400, { error: "invalid_grant", error_description: "Token has been expired or revoked." });
    }
    if (!authed && p.startsWith("/upload") === false && p.startsWith("/youtube")) {
      return send(401, { error: { code: 401, message: "Invalid Credentials", errors: [{ reason: "authError" }] } });
    }
    if (req.method === "POST" && p === "/upload/youtube/v3/videos" && query.uploadType === "resumable") {
      if (!authed) return send(401, { error: { code: 401, message: "Invalid Credentials", errors: [{ reason: "authError" }] } });
      const id = `U${nextId++}`;
      received.set(id, 0);
      return send(200, undefined, { location: `${base}/upload/youtube/v3/videos?uploadType=resumable&upload_id=${id}` });
    }
    if (req.method === "PUT" && p === "/upload/youtube/v3/videos" && query.upload_id) {
      const range = String(req.headers["content-range"] ?? "");
      if (/^bytes \*\/\d+$/.test(range)) {
        const s = opts.session ?? { kind: "gone" };
        if (s.kind === "complete") return send(200, { id: s.videoId, status: { uploadStatus: "uploaded" } });
        if (s.kind === "partial") {
          received.set(query.upload_id, s.received);
          return send(308, undefined, s.received ? { range: `bytes=0-${s.received - 1}` } : {});
        }
        return send(404, { error: { code: 404, message: "Upload session not found." } });
      }
      const m = range.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
      const start = m ? Number(m[1]) : 0;
      const total = m ? Number(m[3]) : body.length;
      if (start + body.length < total) return send(308, undefined, { range: `bytes=0-${start + body.length - 1}` });
      return send(200, { id: `vid${nextId++}`, status: { uploadStatus: "uploaded" } });
    }
    if (req.method === "GET" && p === "/youtube/v3/videos") {
      if (opts.videoMissing) return send(200, { items: [] });
      if ((query.part ?? "").includes("statistics")) {
        return send(200, { items: [{ id: query.id, statistics: opts.statistics ?? { viewCount: "1200", likeCount: "45", commentCount: "3", favoriteCount: "0" } }] });
      }
      const list = opts.uploadStatuses ?? ["processed"];
      const uploadStatus = list[Math.min(poll++, list.length - 1)];
      return send(200, { items: [{ id: query.id, status: {
        uploadStatus, privacyStatus: opts.privacyStatus ?? "public",
        ...(opts.failureReason ? { failureReason: opts.failureReason } : {}),
        ...(opts.rejectionReason ? { rejectionReason: opts.rejectionReason } : {}),
      } }] });
    }
    if (req.method === "GET" && p === "/youtube/v3/channels" && query.mine === "true") {
      return send(200, { items: [{ id: "UC-lws", snippet: { title: "LWS Pune", customUrl: "@lwspune" } }] });
    }
    send(404, { error: { code: 404, message: `fake: no route for ${req.method} ${p}` } });
  });

  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return {
    calls,
    base,
    fileUrl: `${base}/files/v.mp4`,
    config: { oauthBase: base, apiBase: base, clientId: "client-1", clientSecret: "secret-1" },
    close: () => new Promise<void>((r) => { server.closeAllConnections(); server.close(() => r()); }),
  };
}
