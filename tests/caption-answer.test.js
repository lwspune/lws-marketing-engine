// @pyqvault_ predict-first captions never print the answer (framework F6, lesson L45, founder 2026-10-20): the first two
// predict-first reels asked "Comment your guess" and got 0 comments, with the answer a few lines down ("→ B"). Checks
// every reels/*.post.json of the handle whose caption asks for a guess.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REELS = path.join(__dirname, "..", "reels");

/** The parts of a caption that give the answer away: "→ B", "Answer (a)…", "Answer: C", "the answer is B". */
function giveaways(caption) {
  return [...caption.matchAll(/→\s*\(?[ABC]\)?(?![\w])|\banswer\s*(?:\(|:|is\s+\(?[ABCabc]\b)[^\n]{0,30}/gi)].map((m) => m[0]);
}

// Made before the rule; each is a backfill candidate in SUGGESTIONS.md → Backfill ledger. Remove a name once its caption
// is fixed (the last test makes sure of it), never add one.
const BEFORE_L45 = new Set([
  "pv-physics-004-slope", "pv-chem-004-charles", "pv-physics-005-adiabatic", "pv-chem-005-pvt", "pv-physics-006-topspin",
  "pv-chem-006-flame", "pv-physics-007-heat", "pv-chem-007-halflife", "pv-maths-003-e",
]);

const predictFirst = () => fs.readdirSync(REELS).filter((f) => f.endsWith(".post.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(REELS, f), "utf8")))
  .filter((j) => j.project === "pyqvault-insta" && /comment your guess/i.test(j.captions?.instagram ?? ""));

test("spots an answer in a caption, and lets the 'answer at the end' line through", () => {
  assert.deepEqual(giveaways("so it slips at 35° → B.\n"), ["→ B"]);
  assert.deepEqual(giveaways("Answer (c) π/4."), ["Answer (c) π/4."]);
  assert.equal(giveaways("The answer is A, because").length, 1);
  assert.deepEqual(giveaways("Answer at the end of the reel 👀\nheat → rate, 64 → 32 → 16"), []);
  assert.deepEqual(giveaways("Guess first: the answer is at the end."), []);
});

test("@pyqvault_ predict-first captions keep the answer out (Instagram, Facebook and YouTube)", () => {
  const reels = predictFirst();
  assert.ok(reels.length > 0);
  for (const j of reels) {
    if (BEFORE_L45.has(j.slug)) continue;
    const c = j.captions, all = [c.instagram, c.facebook, c.youtube?.title, c.youtube?.description].filter(Boolean).join("\n");
    assert.deepEqual(giveaways(all), [], `${j.slug} prints the answer`);
  }
});

test("the list of reels made before the rule only shrinks: a fixed caption leaves it", () => {
  const bySlug = new Map(predictFirst().map((j) => [j.slug, j]));
  for (const slug of BEFORE_L45) {
    const j = bySlug.get(slug);
    assert.ok(j, `${slug} is no longer a predict-first manifest: drop it from the list`);
    assert.ok(giveaways(j.captions.instagram).length > 0, `${slug}'s caption is fixed: drop it from the list`);
  }
});
