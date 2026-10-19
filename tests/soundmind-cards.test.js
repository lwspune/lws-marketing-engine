"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const cards = require("../soundmind/cards.js");

const ART = ["kettle", "flame", "plant"];

function quotesPost(over = {}) {
  return {
    slug: "sm-001-calm",
    format: "quotes",
    title: "Calm can't be forced",
    slides: [
      { type: "cover", text: "Nobody ever calmed down because they were *told to*." },
      { type: "quote", text: "Calm isn't a switch." },
      { type: "quote", text: "Your mind follows your body." },
      { type: "share", text: "Send this to a friend." },
    ],
    caption: "Can you relate? 🌿",
    hashtags: ["#mindfulness", "#soundmind"],
    ...over,
  };
}

function storyPost(over = {}) {
  return {
    slug: "sm-002-kettle",
    format: "story",
    title: "The kettle",
    slides: [
      { type: "cover", title: "The Kettle", subtitle: "a little story", art: "kettle" },
      { type: "page", text: "There was once a kettle.", art: "kettle" },
      { type: "page", text: "Everyone shouted.", art: "kettle" },
      { type: "page", text: "The flame still burned.", art: "flame" },
      { type: "lesson", text: "Turn the *flame* down." },
      { type: "share", text: "Send this to someone." },
    ],
    caption: "A little story.",
    hashtags: ["#soundmind"],
    ...over,
  };
}

// ---------- validation ----------

test("valid quote and story posts have no problems", () => {
  assert.deepEqual(cards.validatePost(quotesPost(), ART), []);
  assert.deepEqual(cards.validatePost(storyPost(), ART), []);
});

test("slug must be sm-NNN-words and fit GoPost's 80 characters", () => {
  assert.ok(cards.validatePost(quotesPost({ slug: "calm" }), ART).some((p) => /slug/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ slug: "sm-001-" + "a".repeat(80) }), ART).some((p) => /slug/.test(p)));
});

test("unknown format is refused", () => {
  assert.ok(cards.validatePost(quotesPost({ format: "reel" }), ART).some((p) => /format/.test(p)));
});

test("a quotes post needs 4–8 slides and a story 6–10", () => {
  const q = quotesPost();
  q.slides = [q.slides[0], q.slides[3]];
  assert.ok(cards.validatePost(q, ART).some((p) => /slides/.test(p)));
  const s = storyPost();
  s.slides = [s.slides[0], s.slides[1], s.slides[4], s.slides[5]];
  assert.ok(cards.validatePost(s, ART).some((p) => /slides/.test(p)));
  const long = storyPost();
  long.slides = [long.slides[0], ...Array(8).fill(long.slides[1]), long.slides[4], long.slides[5]];
  assert.ok(cards.validatePost(long, ART).some((p) => /slides/.test(p)));
});

test("first slide is the cover, last is the share slide, and a story has its lesson just before it", () => {
  const q = quotesPost();
  q.slides = [q.slides[1], q.slides[0], q.slides[2], q.slides[3]];
  assert.ok(cards.validatePost(q, ART).some((p) => /cover/.test(p)));
  const q2 = quotesPost();
  q2.slides = [q2.slides[0], q2.slides[1], q2.slides[3], q2.slides[2]];
  assert.ok(cards.validatePost(q2, ART).some((p) => /share/.test(p)));
  const s = storyPost();
  s.slides = s.slides.filter((x) => x.type !== "lesson").concat();
  s.slides.splice(4, 0, { type: "page", text: "More.", art: "kettle" });
  assert.ok(cards.validatePost(s, ART).some((p) => /lesson/.test(p)));
});

test("slide types must belong to the format", () => {
  const q = quotesPost();
  q.slides[1] = { type: "page", text: "x", art: "kettle" };
  assert.ok(cards.validatePost(q, ART).some((p) => /type/.test(p)));
});

test("text over the slide's limit, or empty, is refused", () => {
  const q = quotesPost();
  q.slides[1] = { type: "quote", text: "word ".repeat(40) };
  assert.ok(cards.validatePost(q, ART).some((p) => /too long/.test(p)));
  const q2 = quotesPost();
  q2.slides[1] = { type: "quote", text: "  " };
  assert.ok(cards.validatePost(q2, ART).some((p) => /empty/.test(p)));
});

test("story art must exist in the catalogue; quote slides carry none", () => {
  const s = storyPost();
  s.slides[1] = { ...s.slides[1], art: "dragon" };
  assert.ok(cards.validatePost(s, ART).some((p) => /art/.test(p)));
  const s2 = storyPost();
  delete s2.slides[2].art;
  assert.ok(cards.validatePost(s2, ART).some((p) => /art/.test(p)));
  const q = quotesPost();
  q.slides[1] = { ...q.slides[1], art: "kettle" };
  assert.ok(cards.validatePost(q, ART).some((p) => /art/.test(p)));
});

