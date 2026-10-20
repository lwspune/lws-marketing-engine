"use strict";
// Reel element analysis (reels/analysis-framework.md): pure rules for the sample, the cover / caption / timing
// elements, and the "works / doesn't / unclear" decision. No I/O here; tests in tests/elements.test.js.

/** The competitor export (analytics/competitors/<handle>-<date>.csv) as objects. */
function parseCsv(text) {
  const s = text.replace(/^﻿/, ""), rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows, at = (k) => head.indexOf(k);
  return body.filter((r) => r.length >= head.length).map((r) => ({
    posted: r[at("posted_ist")], type: r[at("type")], views: Number(r[at("views")]), x: Number(r[at("x_their_median")]),
    likes: Number(r[at("likes")]), comments: Number(r[at("comments")]), permalink: r[at("permalink")], caption: r[at("caption")],
  }));
}

/** Top = the n reels with the highest ×median (at least 3×); typical = the n closest to 1×. Last `days` days only. */
function pickSample(rows, { now, days = 180, n = 15 }) {
  const cutoff = new Date(Date.parse(now) - days * 86_400_000).toISOString().slice(0, 10);
  const reels = rows.filter((r) => r.type === "REELS" && r.posted.slice(0, 10) >= cutoff && r.x > 0);
  const top = reels.filter((r) => r.x >= 3).sort((a, b) => b.x - a.x).slice(0, n);
  const typical = reels.filter((r) => !top.includes(r)).sort((a, b) => Math.abs(Math.log(a.x)) - Math.abs(Math.log(b.x))).slice(0, n);
  return { top, typical };
}

/** pickSample over 180 days, widening to a year, then all time, until the account has at least `minTop` hits. */
function pickSampleWidening(rows, { now, n = 15, minTop = 10 }) {
  let s;
  for (const days of [180, 365, Infinity]) {
    s = { ...pickSample(rows, { now, days: days === Infinity ? 1e6 : days, n }), days };
    if (s.top.length >= minTop) return s;
  }
  return s;
}

/** Caption elements E11–E17. */
function captionFeatures(caption) {
  const text = caption || "", first = (text.split("\n").find((l) => l.trim()) || "").trim();
  return {
    captionLen: text.length,
    firstLineQuestion: first.includes("?"),
    asksComment: /\b(comment|guess|answer|tell me|which one|let me know|drop your)\b/i.test(text),
    asksSaveShareFollow: /\b(save|share|send (this|it)|follow)\b/i.test(text),
    hashtags: (text.match(/#[^\s#\d][^\s#]*/gu) || []).length,
    hasEmoji: /\p{Extended_Pictographic}/u.test(text),
    series: /(#\s?\d+\b|\bpart\s?\d+|\bday\s?\d+|\bep(isode)?\.?\s?\d+)/i.test(text),
  };
}

/** Timing elements E18–E19, from "YYYY-MM-DD HH:MM" in IST. */
function timeFeatures(postedIst) {
  const [y, m, d] = postedIst.slice(0, 10).split("-").map(Number), hour = Number(postedIst.slice(11, 13));
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { morning: hour >= 6 && hour < 12, weekend: day === 0 || day === 6 };
}

/** Cover elements E1–E4 from RGBA pixels: border brightness (0–1), colourfulness (Hasler–Süsstrunk), edge density
 *  (share of pixels where brightness jumps), bright accents (share of strongly saturated, not-dark pixels). */
function coverMetrics(rgba, w, h) {
  const n = w * h, lum = new Float64Array(n);
  let bSum = 0, bN = 0, rgS = 0, rgQ = 0, ybS = 0, ybQ = 0, accent = 0;
  for (let i = 0; i < n; i++) {
    const r = rgba[4 * i], g = rgba[4 * i + 1], b = rgba[4 * i + 2], x = i % w, y = (i / w) | 0;
    lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (x < 0.1 * w || x >= 0.9 * w || y < 0.1 * h || y >= 0.9 * h) { bSum += lum[i]; bN++; }
    const rg = r - g, yb = 0.5 * (r + g) - b;
    rgS += rg; rgQ += rg * rg; ybS += yb; ybQ += yb * yb;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max / 255 > 0.3 && (max - min) / max > 0.5) accent++;
  }
  const mRg = rgS / n, mYb = ybS / n, sd = Math.sqrt(Math.max(0, rgQ / n - mRg * mRg) + Math.max(0, ybQ / n - mYb * mYb));
  let edges = 0, cells = 0;
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
    const i = y * w + x; cells++;
    if (Math.abs(lum[i + 1] - lum[i]) + Math.abs(lum[i + w] - lum[i]) > 0.1) edges++;
  }
  return { borderLum: bSum / bN, colourfulness: sd + 0.3 * Math.hypot(mRg, mYb), edgeDensity: cells ? edges / cells : 0, accentShare: accent / n };
}

/** A number becomes yes/no: above this account's median for it. */
function aboveMedian(values) {
  const s = [...values].sort((a, b) => a - b), mid = s.length / 2;
  const median = s.length % 2 ? s[Math.floor(mid)] : (s[mid - 1] + s[mid]) / 2;
  return values.map((v) => v > median);
}

/** Within one account: does the element show up ≥ 15 points more in top reels, in typical reels, or neither? */
function direction(top, typical) {
  const all = [...top, ...typical];
  if (all.every(Boolean) || !all.some(Boolean)) return "constant";
  const share = (a) => a.filter(Boolean).length / a.length, gap = share(top) - share(typical);
  return gap >= 0.15 - 1e-9 ? "top" : gap <= -0.15 + 1e-9 ? "typical" : "none";
}

/** Across accounts: works = favours top in ≥ 3 accounts and twice as many as typical; doesn't = the mirror. */
function verdict(directions) {
  const counts = { top: 0, typical: 0, none: 0, constant: 0 };
  for (const d of directions) counts[d]++;
  const v = counts.top >= 3 && counts.top >= 2 * counts.typical ? "works"
    : counts.typical >= 3 && counts.typical >= 2 * counts.top ? "doesnt" : "unclear";
  return { verdict: v, counts };
}

/** Every element, every account: share of top vs typical reels with it, its direction, then the verdict.
 *  elements: [{ id, name, get(reel) → boolean | number | null, numeric? }]; numbers become "above the account's median". */
function analyse(reels, elements) {
  const accounts = [...new Set(reels.map((r) => r.account))];
  return elements.map((e) => {
    const per = {};
    for (const a of accounts) {
      const rs = reels.filter((r) => r.account === a && e.get(r) != null);
      if (!rs.length) continue;
      const vals = rs.map((r) => e.get(r)), yes = e.numeric ? aboveMedian(vals) : vals.map(Boolean);
      const pick = (g) => yes.filter((_, i) => rs[i].group === g);
      const top = pick("top"), typ = pick("typical"), share = (a2) => Math.round((a2.filter(Boolean).length / a2.length) * 100) / 100;
      per[a] = { direction: direction(top, typ), top: share(top), typical: share(typ), n: rs.length };
    }
    const { verdict: v, counts } = verdict(Object.values(per).map((p) => p.direction));
    return { id: e.id, name: e.name, verdict: v, counts, accounts: per };
  });
}

module.exports = { analyse, parseCsv, pickSample, pickSampleWidening, captionFeatures, timeFeatures, coverMetrics, aboveMedian, direction, verdict };
