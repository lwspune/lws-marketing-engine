"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const el = require("../reels/tools/elements.js");

// Reel element analysis (reels/analysis-framework.md): which cover / caption / timing elements show up more in an
// account's top reels than in its typical ones, and the verdict across accounts.

test("reads the competitor CSV export (BOM, quoted fields with commas, quotes and newlines)", () => {
  const csv = '﻿posted_ist,type,views,x_their_median,likes,comments,permalink,caption\r\n' +
    '2026-10-01 09:30,REELS,1000,2.5,10,1,https://i/r/A/,"Hi, ""you""\nsecond line"\r\n';
  const rows = el.parseCsv(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].caption, 'Hi, "you"\nsecond line');
  assert.equal(rows[0].x, 2.5);
  assert.equal(rows[0].type, "REELS");
});

test("sample: reels only, last 180 days, top = highest ×median (≥ 3×), typical = closest to 1×, no overlap", () => {
  const mk = (d, x, type = "REELS") => ({ posted: d, type, x, views: 100 * x, permalink: `p${d}${x}`, caption: "" });
  const rows = [mk("2026-10-01", 9), mk("2026-09-01", 4), mk("2026-08-01", 2.9), mk("2026-07-01", 1.05), mk("2026-06-01", 0.9),
    mk("2026-05-01", 1.5), mk("2025-01-01", 50), mk("2026-10-02", 20, "FEED")];
  const s = el.pickSample(rows, { now: "2026-10-20", days: 180, n: 2 });
  assert.deepEqual(s.top.map((r) => r.x), [9, 4]);                 // the 50× is too old, the 20× isn't a reel, 2.9× < 3×
  assert.deepEqual(s.typical.map((r) => r.x), [1.05, 0.9]);
});

test("caption features", () => {
  const f = el.captionFeatures("Which lands farther? 🤔\nComment your guess 👇 Save this! #physics #class11 #jee\nPhysics, visualised #4");
  assert.equal(f.firstLineQuestion, true);
  assert.equal(f.asksComment, true);
  assert.equal(f.asksSaveShareFollow, true);
  assert.equal(f.hashtags, 3);                                       // "#4" is a series number, not a hashtag
  assert.equal(f.hasEmoji, true);
  assert.equal(f.series, true);
  const g = el.captionFeatures("Boyle's law: pressure times volume stays constant.");
  assert.deepEqual([g.firstLineQuestion, g.asksComment, g.asksSaveShareFollow, g.hashtags, g.hasEmoji, g.series], [false, false, false, 0, false, false]);
  assert.equal(g.captionLen, 50);
});

test("timing: morning is 06:00–11:59 IST; weekend is Saturday or Sunday", () => {
  assert.deepEqual(el.timeFeatures("2026-10-18 09:04"), { morning: true, weekend: true });    // a Sunday
  assert.deepEqual(el.timeFeatures("2026-10-20 21:30"), { morning: false, weekend: false }); // a Tuesday
  assert.equal(el.timeFeatures("2026-10-20 05:59").morning, false);
  assert.equal(el.timeFeatures("2026-10-20 12:00").morning, false);
});

// A w×h RGBA image filled by fn(x, y) → [r, g, b].
const img = (w, h, fn) => {
  const a = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b] = fn(x, y); a.set([r, g, b, 255], (y * w + x) * 4); }
  return a;
};

test("cover metrics: border brightness, colourfulness, busyness, bright accents", () => {
  const black = el.coverMetrics(img(40, 40, () => [10, 10, 10]), 40, 40);
  const white = el.coverMetrics(img(40, 40, () => [245, 245, 245]), 40, 40);
  assert.ok(black.borderLum < 0.1 && white.borderLum > 0.9);
  assert.equal(black.colourfulness, 0);
  assert.equal(black.edgeDensity, 0);
  assert.equal(black.accentShare, 0);
  const stripes = el.coverMetrics(img(40, 40, (x) => (x % 2 ? [255, 0, 0] : [0, 0, 255])), 40, 40);
  assert.ok(stripes.colourfulness > 50, `colourfulness ${stripes.colourfulness}`);
  assert.ok(stripes.edgeDensity > 0.9, `edges ${stripes.edgeDensity}`);
  assert.ok(stripes.accentShare > 0.9);
  // a white card with a dark centre: the border decides dark vs light, not the middle
  const card = el.coverMetrics(img(40, 40, (x, y) => (x > 8 && x < 32 && y > 8 && y < 32 ? [0, 0, 0] : [250, 250, 250])), 40, 40);
  assert.ok(card.borderLum > 0.9);
});

