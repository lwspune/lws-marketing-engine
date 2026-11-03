import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ORBIT_END, COVER_T, FLY_AT, PASS_AT, END_AT, HEADER, JETS, VISITS, ROLL, PILLS, CAPTIONS, END_LINES, END_PANEL,
  COVER_CAPTION, BAND, CAM, cameraAt, orbitAt, project, jetPose, jetPoints, litAt, tagAt, ringAt, labelBoxes, captionBox,
  endLineBox, textsAt, dotState, SOUND, TAG,
} from '../src/lib/defence002.ts';
import { whooshesFor } from '../src/lib/sfx.ts';

// @lws.pune · Defence #2 (3D showcase, F4 v1.17): 4 fighter jets of the Indian Air Force. Each lit, the part that tells it
// apart ringed, named with one sourced line; the Rafale rolls; all four fly over. Storyboard (independently reviewed, F31):
// reels/nda-defence-002-jets.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const overlap = (a: { x0: number; x1: number; y0: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const extent = (i: number, t: number) => {
  const ps = jetPoints(i, t).map(p => project(p, cameraAt(t)));
  return { x0: Math.min(...ps.map(p => p.x)), x1: Math.max(...ps.map(p => p.x)), y0: Math.min(...ps.map(p => p.y)), y1: Math.max(...ps.map(p => p.y)), front: ps.every(p => p.depth > 0) };
};
const N = JETS.length;

test('the line-up: Tejas, Mirage 2000, Su-30MKI, Rafale, each with how to spot it and one sourced line; no quiz (F4 v1.17)', () => {
  assert.deepEqual(JETS.map(j => j.name), ['Tejas', 'Mirage 2000', 'Su-30MKI', 'Rafale']);
  assert.deepEqual(HEADER, ['4 fighter jets of the', 'Indian Air Force']);
  assert.deepEqual(PILLS.map(p => p.text), JETS.map((j, i) => `${i + 1} · ${j.name}`));
  assert.deepEqual(CAPTIONS.map(c => c.text), ['Small triangle wing, kinked.', 'Designed and built in India.', 'Triangle wing, straight edge.',
    'From France, upgraded by HAL.', 'Two tail fins.', 'Russian design, built by HAL.', 'Front wings, one tail fin.', 'With the IAF since 2020.']);
  for (const t of frames) assert.ok(!textsAt(t).some(s => /comment your guess|[✓✗]|^[ABC]$/.test(s)), `quiz text at ${t.toFixed(2)}`);
});

test('the outlines that tell them apart (storyboard § 8)', () => {
  const [tejas, mirage, su, rafale] = JETS;
  const le = (w: [number, number][]) => { const tip = w.reduce((a, b) => (b[0] > a[0] ? b : a)); return w.slice(0, w.indexOf(tip) + 1); };
  const slopes = (pts: [number, number][]) => pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0]));
  const tl = slopes(le(tejas.wing)), ml = slopes(le(mirage.wing));
  assert.ok(tl.length >= 2 && Math.abs(tl[0] - tl[1]) > 0.5, "the Tejas's leading edge has a kink");
  assert.ok(ml.length === 1, "the Mirage's leading edge is one straight line");
  for (const j of [tejas, mirage]) assert.ok(!j.canard && !j.tailplane && j.nozzles.length === 1 && j.fins.length === 1, j.name);
  assert.ok(su.canard && su.tailplane && su.nozzles.length === 2 && su.fins.length === 2);
  assert.ok(rafale.canard && !rafale.tailplane && rafale.nozzles.length === 2 && rafale.fins.length === 1);
  assert.ok(su.len > rafale.len && rafale.len > mirage.len && mirage.len > tejas.len, 'Su-30 longest, Tejas smallest');
});

