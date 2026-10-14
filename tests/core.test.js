"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../core.js");

// ---------- profiles ----------

test("blankProfile has the required shape and is not ready", () => {
  const p = core.blankProfile("crack-ssb", "Crack SSB");
  assert.equal(p.id, "crack-ssb");
  assert.equal(p.name, "Crack SSB");
  assert.deepEqual(p.problems, []);
  assert.deepEqual(p.assets, []);
  assert.equal(typeof p.offer, "object");
  assert.equal(core.isProfileReady(p), false);
});

test("validateProfile reports missing fields by name", () => {
  const p = core.blankProfile("x", "");
  const r = core.validateProfile(p);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /name/i.test(e)));
  assert.ok(r.errors.some((e) => /buyer/i.test(e)));
  assert.ok(r.errors.some((e) => /problem/i.test(e)));
  assert.ok(r.errors.some((e) => /asset/i.test(e)));
});

test("validateProfile rejects a problem without text", () => {
  const p = core.seedProfiles()[0];
  const bad = { ...p, problems: [{ id: "p1", problem: "   " }] };
  const r = core.validateProfile(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /problem/i.test(e)));
});

test("seedProfiles ships a ready PYQ Vault and a blank Crack SSB", () => {
  const seeds = core.seedProfiles();
  const pyq = seeds.find((s) => s.id === "pyq-vault");
  const ssb = seeds.find((s) => s.id === "crack-ssb");
  assert.ok(pyq, "pyq-vault seed missing");
  assert.ok(ssb, "crack-ssb seed missing");
  assert.equal(pyq.problems.length, 10);
  assert.ok(pyq.assets.length >= 5);
  assert.equal(core.isProfileReady(pyq), true);
  assert.equal(core.isProfileReady(ssb), false);
});

// ---------- prompts ----------

test("buildIdeasPrompt refuses a profile that is not ready", () => {
  const ssb = core.seedProfiles().find((s) => s.id === "crack-ssb");
  assert.throws(() => core.buildIdeasPrompt(ssb, { count: 3 }), /not ready|problem|asset/i);
});

test("buildIdeasPrompt grounds the prompt in the profile", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const req = core.buildIdeasPrompt(pyq, { count: 4, segment: "dropper", tone: "punchy-short" });
  const all = req.system + "\n" + req.user;
  for (const prob of pyq.problems) assert.ok(all.includes(prob.problem), "missing problem: " + prob.problem);
  for (const asset of pyq.assets) assert.ok(all.includes(asset), "missing asset: " + asset);
  assert.ok(all.includes(pyq.voice));
  assert.ok(/\b4\b/.test(req.user), "count not in prompt");
  assert.ok(/dropper/.test(all));
  assert.ok(/punchy-short/.test(all));
  assert.ok(/no face|faceless/i.test(all));
  assert.ok(/fabricat/i.test(all), "must forbid fabricated quotes");
});

test("buildIdeasPrompt schema requires problem and asset on every idea", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const req = core.buildIdeasPrompt(pyq, { count: 2 });
  const s = req.schema;
  assert.equal(s.type, "object");
  assert.equal(s.additionalProperties, false);
  const item = s.properties.ideas.items;
  assert.ok(item.required.includes("problem_id"));
  assert.ok(item.required.includes("asset"));
  assert.ok(item.required.includes("hook"));
  assert.equal(item.additionalProperties, false);
});

test("buildIdeasPrompt only injects the selected problems when problemIds given", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const req = core.buildIdeasPrompt(pyq, { count: 2, problemIds: [pyq.problems[0].id] });
  const all = req.system + "\n" + req.user;
  assert.ok(all.includes(pyq.problems[0].problem));
  assert.ok(!all.includes(pyq.problems[3].problem));
});

test("buildDraftPrompt for a reel is silent, faceless, and on-screen-text based", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const idea = { problem_id: pyq.problems[0].id, idea_title: "T", hook: "H", asset: pyq.assets[0], why_it_works: "W" };
  const req = core.buildDraftPrompt(pyq, idea, "reel");
  const all = req.system + "\n" + req.user;
  assert.ok(/no face/i.test(all));
  assert.ok(/no voice|silent/i.test(all));
  assert.ok(/on-screen text/i.test(all));
  assert.ok(all.includes("H"));
  assert.ok(req.schema.properties.body);
  assert.ok(req.schema.required.includes("body"));
});