test("per account: numbers become 'above this account's median'; yes/no stays as it is", () => {
  const rows = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }];
  assert.deepEqual(el.aboveMedian(rows.map((r) => r.v)), [false, false, true, true]);
});

test("direction within an account: ≥ 15-point gap favours a side; no variation tells us nothing", () => {
  const yes = (k, n) => Array.from({ length: n }, (_, i) => i < k);
  assert.equal(el.direction(yes(9, 15), yes(5, 15)), "top");          // 60 % vs 33 %
  assert.equal(el.direction(yes(5, 15), yes(9, 15)), "typical");
  assert.equal(el.direction(yes(7, 15), yes(6, 15)), "none");         // 47 % vs 40 %: 6.7 points
  assert.equal(el.direction(yes(15, 15), yes(15, 15)), "constant");
  assert.equal(el.direction(yes(0, 15), yes(0, 15)), "constant");
});

test("verdict across accounts: works = top in ≥ 3 accounts and twice as many as typical; mirror for doesn't", () => {
  assert.equal(el.verdict(["top", "top", "top", "typical", "none", "constant"]).verdict, "works");
  assert.equal(el.verdict(["top", "top", "top", "typical", "typical", "none"]).verdict, "unclear");   // 3 vs 2
  assert.equal(el.verdict(["typical", "typical", "typical", "none", "none", "none"]).verdict, "doesnt");
  assert.equal(el.verdict(["top", "top", "none", "none", "none", "none"]).verdict, "unclear");       // only 2
  assert.deepEqual(el.verdict(["top", "top", "top", "typical", "none", "constant"]).counts, { top: 3, typical: 1, none: 1, constant: 1 });
});

test("sample window widens (180 days → a year → all time) until the account has at least 10 hits", () => {
  const mk = (d, x) => ({ posted: d, type: "REELS", x, views: 100 * x, permalink: `p${d}${x}`, caption: "" });
  const old = Array.from({ length: 12 }, (_, i) => mk(`2024-03-${String(i + 1).padStart(2, "0")}`, 10 + i));
  const recent = Array.from({ length: 20 }, (_, i) => mk(`2026-09-${String(i + 1).padStart(2, "0")}`, 1 + i / 100));
  const s = el.pickSampleWidening([...old, ...recent], { now: "2026-10-20", n: 15 });
  assert.equal(s.days, Infinity);
  assert.equal(s.top.length, 12);
  assert.equal(s.typical.length, 15);
  const enough = el.pickSampleWidening([...recent, ...Array.from({ length: 10 }, (_, i) => mk(`2026-10-${String(i + 1).padStart(2, "0")}`, 5))], { now: "2026-10-20", n: 15 });
  assert.equal(enough.days, 180);
});

test("analyse: shares per account and group, numbers judged against each account's own median, then the verdict", () => {
  const reels = [];
  for (const account of ["a", "b", "c"])
    for (let i = 0; i < 10; i++) {
      reels.push({ account, group: "top", dark: i < 8, len: 100 + i });          // top: mostly dark, long captions
      reels.push({ account, group: "typical", dark: i < 2, len: 10 + i });      // typical: mostly light, short
    }
  const res = el.analyse(reels, [
    { id: "E1", name: "Dark", get: (r) => r.dark },
    { id: "E11", name: "Long caption", get: (r) => r.len, numeric: true },
  ]);
  assert.equal(res[0].verdict, "works");
  assert.deepEqual(res[0].accounts.a, { direction: "top", top: 0.8, typical: 0.2, n: 20 });
  assert.equal(res[1].verdict, "works");
  assert.equal(res[1].accounts.b.top, 1);                                      // every top caption is above b's median
});

