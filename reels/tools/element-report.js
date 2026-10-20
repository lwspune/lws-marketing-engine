"use strict";
// Reel element analysis, last step: join sample.json + covers.json (pixels) + eye.json (blind codes), run every
// element through analyse(), write results.json and report.md. Called by `element-analysis.js report <out-dir>`.
const fs = require("node:fs");
const path = require("node:path");
const el = require("./elements.js");

const ELEMENTS = [
  { id: "E1", name: "Dark background", get: (r) => (r.cover ? r.cover.borderLum < 0.35 : null) },
  { id: "E2", name: "Colourful cover", numeric: true, get: (r) => r.cover?.colourfulness ?? null },
  { id: "E3", name: "Busy cover (edges)", numeric: true, get: (r) => r.cover?.edgeDensity ?? null },
  { id: "E4", name: "Bright accents", numeric: true, get: (r) => r.cover?.accentShare ?? null },
  { id: "E5", name: "Any text on cover", get: (r) => (r.eye ? r.eye.text !== "N" : null) },
  { id: "E5b", name: "Long text on cover (> 6 words)", get: (r) => (r.eye ? r.eye.text === "L" : null) },
  { id: "E6", name: "Question or problem on cover", get: (r) => r.eye?.question ?? null },
  { id: "E7", name: "Face or person", get: (r) => r.eye?.face ?? null },
  { id: "E8", name: "3D look", get: (r) => r.eye?.threeD ?? null },
  { id: "E9", name: "Many objects (≥ 5)", get: (r) => r.eye?.many ?? null },
  { id: "E10", name: "Real photo / footage", get: (r) => r.eye?.photo ?? null },
  { id: "E11", name: "Long caption", numeric: true, get: (r) => r.cap.captionLen },
  { id: "E12", name: "Caption opens with a question", get: (r) => r.cap.firstLineQuestion },
  { id: "E13", name: "Caption asks for a comment", get: (r) => r.cap.asksComment },
  { id: "E14", name: "Caption asks to save / share / follow", get: (r) => r.cap.asksSaveShareFollow },
  { id: "E15", name: "Many hashtags", numeric: true, get: (r) => r.cap.hashtags },
  { id: "E16", name: "Emojis in caption", get: (r) => r.cap.hasEmoji },
  { id: "E17", name: "Numbered series", get: (r) => r.cap.series },
  { id: "E18", name: "Posted in the morning (06–12 IST)", get: (r) => r.time.morning },
  { id: "E19", name: "Posted on a weekend", get: (r) => r.time.weekend },
];

const MARK = { works: "✅ works", doesnt: "❌ doesn't work", unclear: "❔ unclear" };
const DIR = { top: "▲ top", typical: "▼ typical", none: "· same", constant: "– never varies" };
const pct = (v) => `${Math.round(v * 100)}%`;

function report(outDir) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(outDir, f), "utf8"));
  const sample = read("sample.json"), covers = read("covers.json"), eye = read("eye.json").codes;
  const reels = sample.reels.map((r) => ({
    ...r, cover: covers[r.id] ?? null, eye: eye[r.id] ?? null, cap: el.captionFeatures(r.caption), time: el.timeFeatures(r.posted),
  }));
  const results = el.analyse(reels, ELEMENTS);
  fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 1));

  const accounts = sample.accounts;
  const lines = [
    `# Reel element analysis: covers + captions (${sample.made})`, "",
    `${reels.length} reels: 15 top + 15 typical from each of ${accounts.map((a) => "@" + a).join(", ")}. ` +
      "Method and decision rule: `reels/analysis-framework.md`. ▲ = more common in that account's top reels (≥ 15 points), " +
      "▼ = more common in its typical reels, · = no real difference, – = the account never varies on it.", "",
    "| Element | Verdict | ▲ top | ▼ typical | · same | – no variation |", "|---|---|---|---|---|---|",
    ...results.map((x) => `| ${x.id} ${x.name} | ${MARK[x.verdict]} | ${x.counts.top} | ${x.counts.typical} | ${x.counts.none} | ${x.counts.constant} |`),
    "", "## Per account (share of top reels vs typical reels with the element)", "",
    `| Element | ${accounts.map((a) => "@" + a).join(" | ")} |`, `|---|${accounts.map(() => "---").join("|")}|`,
    ...results.map((x) => `| ${x.id} ${x.name} | ${accounts.map((a) => {
      const p = x.accounts[a];
      return p ? `${DIR[p.direction]} ${pct(p.top)} vs ${pct(p.typical)}` : "n/a";
    }).join(" | ")} |`),
  ];
  fs.writeFileSync(path.join(outDir, "report.md"), lines.join("\n") + "\n");
  console.log(results.map((x) => `${x.id.padEnd(4)} ${x.name.padEnd(38)} ${x.verdict.padEnd(8)} ▲${x.counts.top} ▼${x.counts.typical} ·${x.counts.none} –${x.counts.constant}`).join("\n"));
  console.log(`→ ${path.join(outDir, "report.md")}`);
}

module.exports = { report, ELEMENTS };
