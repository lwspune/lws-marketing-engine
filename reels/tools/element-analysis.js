"use strict";
// Reel element analysis, step by step (reels/analysis-framework.md):
//
//   node reels/tools/element-analysis.js sample <out-dir>      15 top + 15 typical reels per account → sample.json
//   (publisher) npm run covers:fetch -- --sample=<out-dir>/sample.json --covers=<covers-dir>
//   node reels/tools/cover-metrics.mjs <out-dir> <covers-dir>  cover pixels → covers.json (then delete the covers)
//   eye.json: blind codes for E5–E10, made from shuffled contact sheets (ids only)
//   node reels/tools/element-analysis.js report <out-dir>      verdict per element → report.md
const fs = require("node:fs");
const path = require("node:path");
const el = require("./elements.js");

const ACCOUNTS = ["bisal.physics", "codematrixvishal", "sciencevisualised", "ubilumapp", "mathsy.uk", "maths_mentor24"];
const COMPETITORS = path.join(__dirname, "..", "..", "analytics", "competitors");

function latestExport(handle) {
  const files = fs.readdirSync(COMPETITORS).filter((f) => f.startsWith(handle + "-") && f.endsWith(".csv")).sort();
  if (!files.length) throw new Error(`no export for @${handle} in analytics/competitors/`);
  return path.join(COMPETITORS, files[files.length - 1]);
}

// Neutral ids in a shuffled order (seeded, so a re-run gives the same ids), so eye-coding can't tell hits apart.
function shuffle(list, seed) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

function sample(outDir, now = new Date().toISOString().slice(0, 10)) {
  const reels = [];
  for (const handle of ACCOUNTS) {
    const file = latestExport(handle), { top, typical, days } = el.pickSampleWidening(el.parseCsv(fs.readFileSync(file, "utf8")), { now });
    for (const [group, list] of [["top", top], ["typical", typical]])
      for (const r of list) reels.push({ account: handle, group, posted: r.posted, x: r.x, views: r.views, permalink: r.permalink, caption: r.caption });
    console.log(`@${handle}: ${top.length} top (${top.at(-1)?.x}×+) · ${typical.length} typical · ${days === Infinity ? "all time" : `last ${days} days`} · ${path.basename(file)}`);
  }
  shuffle(reels, 20261020).forEach((r, i) => { r.id = `R${String(i + 1).padStart(3, "0")}`; });
  reels.sort((a, b) => a.id.localeCompare(b.id));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sample.json"), JSON.stringify({ made: now, accounts: ACCOUNTS, reels }, null, 1));
  console.log(`${reels.length} reels → ${path.join(outDir, "sample.json")}`);
}

module.exports = { ACCOUNTS, shuffle };

if (require.main === module) {
  const [cmd, outDir] = process.argv.slice(2);
  if (cmd === "sample" && outDir) sample(outDir);
  else if (cmd === "report" && outDir) require("./element-report.js").report(outDir);
  else { console.error("usage: element-analysis.js sample|report <out-dir>"); process.exit(1); }
}