// Sound Mind (2026-10-21): carousels and images join the sample (likes ×median), and the wellness elements.

test("reads the slide count when the export has one; older exports have none", () => {
  const csv = '﻿posted_ist,type,views,x_their_median,likes,comments,slides,permalink,caption\n' +
    '2026-10-01 09:30,CAROUSEL,,3.2,640,4,10,https://i/p/A/,"one"\n2026-10-02 09:30,REELS,900,0.8,160,1,,https://i/r/B/,"two"\n';
  const rows = el.parseCsv(csv);
  assert.deepEqual(rows.map((r) => [r.type, r.slides, r.x]), [["CAROUSEL", 10, 3.2], ["REELS", null, 0.8]]);
  assert.equal(el.parseCsv('posted_ist,type,views,x_their_median,likes,comments,permalink,caption\n2026-10-01 09:30,REELS,1,1,1,1,p,"c"\n')[0].slides, null);
});

test("sample: the post types to keep can be widened from reels to every post", () => {
  const mk = (d, x, type) => ({ posted: d, type, x, views: 0, permalink: `p${d}${x}`, caption: "" });
  const rows = [mk("2026-10-01", 9, "CAROUSEL"), mk("2026-09-01", 4, "REELS"), mk("2026-08-01", 5, "IMAGE"), mk("2026-07-01", 1, "CAROUSEL")];
  assert.deepEqual(el.pickSample(rows, { now: "2026-10-20", n: 3 }).top.map((r) => r.x), [4]);
  const all = el.pickSample(rows, { now: "2026-10-20", n: 3, types: ["REELS", "CAROUSEL", "IMAGE"] });
  assert.deepEqual(all.top.map((r) => r.x), [9, 5, 4]);
  assert.equal(el.pickSampleWidening(rows, { now: "2026-10-20", n: 3, minTop: 1, types: ["CAROUSEL"] }).top[0].x, 9);
});

test("wellness caption features: send / tag asks, 'comment KEYWORD', a first line that speaks to 'you'", () => {
  const f = el.captionFeatures('You don\'t have to earn rest.\nSend this to someone who needs it 🤍\nComment "REST" and I\'ll DM you the guide');
  assert.deepEqual([f.asksSend, f.commentKeyword, f.firstLineYou], [true, true, true]);
  assert.equal(el.captionFeatures("Tag a friend who overthinks").asksSend, true);
  assert.equal(el.captionFeatures("Share this with your sister").asksSend, true);
  const g = el.captionFeatures("Calm isn't something we force.\nComment below what helps you.");
  assert.deepEqual([g.asksSend, g.commentKeyword, g.firstLineYou], [false, false, false]);
  assert.equal(el.captionFeatures("comment STEADY for the free kit").commentKeyword, true);
  assert.equal(el.captionFeatures("Comment YES if this is you").commentKeyword, true);
  assert.equal(el.captionFeatures("Comment OK").commentKeyword, false);                   // two letters: too short to be a keyword
});

test("analyse: an 'own' account is shown per account but never counts towards the verdict", () => {
  const reels = [];
  for (const account of ["a", "b", "own"])
    for (let i = 0; i < 10; i++) {
      reels.push({ account, group: "top", yes: i < 8 });
      reels.push({ account, group: "typical", yes: i < 2 });
    }
  const [res] = el.analyse(reels, [{ id: "E1", name: "x", get: (r) => r.yes }], { own: "own" });
  assert.equal(res.accounts.own.direction, "top");
  assert.deepEqual(res.counts, { top: 2, typical: 0, none: 0, constant: 0 });
  assert.equal(res.verdict, "unclear");                                                  // 2 accounts, not 3
});