test('timeline and pacing floor: the turn 4 s, glides ≥ 1.5 s, captions ≥ 1.5 s, the end card ≥ 3 s, ≤ 30 s', () => {
  assert.equal(ORBIT_END, 4.0);
  assert.ok(CAM.keys[0].t < ORBIT_END - 0.4 && COVER_T < CAM.keys[0].t);
  assert.equal(VISITS.length, N);
  for (const v of VISITS) {
    const into = CAM.keys.find(k => Math.abs(k.t + k.dur - v.settled) < 1e-9);
    assert.ok(into && into.dur >= 1.5, `the glide into ${JETS[v.jet].name}`);
  }
  for (const c of CAPTIONS) assert.ok(c.t1 - c.t0 >= 1.5 - 1e-9, `"${c.text}" ${(c.t1 - c.t0).toFixed(2)} s`);
  let prev = 0;
  for (const c of CAPTIONS) { assert.ok(c.t0 >= prev - 1e-9); prev = c.t1; }
  VISITS.forEach((v, k) => assert.equal(CAPTIONS[2 * k].t0, v.settled, 'each spot line starts with the light-up'));
  assert.ok(DURATION <= 30 && DURATION - END_AT >= 3 - 1e-9, 'the end card ≥ 3 s (review I3)');
  assert.ok(PASS_AT < END_AT);
});

test('captions and end lines: ≤ 7 words, ≤ 840 px, centred, out of the bottom 320 px and the right 120 px', () => {
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).length <= 7, c.text);
    const b = captionBox(c);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600, `"${c.text}" ${JSON.stringify(b)}`);
  }
  for (const l of END_LINES) {
    const b = endLineBox(l);
    assert.ok(b.x1 - b.x0 <= 840 && b.y1 <= 1600 && b.y0 >= END_PANEL.top, l.text);
  }
  assert.deepEqual(END_LINES.map(l => l.text), ['Flying one starts with the exam:', 'maths is 300 of 900 marks.', 'Follow for more']);
});

test('camera: one full turn from frame 0, at speed on frame 0, easing out only; no jumps', () => {
  assert.ok(Math.abs(orbitAt(ORBIT_END) - 360) < 1e-9 && orbitAt(0) === 0);
  const speed = (t: number) => (orbitAt(t + 1 / 30) - orbitAt(t)) * 30;
  assert.ok(speed(0) > 120);
  for (let t = 1 / 30; t < ORBIT_END - 1 / 30; t += 1 / 30) assert.ok(speed(t) <= speed(t - 1 / 30) + 1e-9);
  let prev = cameraAt(0);
  for (const t of frames.slice(1)) {
    const c = cameraAt(t), rel = (p: number[], q: number[]) => p.map((v, i) => v - q[i]);
    const d = Math.hypot(...rel(rel(c.position, c.target), rel(prev.position, prev.target)) as [number, number, number]);
    const reach = Math.hypot(...rel(c.position, c.target) as [number, number, number]);
    assert.ok(d < 0.2 * reach + 1, `t ${t.toFixed(2)}: camera jumps ${d.toFixed(1)} m`);
    prev = c;
  }
});

test('the opening: all four jets whole and inside the band through the turn; tags apart and inside the band', () => {
  for (const t of frames.filter(t => t <= CAM.keys[0].t)) {
    for (let i = 0; i < N; i++) {
      const e = extent(i, t);
      assert.ok(e.front && e.x0 >= 40 && e.x1 <= 1040 && e.y0 >= BAND.top + 20 && e.y1 <= 1600, `t ${t.toFixed(2)}: ${JETS[i].name} ${e.x0.toFixed(0)}–${e.x1.toFixed(0)}, ${e.y0.toFixed(0)}–${e.y1.toFixed(0)}`);
    }
    const tags = JETS.map((_, i) => tagAt(i, t)).filter(g => g.alpha > 0.05).map(g => ({ x0: g.x - TAG.r, x1: g.x + TAG.r, y0: g.y - TAG.r, y1: g.y + TAG.r }));
    for (const g of tags) assert.ok(g.y0 >= BAND.top && g.x0 >= 0 && g.x1 <= 1080, `t ${t.toFixed(2)}: a tag out of the band (review)`);
    for (let i = 0; i < tags.length; i++) for (let j = i + 1; j < tags.length; j++) assert.ok(!overlap(tags[i], tags[j]), `t ${t.toFixed(2)}: tags overlap`);
  }
});

