/* LWS Marketing Engine — core logic.
 * Pure functions only: no DOM, no fetch. Loaded by marketing-engine.html (browser)
 * and by tests/core.test.js (node). Everything here must stay testable in node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MarketingCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------- constants

  const MODEL = "claude-opus-5";
  const API_URL = "https://api.anthropic.com/v1/messages";
  const API_VERSION = "2023-06-01";
  const FALLBACK_BETA = "server-side-fallback-2026-07-01";
  const STORAGE_KEY = "lws-marketing-engine.v1";

  const DRAFT_KINDS = ["reel", "caption", "telegram", "whatsapp", "youtube"];
  const SEGMENTS = ["12th-appearing aspirant", "dropper / from zero", "arts/commerce background", "parents", "teachers / institutes"];
  const TONES = ["LWS-honest", "punchy-short", "explainer"];
  const QUEUE_ACTIONS = ["approve", "tweak", "kill"];

  const FACELESS_RULE =
    "FORMAT RULE (non-negotiable): the founder is never on camera and never speaks. " +
    "All video is faceless and silent-first: pen-and-paper solving filmed top-down, every step shown as on-screen text, " +
    "background music, no face, no voice. Never write a line that assumes a face, a voice-over, or talking to camera.";

  const NO_SLOP_RULE =
    "NO-SLOP RULE (non-negotiable): every output must name (a) one real problem from the list below, by its id, " +
    "in the buyer's own words, and (b) one real asset from the asset list, or a clearly flagged gap written as 'GAP: ...'. " +
    "Generic study tips, motivation, or advice that could apply to any exam is a failure. Be more specific, never more general. " +
    "Never fabricate student quotes, numbers, or testimonials.";

  // ---------------------------------------------------------------- profiles

  function blankProfile(id, name) {
    return {
      id: String(id || "").trim(),
      name: String(name || "").trim(),
      tagline: "",
      buyer: "",
      problems: [],
      assets: [],
      offer: { name: "", price: "", link: "" },
      voice: "",
      channels: [],
      notes: "",
    };
  }

  function validateProfile(p) {
    const errors = [];
    if (!p || typeof p !== "object") return { ok: false, errors: ["Profile is missing."] };
    if (!p.id || !String(p.id).trim()) errors.push("Profile needs an id.");
    if (!p.name || !String(p.name).trim()) errors.push("Profile needs a name.");
    if (!p.buyer || !String(p.buyer).trim()) errors.push("Describe the buyer: who pays, and what they are trying to get.");
    if (!Array.isArray(p.problems) || p.problems.length === 0) errors.push("Add at least one real problem, in the buyer's own words.");
    else {
      p.problems.forEach((pr, i) => {
        if (!pr || !pr.id || !String(pr.id).trim()) errors.push("Problem " + (i + 1) + " needs an id.");
        if (!pr || !pr.problem || !String(pr.problem).trim()) errors.push("Problem " + (i + 1) + " needs text.");
      });
    }
    if (!Array.isArray(p.assets) || p.assets.filter((a) => a && String(a).trim()).length === 0) errors.push("Add at least one real asset you already have.");
    return { ok: errors.length === 0, errors };
  }

  function isProfileReady(p) {
    return validateProfile(p).ok;
  }

  function seedProfiles() {
    const pyq = blankProfile("pyq-vault", "PYQ Vault");
    pyq.tagline = "Every NDA Maths previous-year question, solved and sorted by what actually gets asked.";
    pyq.buyer =
      "NDA aspirants, mostly 12th-appearing, Hindi and English medium, juggling board exams with NDA prep. " +
      "Parents often pay. They want to know what to study, what to skip, and to stop forgetting what they studied.";
    pyq.problems = [
      { id: "triage", problem: "What do I study and what can I skip? Which chapters carry the marks?", evidence: "chapter-weightage, calculus-skip and cutoff-maths questions dominate comments", asset: "PYQ weightage analysis + question bank", gap: "student-facing weightage map" },
      { id: "retention", problem: "I study but I don't retain. I never revise.", evidence: "very high frequency", asset: "question bank as active-recall engine, NDA Maths Tracker", gap: "reposition the bank as a recall tool" },
      { id: "recall-no-system", problem: "Everyone says active recall but I have no tool or system for it.", evidence: "very high frequency", asset: "PYQ bank + mock infra", gap: "PYQ-native testing tool" },
      { id: "class12-juggle", problem: "School plus NDA. When do I even study?", evidence: "very high frequency", asset: "", gap: "GAP: dual-track study plan" },
      { id: "gat-demand", problem: "Maths got a priority list. We need the same for GAT.", evidence: "loudest single demand", asset: "partial (Maths taught)", gap: "GAP: GAT weightage" },
      { id: "one-source", problem: "Which single book or source covers the whole syllabus?", evidence: "high frequency", asset: "chapter notes + formula sheets", gap: "bundle as the one source" },
      { id: "background", problem: "I am from arts/commerce/bio. I am weak at maths.", evidence: "medium frequency", asset: "", gap: "GAP: background-segmented entry paths" },
      { id: "ai-wrong", problem: "AI answers get it wrong, or do the thinking for me.", evidence: "medium, central to trust", asset: "PYQ-grounded, verified-key, discrepancy-flagged pipeline", gap: "" },
      { id: "from-zero", problem: "Starting from zero, or late, or as a dropper. How?", evidence: "medium frequency", asset: "28-chapter master list as cold-start spine", gap: "a from-zero sequence" },
      { id: "affordability", problem: "Is it free? I only have YouTube.", evidence: "low-medium, strategic", asset: "", gap: "pricing and distribution signal" },
    ];
    pyq.assets = [
      "PYQ question bank (every NDA Maths previous-year question, solved)",
      "PYQ weightage analysis (per-chapter counts across years)",
      "NDA Maths Tracker (nda-tracker.vercel.app)",
      "Chapter notes + formula sheets",
      "Mock test infrastructure",
      "28-chapter master list",
      "YouTube channel with existing solved-PYQ videos",
    ];
    pyq.offer = { name: "PYQ Vault", price: "", link: "" };
    pyq.voice =
      "Short, punchy, honest, direct. Specific details over generalities. Intentional repetition for emphasis. " +
      "Casual sign-offs. Rough edges kept. Sounds like a teacher thinking out loud, not a marketer.";
    pyq.channels = ["youtube", "instagram", "telegram", "whatsapp"];
    pyq.notes = "LWS = defence-exam coaching, FC Road, Pune. Core subject: NDA Mathematics. PYQ = previous-year questions.";

    const ssb = blankProfile("crack-ssb", "Crack SSB");
    ssb.notes = "Fill this in before generating. Who buys it? What do they say they struggle with? What do you already have?";
    ssb.channels = ["youtube", "instagram", "telegram"];

    return [pyq, ssb];
  }

  function exportProfiles(profiles) {
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profiles: profiles }, null, 2);
  }

  function importProfiles(json) {
    const parsed = parseJson(json);
    if (!parsed.ok) return { ok: false, error: parsed.error };
    const list = Array.isArray(parsed.data) ? parsed.data : parsed.data && parsed.data.profiles;
    if (!Array.isArray(list)) return { ok: false, error: "File does not contain a profiles list." };
    const profiles = [];
    for (const raw of list) {
      if (!raw || !raw.id || !raw.name) return { ok: false, error: "Every profile needs an id and a name." };
      profiles.push(Object.assign(blankProfile(raw.id, raw.name), raw));
    }
    return { ok: true, profiles };
  }

  // ---------------------------------------------------------------- prompts

  function selectedProblems(profile, problemIds) {
    if (!problemIds || problemIds.length === 0) return profile.problems;
    const set = new Set(problemIds);
    const chosen = profile.problems.filter((p) => set.has(p.id));
    return chosen.length ? chosen : profile.problems;
  }

  function profileBlock(profile, problems) {
    const lines = [];
    lines.push("PRODUCT: " + profile.name + (profile.tagline ? " — " + profile.tagline : ""));
    lines.push("BUYER: " + profile.buyer);
    if (profile.offer && (profile.offer.name || profile.offer.price)) {
      lines.push("OFFER: " + [profile.offer.name, profile.offer.price ? "price " + profile.offer.price : "", profile.offer.link].filter(Boolean).join(" · "));
    }
    lines.push("");
    lines.push("REAL PROBLEMS (id → what buyers actually say → evidence → asset that answers it → gap):");
    problems.forEach((p) => {
      lines.push("- [" + p.id + "] " + p.problem + (p.evidence ? " | evidence: " + p.evidence : "") + (p.asset ? " | asset: " + p.asset : "") + (p.gap ? " | gap: " + p.gap : ""));
    });
    lines.push("");
    lines.push("ASSETS (things that already exist):");
    profile.assets.filter(Boolean).forEach((a) => lines.push("- " + a));
    lines.push("");
    lines.push("VOICE: " + (profile.voice || "plain, honest, specific"));
    if (profile.notes) lines.push("CONTEXT: " + profile.notes);
    return lines.join("\n");
  }

  function assertReady(profile) {
    const v = validateProfile(profile);
    if (!v.ok) throw new Error("Profile is not ready: " + v.errors.join(" "));
  }

  function buildIdeasPrompt(profile, opts) {
    assertReady(profile);
    opts = opts || {};
    const count = Math.max(1, Math.min(10, parseInt(opts.count, 10) || 5));
    const segment = opts.segment || SEGMENTS[0];
    const tone = opts.tone || TONES[0];
    const problems = selectedProblems(profile, opts.problemIds);

    const system = [
      "You generate grounded content ideas for one specific education product. You are not a generic marketing assistant.",
      NO_SLOP_RULE,
      FACELESS_RULE,
      "",
      profileBlock(profile, problems),
    ].join("\n");

    const user = [
      "Generate exactly " + count + " content ideas for " + profile.name + ".",
      "Audience segment: " + segment + ". Tone: " + tone + ".",
      "Each idea: pick one problem id from the list, write a hook in the product voice, name the asset it leans on (or 'GAP: ...'),",
      "suggest the best format (reel | caption | telegram | whatsapp | youtube), estimate effort (low | medium | high),",
      "and explain in one or two sentences why it works, grounded in the evidence given. No two ideas on the same hook.",
      "Return JSON only.",
    ].join("\n");

    const schema = {
      type: "object",
      properties: {
        ideas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              problem_id: { type: "string" },
              idea_title: { type: "string" },
              hook: { type: "string" },
              asset: { type: "string" },
              format: { type: "string", enum: DRAFT_KINDS },
              effort: { type: "string", enum: ["low", "medium", "high"] },
              why_it_works: { type: "string" },
            },
            required: ["problem_id", "idea_title", "hook", "asset", "format", "effort", "why_it_works"],
            additionalProperties: false,
          },
        },
      },
      required: ["ideas"],
      additionalProperties: false,
    };

    return { system, user, schema };
  }

  const KIND_SPECS = {
    reel: {
      label: "Instagram Reel script (silent, faceless)",
      instructions:
        "Write a 30–45 second Reel script for a silent, faceless, top-down pen-and-paper video. " +
        "Structure as numbered beats. Each beat = what the pen does on paper + the exact on-screen text overlay (max 8 words per overlay). " +
        "Open with the hook as the first overlay. End with one overlay pointing to the free next step. No voice-over. No face. Music only.",
    },
    caption: {
      label: "Instagram/YouTube Shorts caption",
      instructions:
        "Write the caption that goes under the Reel: first line is the hook, 3–6 short lines of substance in the product voice, " +
        "one plain call-to-action (comment a keyword, or link in bio), then 5–8 specific hashtags. No emojis spam.",
    },
    telegram: {
      label: "Telegram channel post",
      instructions:
        "Write a Telegram channel post, 80–160 words, that gives real value on the problem first (a mini-example or a concrete step), " +
        "then names the asset and one clear next action. Plain text, short lines, no markdown headers.",
    },
    whatsapp: {
      label: "WhatsApp broadcast message",
      instructions:
        "Write a WhatsApp broadcast message, under 90 words, that reads like a personal note from the teacher. One problem, one concrete tip, one next step. " +
        "No hashtags. No emojis beyond one at most.",
    },
    youtube: {
      label: "YouTube title + description",
      instructions:
        "Write 3 alternative titles (under 60 characters each, specific, no clickbait lies) and one 80–140 word description that names the problem, " +
        "what the video shows on paper, and the free next step. Put the titles first, one per line, then a blank line, then the description.",
    },
  };

  function buildDraftPrompt(profile, idea, kind) {
    assertReady(profile);
    const spec = KIND_SPECS[kind];
    if (!spec) throw new Error("Unknown draft kind: " + kind + ". Use one of " + DRAFT_KINDS.join(", ") + ".");
    if (!idea || !idea.hook) throw new Error("Draft needs an idea with a hook.");
    const problem = profile.problems.find((p) => p.id === idea.problem_id);
    const problems = problem ? [problem] : profile.problems;

    const system = [
      "You draft one piece of content for one specific education product, in the founder's voice.",
      NO_SLOP_RULE,
      FACELESS_RULE,
      "",
      profileBlock(profile, problems),
    ].join("\n");

    const user = [
      "Draft: " + spec.label + ".",
      "Idea title: " + (idea.idea_title || "") ,
      "Hook: " + idea.hook,
      "Problem id: " + (idea.problem_id || "") + (problem ? " (" + problem.problem + ")" : ""),
      "Asset to lean on: " + (idea.asset || ""),
      idea.why_it_works ? "Why it works: " + idea.why_it_works : "",
      "",
      spec.instructions,
      "Also return a one-line title for the review queue. Return JSON only.",
    ].filter((l) => l !== "").join("\n");

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        problem_id: { type: "string" },
        asset: { type: "string" },
      },
      required: ["title", "body", "problem_id", "asset"],
      additionalProperties: false,
    };

    return { system, user, schema };
  }

  function buildRequestBody(req, opts) {
    opts = opts || {};
    return {
      model: MODEL,
      max_tokens: opts.maxTokens || 8000,
      system: req.system,
      messages: [{ role: "user", content: req.user }],
      output_config: { format: { type: "json_schema", schema: req.schema } },
      fallbacks: "default",
    };
  }

  function apiHeaders(key) {
    return {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": API_VERSION,
      "anthropic-dangerous-direct-browser-access": "true",
      "anthropic-beta": FALLBACK_BETA,
    };
  }

  // ---------------------------------------------------------------- responses

  function extractText(res) {
    if (!res || typeof res !== "object") return { ok: false, error: "Empty response from the API." };
    if (res.type === "error" || res.error) {
      const msg = (res.error && res.error.message) || "Unknown API error.";
      return { ok: false, error: msg };
    }
    if (res.stop_reason === "refusal") {
      const cat = res.stop_details && res.stop_details.category;
      return { ok: false, error: "The model declined this request" + (cat ? " (" + cat + ")" : "") + ". Rephrase the profile or idea and try again." };
    }
    if (res.stop_reason === "max_tokens") {
      return { ok: false, error: "Response was truncated (max_tokens). Ask for fewer ideas or a shorter draft." };
    }
    const text = (res.content || []).filter((b) => b && b.type === "text").map((b) => b.text).join("");
    if (!text.trim()) return { ok: false, error: "The API returned no text." };
    return { ok: true, text };
  }

  function parseJson(text) {
    if (typeof text !== "string") return { ok: false, error: "Nothing to parse." };
    let t = text.trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try {
      return { ok: true, data: JSON.parse(t) };
    } catch (e) {
      return { ok: false, error: "Could not parse JSON: " + e.message };
    }
  }

  function groundIdeas(ideas, profile) {
    const problemById = new Map((profile.problems || []).map((p) => [p.id, p]));
    const assets = (profile.assets || []).filter(Boolean).map((a) => a.toLowerCase());
    return (ideas || []).map((idea) => {
      const out = Object.assign({}, idea);
      const problem = problemById.get(idea.problem_id);
      const assetText = String(idea.asset || "").trim();
      const assetLower = assetText.toLowerCase();
      const assetOk =
        /^gap:/i.test(assetText) ||
        assets.some((a) => a === assetLower || a.includes(assetLower) || assetLower.includes(a) || sharesKeyword(a, assetLower));
      if (!problem) {
        out.grounded = false;
        out.grounding_error = "Does not name a real problem from the profile (" + (idea.problem_id || "none") + ").";
      } else if (!assetOk) {
        out.grounded = false;
        out.grounding_error = "Does not name a real asset or a flagged gap (" + (assetText || "none") + ").";
      } else {
        out.grounded = true;
        out.grounding_error = "";
      }
      out.problem_text = problem ? problem.problem : "";
      return out;
    });
  }

  function sharesKeyword(a, b) {
    const stop = new Set(["the", "a", "an", "of", "and", "with", "for", "to", "in", "on", "every", "all", "your", "our", "as"]);
    const wa = a.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !stop.has(w));
    const wb = new Set(b.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !stop.has(w)));
    const hits = wa.filter((w) => wb.has(w));
    return hits.length >= 2;
  }

  // ---------------------------------------------------------------- queue

  function newId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function addToQueue(queue, item) {
    if (!item || !DRAFT_KINDS.includes(item.kind)) throw new Error("Unknown draft kind: " + (item && item.kind));
    if (!item.body || !String(item.body).trim()) throw new Error("Draft body is empty.");
    const entry = {
      id: newId(),
      productId: item.productId || "",
      kind: item.kind,
      title: item.title || "(untitled)",
      body: String(item.body),
      problem_id: item.problem_id || "",
      asset: item.asset || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return queue.concat([entry]);
  }

  function transition(queue, id, action, edits) {
    if (!QUEUE_ACTIONS.includes(action)) throw new Error("Unknown queue action: " + action);
    const idx = queue.findIndex((q) => q.id === id);
    if (idx < 0) throw new Error("Queue item not found: " + id);
    const cur = queue[idx];
    let next;
    if (action === "approve") next = Object.assign({}, cur, { status: "approved" });
    else if (action === "kill") next = Object.assign({}, cur, { status: "killed" });
    else {
      const body = edits && edits.body;
      if (!body || !String(body).trim()) throw new Error("Tweak needs a non-empty body.");
      next = Object.assign({}, cur, { body: String(body), title: (edits.title || cur.title), status: "pending" });
    }
    next.updatedAt = new Date().toISOString();
    return queue.slice(0, idx).concat([next], queue.slice(idx + 1));
  }

  function exportBatch(queue, opts) {
    opts = opts || {};
    const items = queue.filter((q) => q.status === "approved" && (!opts.productId || q.productId === opts.productId));
    const header = "=== " + (opts.productName || opts.productId || "All products") + " — approved batch — " + new Date().toISOString().slice(0, 10) + " ===";
    if (items.length === 0) return header + "\n\nNo approved items yet.";
    const out = [header, ""];
    DRAFT_KINDS.forEach((kind) => {
      const group = items.filter((q) => q.kind === kind);
      if (!group.length) return;
      out.push("##### " + kind.toUpperCase() + " (" + group.length + ")");
      out.push("");
      group.forEach((q, i) => {
        out.push("--- " + (i + 1) + ". " + q.title + (q.problem_id ? "  [problem: " + q.problem_id + "]" : "") + " ---");
        out.push(q.body.trim());
        out.push("");
      });
    });
    return out.join("\n");
  }

  // ---------------------------------------------------------------- storage

  function defaultState() {
    return { version: 1, profiles: seedProfiles(), queue: [], settings: { activeProductId: "pyq-vault" } };
  }

  function createStore(backend) {
    function load() {
      try {
        const raw = backend.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        const parsed = parseJson(raw);
        if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") return defaultState();
        const d = parsed.data;
        return {
          version: 1,
          profiles: Array.isArray(d.profiles) && d.profiles.length ? d.profiles : seedProfiles(),
          queue: Array.isArray(d.queue) ? d.queue : [],
          settings: Object.assign({ activeProductId: "pyq-vault" }, d.settings || {}),
        };
      } catch (e) {
        return defaultState();
      }
    }
    function save(state) {
      try {
        backend.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    }
    return { load, save };
  }

  return {
    MODEL, API_URL, API_VERSION, STORAGE_KEY,
    DRAFT_KINDS, SEGMENTS, TONES, QUEUE_ACTIONS,
    blankProfile, validateProfile, isProfileReady, seedProfiles, exportProfiles, importProfiles,
    buildIdeasPrompt, buildDraftPrompt, buildRequestBody, apiHeaders,
    extractText, parseJson, groundIdeas,
    addToQueue, transition, exportBatch,
    createStore, defaultState,
  };
});