test("buildDraftPrompt knows every supported kind and rejects others", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const idea = { problem_id: pyq.problems[0].id, idea_title: "T", hook: "H", asset: pyq.assets[0] };
  for (const kind of core.DRAFT_KINDS) assert.ok(core.buildDraftPrompt(pyq, idea, kind).user.length > 0, kind);
  assert.throws(() => core.buildDraftPrompt(pyq, idea, "podcast"), /kind/i);
});

test("buildRequestBody produces a valid Messages API body", () => {
  const body = core.buildRequestBody({ system: "S", user: "U", schema: { type: "object", properties: {}, required: [], additionalProperties: false } });
  assert.equal(body.model, "claude-opus-5");
  assert.equal(body.system, "S");
  assert.deepEqual(body.messages, [{ role: "user", content: "U" }]);
  assert.equal(body.output_config.format.type, "json_schema");
  assert.equal(body.output_config.format.schema.type, "object");
  assert.equal(body.fallbacks, "default");
  assert.ok(body.max_tokens >= 4000);
  assert.equal(body.stream, undefined);
});

test("apiHeaders carry the key, version, browser-access and fallback beta headers", () => {
  const h = core.apiHeaders("sk-test");
  assert.equal(h["x-api-key"], "sk-test");
  assert.equal(h["anthropic-version"], "2023-06-01");
  assert.equal(h["anthropic-dangerous-direct-browser-access"], "true");
  assert.ok(h["anthropic-beta"].includes("server-side-fallback-2026-07-01"));
});

// ---------- responses ----------

test("extractText joins text blocks on a normal response", () => {
  const r = core.extractText({ stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "{\"a\":" }, { type: "text", text: "1}" }] });
  assert.equal(r.ok, true);
  assert.equal(r.text, "{\"a\":1}");
});