test('the cover (review B4): before the glide, jets part-lit, the promise above the picture inside the 3:4 crop', () => {
  assert.ok(JETS.every((_, i) => litAt(i, COVER_T) > 0.25 && litAt(i, COVER_T) < 0.5), 'part-lit, not yet shown');
  const lines = COVER_CAPTION.text.split('\n').length, h = lines * COVER_CAPTION.size * 1.22 + 60;
  assert.ok(COVER_CAPTION.y - h / 2 >= 240 && COVER_CAPTION.y + h / 2 <= BAND.top + 10);
});

test('each visit: the jet fills ≥ 50 % of the width inside the band; the ring on it, between y 520 and 1300, only with the spot line', () => {
  VISITS.forEach((v, k) => {
    const end = k < N - 1 ? VISITS[k + 1].go : ROLL.t0;
    for (const t of frames.filter(t => t >= v.settled && t < end)) {
      const e = extent(v.jet, t);
      assert.ok(e.front && e.x1 - e.x0 >= 540, `t ${t.toFixed(2)}: ${JETS[v.jet].name} only ${(e.x1 - e.x0).toFixed(0)} px`);
      assert.ok(e.x0 >= 20 && e.x1 <= 1060 && e.y0 >= BAND.top && e.y1 <= 1600, `t ${t.toFixed(2)}: ${JETS[v.jet].name} out of the band`);
      const r = ringAt(t), spot = t < CAPTIONS[2 * k].t1;
      if (spot) {
        assert.ok(r && r.alpha > 0, `t ${t.toFixed(2)}: no ring`);
        assert.ok(r!.x > e.x0 - 10 && r!.x < e.x1 + 10 && r!.y > e.y0 - 10 && r!.y < e.y1 + 10, `t ${t.toFixed(2)}: ring off the jet`);
        assert.ok(r!.y - r!.r >= 520 && r!.y + r!.r <= 1300 && r!.x - r!.r >= 0 && r!.x + r!.r <= 1080, `t ${t.toFixed(2)}: ring at ${r!.x.toFixed(0)}, ${r!.y.toFixed(0)}`);
      } else assert.ok(!r || r.alpha < 0.05, `t ${t.toFixed(2)}: ring during the fact line`);
    }
  });
});

test('lighting up: part-lit from frame 0, fully lit at its visit; all lit for the fly-over', () => {
  for (const v of VISITS) {
    assert.ok(Math.abs(litAt(v.jet, v.settled - 0.05) - litAt(v.jet, 0)) < 1e-9);
    assert.ok(litAt(v.jet, v.settled + 0.5) > 0.95);
  }
  assert.ok(JETS.every((_, i) => litAt(i, FLY_AT + 0.1) > 0.95));
});

test('header dots: the jet being shown is "now", earlier ones "done"', () => {
  assert.deepEqual(JETS.map((_, i) => dotState(i, 0)), ['next', 'next', 'next', 'next']);
  assert.deepEqual(JETS.map((_, i) => dotState(i, 10)), ['done', 'now', 'next', 'next']);
  for (const t of frames) { const p = PILLS.find(q => t >= q.t0 && t < q.t1); if (p) assert.equal(dotState(PILLS.indexOf(p), t), 'now', `t ${t.toFixed(2)}: the dot and the name disagree`); }
  assert.deepEqual(JETS.map((_, i) => dotState(i, 24)), ['done', 'done', 'done', 'now']);
});

test('the barrel roll: the Rafale rolls a full turn during its second line; the others hold', () => {
  const R = N - 1;
  assert.ok(ROLL.t0 >= CAPTIONS[2 * R + 1].t0 && ROLL.t1 <= CAPTIONS[2 * R + 1].t1);
  assert.ok(Math.abs(jetPose(R, ROLL.t1).roll - jetPose(R, ROLL.t0).roll - 2 * Math.PI) < 0.15);
  assert.ok(Math.abs(jetPose(0, ROLL.t1).roll - jetPose(0, ROLL.t0).roll) < 0.5);
});

