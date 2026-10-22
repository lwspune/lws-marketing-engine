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

// ---------- scene stories (framework S19, founder 2026-10-22) ----------

// A real everyday scene told over 8–10 illustrated slides: speech and thought bubbles, cliffhanger lines that pull the
// reader to the next slide, the turn, one lesson, the share slide. The pictures are drawn in remotion/ (SceneStory.tsx).
function scenePost(over = {}) {
  const page = (scene, text, extra = {}) => ({ type: "page", scene, text, ...extra });
  return {
    slug: "sm-008-last-to-eat",
    format: "scene",
    title: "The last one to eat",
    slides: [
      { type: "cover", scene: "stove", text: "Every Diwali, she was the last one to eat." },
      page("morning", "6 a.m. Rangoli, chai for twelve."),
      page("calls", "By noon the house was full.", { bubbles: [{ who: "off", kind: "say", text: "Beta, one more chai!" }] }),
      page("stool", "Her feet hurt.", { cliff: "She stood straight back up." }),
      page("thought", "She'd told herself that for nine Diwalis.", { bubbles: [{ who: "her", kind: "think", text: "Don't sit." }] }),
      page("dinner", "Dinner.", { cliff: "Then her daughter walked in." }),
      page("ladle", "Her mother-in-law took the ladle.", { bubbles: [{ who: "mil", kind: "say", text: "Tonight I'll make the puris." }] }),
      { type: "lesson", scene: "table", text: "You're allowed a seat at the table." },
      { type: "share", text: "Send this to the woman who always eats last." },
    ],
    caption: "You don't have to eat last.",
    hashtags: ["#soundmind"],
    ...over,
  };
}

test("a valid scene story has no problems, and builds a GoPost carousel like the other formats", () => {
  assert.deepEqual(cards.validatePost(scenePost(), ART), []);
  const m = cards.buildManifest(scenePost());
  assert.equal(m.kind, "carousel");
  assert.equal(m.slides.length, 9);
});

test("a scene story needs 8–10 slides", () => {
  const short = scenePost();
  short.slides = [short.slides[0], ...short.slides.slice(3, 5), ...short.slides.slice(5)];
  assert.ok(cards.validatePost(short, ART).some((p) => /8–10 slides/.test(p)));
  const long = scenePost();
  long.slides = [long.slides[0], ...Array(8).fill(long.slides[1]), ...long.slides.slice(3)];
  assert.ok(cards.validatePost(long, ART).some((p) => /8–10 slides/.test(p)));
});

test("cover, pages and the lesson each need a scene; the share slide may have one", () => {
  const s = scenePost();
  delete s.slides[2].scene;
  assert.ok(cards.validatePost(s, ART).some((p) => /slide 3: .*scene/.test(p)));
  const lesson = scenePost();
  delete lesson.slides[7].scene;
  assert.ok(cards.validatePost(lesson, ART).some((p) => /slide 8: .*scene/.test(p)));
  const share = scenePost();
  share.slides[8] = { ...share.slides[8], scene: "diya" };
  assert.deepEqual(cards.validatePost(share, ART), []);
});

test("at least two pages end on a cliffhanger, but not the turn just before the lesson, the cover or the lesson", () => {
  const one = scenePost();
  delete one.slides[3].cliff;
  assert.ok(cards.validatePost(one, ART).some((p) => /cliffhanger/.test(p)));
  const turn = scenePost();
  turn.slides[6] = { ...turn.slides[6], cliff: "And then…" };
  assert.ok(cards.validatePost(turn, ART).some((p) => /slide 7: .*cliffhanger/.test(p)));
  const cover = scenePost();
  cover.slides[0] = { ...cover.slides[0], cliff: "Swipe" };
  assert.ok(cards.validatePost(cover, ART).some((p) => /slide 1: .*cliffhanger/.test(p)));
});

test("bubbles: at most three a slide, each said or thought by someone, short, and with no health claims", () => {
  const many = scenePost();
  many.slides[2] = { ...many.slides[2], bubbles: Array(4).fill({ who: "off", kind: "say", text: "Chai!" }) };
  assert.ok(cards.validatePost(many, ART).some((p) => /bubbles/.test(p)));
  const kind = scenePost();
  kind.slides[2] = { ...kind.slides[2], bubbles: [{ who: "off", kind: "shout", text: "Chai!" }] };
  assert.ok(cards.validatePost(kind, ART).some((p) => /say or think/.test(p)));
  const who = scenePost();
  who.slides[2] = { ...who.slides[2], bubbles: [{ kind: "say", text: "Chai!" }] };
  assert.ok(cards.validatePost(who, ART).some((p) => /who/.test(p)));
  const long = scenePost();
  long.slides[2] = { ...long.slides[2], bubbles: [{ who: "off", kind: "say", text: "x".repeat(81) }] };
  assert.ok(cards.validatePost(long, ART).some((p) => /too long/.test(p)));
  const claim = scenePost();
  claim.slides[2] = { ...claim.slides[2], bubbles: [{ who: "off", kind: "say", text: "Rest will cure you." }] };
  assert.ok(cards.validatePost(claim, ART).some((p) => /health claim/.test(p)));
});

test("scene text limits: cover 90, page 190, cliffhanger 60 characters", () => {
  const cover = scenePost();
  cover.slides[0] = { ...cover.slides[0], text: "x".repeat(91) };
  assert.ok(cards.validatePost(cover, ART).some((p) => /slide 1: text too long/.test(p)));
  const page = scenePost();
  page.slides[1] = { ...page.slides[1], text: "x".repeat(191) };
  assert.ok(cards.validatePost(page, ART).some((p) => /slide 2: text too long/.test(p)));
  const cliff = scenePost();
  cliff.slides[3] = { ...cliff.slides[3], cliff: "x".repeat(61) };
  assert.ok(cards.validatePost(cliff, ART).some((p) => /slide 4 cliffhanger: text too long/.test(p)));
});