test("highlight stars must come in pairs", () => {
  const q = quotesPost();
  q.slides[1] = { type: "quote", text: "Calm is *not a switch." };
  assert.ok(cards.validatePost(q, ART).some((p) => /\*/.test(p)));
});

test("caption needs text, 1–5 well-formed hashtags and fits Instagram's 2,200 characters", () => {
  assert.ok(cards.validatePost(quotesPost({ caption: "" }), ART).some((p) => /caption/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ hashtags: [] }), ART).some((p) => /hashtag/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ hashtags: ["#a", "#b", "#c", "#d", "#e", "#f"] }), ART).some((p) => /hashtag/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ hashtags: ["mindfulness"] }), ART).some((p) => /hashtag/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ caption: "x".repeat(2200) }), ART).some((p) => /2,200/.test(p)));
});

test("medical claims are refused anywhere in the post", () => {
  assert.ok(cards.unsafeClaims("This will cure your anxiety").length > 0);
  assert.ok(cards.unsafeClaims("Stop your medication").length > 0);
  assert.ok(cards.unsafeClaims("You may be diagnosed with").length > 0);
  assert.ok(cards.unsafeClaims("Guaranteed calm in 5 days").length > 0);
  assert.deepEqual(cards.unsafeClaims("Breathe out slower than you breathe in."), []);
  const q = quotesPost();
  q.slides[2] = { type: "quote", text: "This breath will cure stress." };
  assert.ok(cards.validatePost(q, ART).some((p) => /claim/.test(p)));
  assert.ok(cards.validatePost(quotesPost({ caption: "A guaranteed fix" }), ART).some((p) => /claim/.test(p)));
});

test("validateBatch reports each post's problems and duplicate slugs", () => {
  const ok = cards.validateBatch({ posts: [quotesPost(), storyPost()] }, ART);
  assert.deepEqual(ok, []);
  const dup = cards.validateBatch({ posts: [quotesPost(), quotesPost()] }, ART);
  assert.ok(dup.some((p) => /sm-001-calm/.test(p) && /twice/.test(p)));
  const bad = cards.validateBatch({ posts: [quotesPost({ caption: "" })] }, ART);
  assert.ok(bad.every((p) => p.startsWith("sm-001-calm")));
  assert.ok(cards.validateBatch({}, ART).length > 0);
});

// ---------- rendering helpers ----------

test("parseEmphasis splits *marked* phrases into segments", () => {
  assert.deepEqual(cards.parseEmphasis("Turn the *flame* down."), [
    { text: "Turn the ", mark: false },
    { text: "flame", mark: true },
    { text: " down.", mark: false },
  ]);
  assert.deepEqual(cards.parseEmphasis("plain"), [{ text: "plain", mark: false }]);
  assert.deepEqual(cards.parseEmphasis("*all*"), [{ text: "all", mark: true }]);
});

test("fontSize shrinks as text grows and stays readable", () => {
  for (const type of ["cover", "quote", "page", "lesson", "share"]) {
    let last = Infinity;
    for (let n = 5; n <= 220; n += 15) {
      const size = cards.fontSize("x".repeat(n), type);
      assert.ok(size <= last, `${type} grew at ${n}`);
      assert.ok(size >= 40, `${type} too small at ${n}: ${size}`);
      last = size;
    }
  }
  assert.ok(cards.fontSize("*ab*", "quote") === cards.fontSize("ab", "quote"), "stars don't count");
});

test("slide files are numbered JPEGs (Instagram only accepts JPEG)", () => {
  assert.equal(cards.slideFile("sm-001-calm", 0), "sm-001-calm-01.jpg");
  assert.equal(cards.slideFile("sm-001-calm", 9), "sm-001-calm-10.jpg");
});

test("caption text ends with the hashtags on their own line", () => {
  assert.equal(cards.captionText(quotesPost()), "Can you relate? 🌿\n\n#mindfulness #soundmind");
});

test("buildManifest makes a GoPost carousel for the Sound Mind project", () => {
  const m = cards.buildManifest(quotesPost());
  assert.deepEqual(m, {
    slug: "sm-001-calm",
    project: "soundmind-shivani",
    kind: "carousel",
    title: "Calm can't be forced",
    slides: ["sm-001-calm-01.jpg", "sm-001-calm-02.jpg", "sm-001-calm-03.jpg", "sm-001-calm-04.jpg"],
    captions: { instagram: cards.captionText(quotesPost()), facebook: cards.captionText(quotesPost()) },
  });
});

// ---------- palette ----------

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test("text colours pass WCAG AA on the paper and the highlight", () => {
  const P = cards.PALETTE;
  assert.ok(contrast(P.ink, P.paper) >= 4.5);
  assert.ok(contrast(P.ink, P.mark) >= 4.5);
  assert.ok(contrast(P.soft, P.paper) >= 4.5, "small print (handle, page number)");
});