test('labels: the pill, the caption, the tags and the ring never overlap and stay on screen (tags may cross mid-turn)', () => {
  for (const t of [...frames, COVER_T]) {
    const all = labelBoxes(t), boxes = t < ORBIT_END && t > 0 && t !== COVER_T ? all.filter(b => !b.tag) : all;
    for (const b of boxes) assert.ok(b.x0 >= 0 && b.x1 <= 1080 && b.y0 >= BAND.top && b.y1 <= 1600, `t ${t.toFixed(2)}: "${b.text}" off screen`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      if (boxes[i].tag && boxes[j].tag) continue;
      assert.ok(!overlap(boxes[i], boxes[j]), `t ${t.toFixed(2)}: "${boxes[i].text}" / "${boxes[j].text}"`);
    }
  }
});

test('the fly-over: after the last line, the camera below; all four in frame together ≥ 0.8 s, one pass ≥ 400 px', () => {
  assert.ok(FLY_AT >= CAPTIONS[CAPTIONS.length - 1].t1 - 1e-9);
  let together = 0, big = 0;
  for (const t of frames.filter(t => t >= FLY_AT && t < END_AT)) {
    const es = JETS.map((_, i) => extent(i, t));
    if (es.every(e => e.front && e.x1 > 60 && e.x0 < 1020 && e.y1 > BAND.top && e.y0 < 1600)) together += 1 / 30;
    big = Math.max(big, ...es.filter(e => e.front).map(e => e.x1 - e.x0));
  }
  assert.ok(together >= 0.8, `all four in frame ${together.toFixed(2)} s`);
  assert.ok(big >= 400, `the biggest pass ${big.toFixed(0)} px`);
  assert.ok(cameraAt(PASS_AT).position[1] < jetPose(0, PASS_AT).pos[1], 'looking up at them');
});

test('sound: a shimmer per light-up, the passes the loudest hits, the roar; no whoosh on slow glides; the music dips', () => {
  const near = (k: string, t: number) => SOUND.hits.some(h => h.kind === k && Math.abs(h.t - t) < 0.03);
  for (const v of VISITS) assert.ok(near('shimmer', v.settled), `shimmer at ${v.settled}`);
  const passes = SOUND.hits.filter(h => h.kind === "whoosh-in" && Math.abs(h.t - PASS_AT) < 0.6).sort((a, b) => b.gain - a.gain).slice(0, 4);
  assert.equal(passes.length, 4, "a pass per jet");
  const rest = SOUND.hits.filter(h => !passes.includes(h));
  assert.ok(passes.every(p => rest.every(h => h.gain < p.gain)), 'the passes the loudest');
  assert.ok(SOUND.beds.some(b => b.kind === 'roar' && b.t0 >= FLY_AT - 0.5));
  assert.ok(SOUND.beds.some(b => b.kind === 'roar' && b.t0 === 0), 'the engines hum from frame 0');
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh')).map(w => w.kind + '@' + w.t.toFixed(2));
  for (const w of whooshesFor(CAM.start, CAM.keys)) assert.ok(ws.includes(w.kind + '@' + w.t.toFixed(2)));
  for (const k of CAM.keys) if (k.dur >= 1.5) assert.ok(!SOUND.hits.some(h => h.kind.startsWith('whoosh') && h.t > k.t + 0.2 && h.t < k.t + k.dur - 0.2 && !(h.t >= ROLL.t0 && h.t <= ROLL.t1) && !(h.t >= FLY_AT)), `a whoosh in the slow move at ${k.t}`);
  assert.ok(SOUND.music!(VISITS[N - 1].settled + 0.05) < 0.8 * SOUND.music!(2) && SOUND.music!(PASS_AT) < 0.8 * SOUND.music!(2) && SOUND.music!(2) > 0);
  const taps = SOUND.hits.filter(h => h.kind === 'tap' || h.kind === 'click').map(h => h.t).sort((a, b) => a - b);
  for (let i = 1; i < taps.length; i++) assert.ok(taps[i] - taps[i - 1] >= 0.08 - 1e-9);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
});
