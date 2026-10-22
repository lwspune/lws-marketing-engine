/* Sound Mind cards — pure rules for @soundmindwithshivani carousels.
 * No DOM, no fetch. Loaded by soundmind/card.html (browser, as window.SoundMindCards),
 * soundmind/render.mjs and tests/soundmind-cards.test.js (node).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SoundMindCards = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const PROJECT = "soundmind-shivani";
  const SIZE = [1080, 1350];

  // Cream paper, green-grey ink, one sage accent (decoration only), soft sage highlight behind ink.
  const PALETTE = {
    paper: "#F6F1E7",
    ink: "#2F3A33",
    soft: "#5E6B62",
    sage: "#8FAE8B",
    mark: "#DCE8D3",
  };

  const FORMATS = {
    quotes: { types: ["cover", "quote", "share"], min: 4, max: 8 },
    story: { types: ["cover", "page", "lesson", "share"], min: 6, max: 10 },
    // A real everyday scene (framework S19): illustrated slides drawn in remotion/ (SceneStory.tsx), with speech and
    // thought bubbles and cliffhanger lines that pull the reader on to the next slide.
    scene: { types: ["cover", "page", "lesson", "share"], min: 8, max: 10 },
  };

  // Longest text (stars not counted) each slide type may carry; beyond it the card gets crowded.
  const MAX_CHARS = {
    cover: 70, title: 50, subtitle: 60, quote: 170, page: 160, lesson: 200, share: 90,
    sceneCover: 90, scenePage: 190, bubble: 80, cliff: 60,
  };
  const MAX_BUBBLES = 3;

  // Font size in px: `max` up to `ref` characters, then shrinking with the square root of length.
  const TYPE_SIZE = {
    cover: { max: 104, min: 66, ref: 30 },
    quote: { max: 96, min: 58, ref: 36 },
    page: { max: 64, min: 50, ref: 60 },
    lesson: { max: 80, min: 56, ref: 50 },
    share: { max: 76, min: 56, ref: 40 },
  };

  // Health claims a wellness page must not make. Kept short and literal on purpose.
  const UNSAFE = [
    /\bcure[sd]?\b/i,
    /\bdiagnos/i,
    /\bguarantee/i,
    /\bmedication\b/i,
    /\bmedicine\b/i,
    /\bprescri/i,
    /\byou have (depression|bipolar|adhd|ptsd|ocd|bpd|an? (anxiety|personality) disorder)\b/i,
  ];

  const SLUG = /^sm-\d{3}-[a-z0-9-]+$/;
  const HASHTAG = /^#[A-Za-z0-9_]+$/;
  const CAPTION_MAX = 2200;

  const plain = (text) => String(text).replace(/\*/g, "");

  function unsafeClaims(text) {
    return UNSAFE.map((re) => String(text).match(re)).filter(Boolean).map((m) => m[0]);
  }

  function parseEmphasis(text) {
    return String(text).split("*").map((t, i) => ({ text: t, mark: i % 2 === 1 })).filter((s) => s.text !== "");
  }

  function fontSize(text, type) {
    const t = TYPE_SIZE[type] || TYPE_SIZE.quote;
    const n = Math.max(1, plain(text).length);
    const size = n <= t.ref ? t.max : t.max * Math.sqrt(t.ref / n);
    return Math.round(Math.max(t.min, size));
  }

  const slideFile = (slug, i) => `${slug}-${String(i + 1).padStart(2, "0")}.jpg`;

  const captionText = (post) => `${post.caption.trim()}\n\n${post.hashtags.join(" ")}`;

  function checkText(problems, where, text, limit) {
    if (typeof text !== "string" || !text.trim()) return problems.push(`${where}: text is empty`);
    if (plain(text).length > MAX_CHARS[limit]) problems.push(`${where}: text too long (${plain(text).length} > ${MAX_CHARS[limit]})`);
    if ((text.match(/\*/g) || []).length % 2) problems.push(`${where}: unpaired * highlight`);
    for (const c of unsafeClaims(text)) problems.push(`${where}: health claim "${c}"`);
  }

  function validatePost(post, artNames) {
    const problems = [];
    if (!post || typeof post !== "object") return ["post is missing"];
    if (typeof post.slug !== "string" || !SLUG.test(post.slug) || post.slug.length > 80) {
      problems.push("slug must look like sm-001-few-words (at most 80 characters)");
    }
    const fmt = FORMATS[post.format];
    if (!fmt) problems.push(`format must be quotes, story or scene, not "${post.format}"`);
    if (typeof post.title !== "string" || !post.title.trim() || post.title.length > 120) problems.push("title must be 1–120 characters");

    const slides = Array.isArray(post.slides) ? post.slides : [];
    if (fmt) {
      if (slides.length < fmt.min || slides.length > fmt.max) {
        problems.push(`a ${post.format} post needs ${fmt.min}–${fmt.max} slides, not ${slides.length}`);
      }
      if (slides[0]?.type !== "cover") problems.push("the first slide must be the cover");
      if (slides[slides.length - 1]?.type !== "share") problems.push("the last slide must be the share slide");
      if (post.format === "story" || post.format === "scene") {
        const lessons = slides.filter((s) => s.type === "lesson").length;
        if (lessons !== 1 || slides[slides.length - 2]?.type !== "lesson") problems.push("a story needs one lesson slide, just before the share slide");
      }
      if (post.format === "scene") checkScene(problems, slides);
      slides.forEach((s, i) => {
        const where = `slide ${i + 1}`;
        if (!fmt.types.includes(s.type)) return problems.push(`${where}: type "${s.type}" doesn't belong in a ${post.format} post`);
        if (post.format === "scene") return;
        const needsArt = post.format === "story" && (s.type === "cover" || s.type === "page");
        if (needsArt && !artNames.includes(s.art)) problems.push(`${where}: art "${s.art}" isn't in the catalogue`);
        if (!needsArt && s.art !== undefined) problems.push(`${where}: this slide carries no art`);
        if (post.format === "story" && s.type === "cover") {
          checkText(problems, `${where} title`, s.title, "title");
          checkText(problems, `${where} subtitle`, s.subtitle, "subtitle");
        } else {
          checkText(problems, where, s.text, s.type);
        }
      });
    }

    if (typeof post.caption !== "string" || !post.caption.trim()) problems.push("caption is empty");
    const tags = Array.isArray(post.hashtags) ? post.hashtags : [];
    if (tags.length < 1 || tags.length > 5) problems.push("use 1–5 hashtags");
    if (tags.some((h) => !HASHTAG.test(h))) problems.push("each hashtag must look like #word");
    if (typeof post.caption === "string" && post.caption.trim() && tags.length) {
      if (captionText(post).length > CAPTION_MAX) problems.push("caption with hashtags is over Instagram's 2,200 characters");
      for (const c of unsafeClaims(post.caption)) problems.push(`caption: health claim "${c}"`);
    }
    return problems;
  }

  // Scene stories: every slide but the share needs its scene; bubbles and cliffhangers are checked like slide text.
  function checkScene(problems, slides) {
    const lesson = slides.findIndex((s) => s.type === "lesson");
    slides.forEach((s, i) => {
      const where = `slide ${i + 1}`;
      if (s.type !== "share" && (typeof s.scene !== "string" || !s.scene.trim())) problems.push(`${where}: needs a scene`);
      if (s.art !== undefined) problems.push(`${where}: a scene story draws scenes, not art`);
      const limit = { cover: "sceneCover", page: "scenePage", lesson: "lesson", share: "share" }[s.type];
      if (limit) checkText(problems, where, s.text, limit);
      if (s.cliff !== undefined) {
        if (s.type !== "page") problems.push(`${where}: only a page can end on a cliffhanger`);
        else if (i === lesson - 1) problems.push(`${where}: the turn just before the lesson can't be a cliffhanger`);
        checkText(problems, `${where} cliffhanger`, s.cliff, "cliff");
      }
      const bubbles = s.bubbles === undefined ? [] : s.bubbles;
      if (!Array.isArray(bubbles) || bubbles.length > MAX_BUBBLES) return problems.push(`${where}: at most ${MAX_BUBBLES} bubbles`);
      bubbles.forEach((b, k) => {
        const at = `${where} bubble ${k + 1}`;
        if (b?.kind !== "say" && b?.kind !== "think") problems.push(`${at}: kind must be say or think`);
        if (typeof b?.who !== "string" || !b.who.trim()) problems.push(`${at}: needs who says it`);
        checkText(problems, at, b?.text, "bubble");
      });
    });
    if (slides.filter((s) => s.type === "page" && s.cliff !== undefined).length < 2) problems.push("a scene story needs at least two cliffhanger pages");
  }

  function validateBatch(batch, artNames) {
    const posts = Array.isArray(batch?.posts) ? batch.posts : null;
    if (!posts || !posts.length) return ["batch has no posts"];
    const problems = [];
    const seen = new Set();
    for (const p of posts) {
      const name = p?.slug || "(no slug)";
      if (seen.has(name)) problems.push(`${name}: slug used twice`);
      seen.add(name);
      for (const q of validatePost(p, artNames)) problems.push(`${name}: ${q}`);
    }
    return problems;
  }

  function buildManifest(post) {
    const caption = captionText(post);
    return {
      slug: post.slug,
      project: PROJECT,
      kind: "carousel",
      title: post.title,
      slides: post.slides.map((_, i) => slideFile(post.slug, i)),
      captions: { instagram: caption, facebook: caption },
    };
  }

  return {
    PROJECT, SIZE, PALETTE, FORMATS, MAX_CHARS, MAX_BUBBLES,
    unsafeClaims, parseEmphasis, fontSize, slideFile, captionText,
    validatePost, validateBatch, buildManifest,
  };
});