test("extractText reports a refusal instead of returning content", () => {
  const r = core.extractText({ stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber" }, content: [{ type: "text", text: "nope" }] });
  assert.equal(r.ok, false);
  assert.ok(/declin|refus/i.test(r.error));
});

test("extractText reports a truncated response", () => {
  const r = core.extractText({ stop_reason: "max_tokens", content: [{ type: "text", text: "{" }] });
  assert.equal(r.ok, false);
  assert.ok(/truncat|max_tokens|longer/i.test(r.error));
});

test("parseJson strips fences and reports bad JSON readably", () => {
  assert.deepEqual(core.parseJson("```json\n{\"x\":1}\n```").data, { x: 1 });
  assert.deepEqual(core.parseJson("  {\"x\":2} ").data, { x: 2 });
  const bad = core.parseJson("{oops");
  assert.equal(bad.ok, false);
  assert.ok(/JSON/i.test(bad.error));
});

test("groundIdeas flags ideas that name a real problem and a real asset or gap", () => {
  const pyq = core.seedProfiles().find((s) => s.id === "pyq-vault");
  const ideas = [
    { problem_id: pyq.problems[0].id, asset: pyq.assets[0], hook: "a" },
    { problem_id: pyq.problems[1].id, asset: "GAP: dual-track study plan", hook: "b" },
    { problem_id: "made-up", asset: pyq.assets[0], hook: "c" },
    { problem_id: pyq.problems[0].id, asset: "some generic thing", hook: "d" },
  ];
  const out = core.groundIdeas(ideas, pyq);
  assert.deepEqual(out.map((i) => i.grounded), [true, true, false, false]);
  assert.ok(/problem/i.test(out[2].grounding_error));
  assert.ok(/asset/i.test(out[3].grounding_error));
  assert.equal(out[0].problem_text, pyq.problems[0].problem);
});

// ---------- queue ----------

test("queue transitions are immutable and validated", () => {
  const q0 = [];
  const q1 = core.addToQueue(q0, { productId: "pyq-vault", kind: "reel", title: "T", body: "B" });
  assert.equal(q0.length, 0);
  assert.equal(q1.length, 1);
  assert.equal(q1[0].status, "pending");
  assert.ok(q1[0].id);
  assert.ok(q1[0].createdAt);

  const id = q1[0].id;
  const q2 = core.transition(q1, id, "approve");
  assert.equal(q1[0].status, "pending");
  assert.equal(q2[0].status, "approved");

  const q3 = core.transition(q1, id, "tweak", { body: "B2" });
  assert.equal(q3[0].status, "pending");
  assert.equal(q3[0].body, "B2");
  assert.equal(q1[0].body, "B");

  const q4 = core.transition(q1, id, "kill");
  assert.equal(q4[0].status, "killed");

  assert.throws(() => core.transition(q1, id, "publish"), /action/i);
  assert.throws(() => core.transition(q1, "nope", "approve"), /not found/i);
  assert.throws(() => core.transition(q1, id, "tweak", { body: "" }), /body/i);
});

test("addToQueue rejects an item with no body or unknown kind", () => {
  assert.throws(() => core.addToQueue([], { productId: "p", kind: "reel", title: "T", body: "" }), /body/i);
  assert.throws(() => core.addToQueue([], { productId: "p", kind: "podcast", title: "T", body: "x" }), /kind/i);
});

test("exportBatch includes only approved items for the product, grouped by kind", () => {
  let q = [];
  q = core.addToQueue(q, { productId: "pyq-vault", kind: "reel", title: "R1", body: "reel body" });
  q = core.addToQueue(q, { productId: "pyq-vault", kind: "caption", title: "C1", body: "caption body" });
  q = core.addToQueue(q, { productId: "pyq-vault", kind: "telegram", title: "T1", body: "tg body" });
  q = core.addToQueue(q, { productId: "crack-ssb", kind: "reel", title: "R2", body: "other product" });
  q = core.transition(q, q[0].id, "approve");
  q = core.transition(q, q[1].id, "approve");
  q = core.transition(q, q[2].id, "kill");
  q = core.transition(q, q[3].id, "approve");

  const out = core.exportBatch(q, { productId: "pyq-vault", productName: "PYQ Vault" });
  assert.ok(out.includes("PYQ Vault"));
  assert.ok(out.includes("reel body"));
  assert.ok(out.includes("caption body"));
  assert.ok(!out.includes("tg body"));
  assert.ok(!out.includes("other product"));
  assert.ok(out.indexOf("REEL") < out.indexOf("CAPTION"));

  const empty = core.exportBatch(q, { productId: "nothing", productName: "Nothing" });
  assert.ok(/no approved/i.test(empty));
});

// ---------- storage ----------

test("createStore round-trips state and survives a broken backend", () => {
  const mem = {};
  const backend = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
  const store = core.createStore(backend);
  const fresh = store.load();
  assert.ok(Array.isArray(fresh.profiles));
  assert.ok(fresh.profiles.some((p) => p.id === "pyq-vault"), "fresh state seeds profiles");
  assert.deepEqual(fresh.queue, []);

  const next = { ...fresh, queue: [{ id: "q1", status: "pending" }] };
  assert.equal(store.save(next), true);
  assert.deepEqual(store.load().queue, next.queue);

  const broken = core.createStore({ getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } });
  assert.ok(Array.isArray(broken.load().profiles));
  assert.equal(broken.save(next), false);
});

test("createStore ignores corrupt stored JSON", () => {
  const backend = { getItem: () => "{not json", setItem: () => {} };
  const store = core.createStore(backend);
  assert.ok(Array.isArray(store.load().profiles));
});

test("exportProfiles / importProfiles round-trip and validate", () => {
  const seeds = core.seedProfiles();
  const json = core.exportProfiles(seeds);
  const back = core.importProfiles(json);
  assert.equal(back.ok, true);
  assert.equal(back.profiles.length, seeds.length);
  assert.equal(core.importProfiles("{bad").ok, false);
  assert.equal(core.importProfiles(JSON.stringify({ profiles: [{ name: "no id" }] })).ok, false);
});
