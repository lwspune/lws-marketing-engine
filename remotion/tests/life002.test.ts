import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ORBIT_END, COVER_T, PULL, END_AT, LABEL, HEADER, ROADS, VISITS, PILLS, CAPTIONS, END_LINES, END_PANEL, COVER_CAPTION,
  BAND, CAM, SPEED, STEP_HZ, STEP_LEN, WHEELS_UP, PASS_AT, cameraAt, orbitAt, project, columnAt, columnPoints, academyPoints,
  slabCorners, ROLL_AT, UNIFORM, FORECOURT, forecourtAt, flagPoints, planeAt, planePoints, flagAt, shipAt, shipPoints, puffAt, drawnAt, PEAKS, SLAB, tagAt, TAG, GATE, labelBoxes, captionBox, pillBox, endLineBox, textsAt, dotState, SOUND,
} from '../src/lib/life002.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';

// @lws.pune · NDA Life #2 (3D showcase, F4 v1.17): 3 roads after NDA. Three columns of cadets march from NDA's gate to the
// Indian Military Academy, the Indian Naval Academy and the Air Force Academy; each academy named with the rank a year
// later. Storyboard (independently reviewed, F31): reels/nda-life-002-roads.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; x1: number; y0: number; y1: number };
const overlap = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const extentOf = (pts: [number, number, number][], t: number) => {
  const ps = pts.map(p => project(p, cameraAt(t)));
  return { x0: Math.min(...ps.map(p => p.x)), x1: Math.max(...ps.map(p => p.x)), y0: Math.min(...ps.map(p => p.y)), y1: Math.max(...ps.map(p => p.y)), front: ps.every(p => p.depth > 0) };
};
const N = ROADS.length;

test('the three roads, as UPSC\'s notice gives them (storyboard § 8); a showcase, no quiz (F4 v1.17)', () => {
  assert.deepEqual(ROADS.map(r => [r.service, r.academy, r.place, r.rank]), [
    ['Army', 'Indian Military Academy', 'Dehradun', 'Lieutenant'],
    ['Navy', 'Indian Naval Academy', 'Ezhimala', 'Sub-Lieutenant'],
    ['Air Force', 'Air Force Academy', 'Hyderabad', 'Flying Officer'],
  ]);
  assert.equal(LABEL, 'NDA LIFE  ·  THE ROAD AHEAD');
  assert.deepEqual(HEADER, ['After 3 years at NDA,', '3 roads to 3 academies']);
  assert.deepEqual(PILLS.map(p => p.text), ['1 · Army · Dehradun', '2 · Navy · Ezhimala', '3 · Air Force · Hyderabad']);
  assert.deepEqual(CAPTIONS.map(c => c.text), ['Indian Military Academy.', '1 year, then Lieutenant.', 'Indian Naval Academy.',
    '1 year, then Sub-Lieutenant.', 'Air Force Academy.', '1 year, then Flying Officer.', '4 years: cadet to officer.']);
  assert.deepEqual(END_LINES.map(l => l.text), ['All 3 roads start with the exam:', 'maths is 300 of 900 marks.', 'Follow for more']);
  assert.equal(COVER_CAPTION.text, HEADER.join('\n'));
  for (const t of frames) assert.ok(!textsAt(t).some(s => /comment your guess|[✓✗?]|^[ABC]$/.test(s)), `quiz text at ${t.toFixed(2)}`);
});

test('timeline and pacing floor: the turn 4 s, the first glide inside it, glides ≥ 1.5 s, captions ≥ 1.5 s, end card ≥ 3 s, < 25 s', () => {
  assert.equal(ORBIT_END, 4.0);
  assert.equal(VISITS.length, N);
  assert.ok(VISITS[0].go <= ORBIT_END - 0.5 && COVER_T < VISITS[0].go, 'the first glide starts inside the turn (review I1)');
  for (const v of VISITS) {
    const into = CAM.keys.find(k => Math.abs(k.t - v.go) < 1e-9 && Math.abs(k.t + k.dur - v.settled) < 1e-9);
    assert.ok(into && into.dur >= 1.5, `the glide into road ${v.road + 1}`);
    assert.ok(v.arrive > v.settled + 1.0, `road ${v.road + 1}: the camera follows the column before it arrives`);
  }
  for (const c of CAPTIONS) assert.ok(c.t1 - c.t0 >= 1.5 - 1e-9, `"${c.text}" ${(c.t1 - c.t0).toFixed(2)} s`);
  let prev = 0;
  for (const c of CAPTIONS) { assert.ok(c.t0 >= prev - 1e-9, `"${c.text}" overlaps the one before`); prev = c.t1; }
  VISITS.forEach((v, k) => assert.ok(CAPTIONS[2 * k + 1].t0 < v.arrive + 0.5 && CAPTIONS[2 * k + 1].t1 > v.arrive, 'the rank line is up as the column arrives'));
  assert.ok(VISITS.every((v, k) => k === 0 || v.go >= VISITS[k - 1].arrive + 0.8), "each arrival's moment plays before the next glide");
  assert.ok(PULL >= VISITS[N - 1].arrive + 1.5 && END_AT > PULL);
  assert.ok(DURATION < 25 && DURATION - END_AT >= 3 - 1e-9, 'under 25 s (review I2), the end card ≥ 3 s');
});

test('every line fits (review B3): captions ≤ 7 words and ≤ 840 px at 48 px; pills ≤ 840 px; end lines ≤ 840 px; all centred, clear of the bottom and the right', () => {
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).length <= 7, c.text);
    assert.equal(c.size, 48);
    const b = captionBox(c);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600, `"${c.text}" ${(b.x1 - b.x0).toFixed(0)} px`);
  }
  for (const p of PILLS) { const b = pillBox(p.text); assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.y1 <= 1600, `"${p.text}" ${(b.x1 - b.x0).toFixed(0)} px`); }
  for (const l of END_LINES) {
    const b = endLineBox(l);
    assert.ok(b.x1 - b.x0 <= 840 && b.y1 <= 1600 && b.y0 >= END_PANEL.top && b.y1 <= END_PANEL.top + END_PANEL.height, l.text);
  }
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
    const move = Math.hypot(...rel(c.target, prev.target) as [number, number, number]);
    const reach = Math.hypot(...rel(c.position, c.target) as [number, number, number]);
    assert.ok(d < 0.2 * reach + 1 && move < 0.12 * reach + 1, `t ${t.toFixed(2)}: camera jumps ${d.toFixed(1)} / ${move.toFixed(1)} m`);
    prev = c;
  }
});

test('the columns (review B4): all three march from frame 0 at two steps a second, feet moving as far as the column (no sliding), and halt on arrival', () => {
  assert.equal(STEP_HZ, 2);
  assert.ok(Math.abs(SPEED - STEP_HZ * STEP_LEN) < 1e-9, 'speed = steps a second × step length');
  ROADS.forEach((r, k) => {
    const v = VISITS[k], a = columnAt(k, 0), b = columnAt(k, 1);
    assert.ok(a.moving && Math.abs(b.s - a.s - SPEED) < 1e-6, `column ${k + 1} marches from frame 0`);
    assert.ok(a.s >= 0, `column ${k + 1} starts on its road`);
    assert.ok(Math.abs(columnAt(k, v.arrive).s - r.length) < 1e-6, `column ${k + 1} reaches its academy at ${v.arrive}`);
    assert.ok(!columnAt(k, v.arrive + 0.5).moving && columnAt(k, DURATION).s === columnAt(k, v.arrive).s, `column ${k + 1} halts`);
  });
});

test('following (review I5): the column ≥ 25 % of the width and each cadet ≥ 55 px tall, inside the band, until it arrives', () => {
  VISITS.forEach((v, k) => {
    for (const t of frames.filter(t => t >= v.settled && t < v.arrive)) {
      const e = extentOf(columnPoints(k, t), t);
      assert.ok(e.front && e.x1 - e.x0 >= 270, `t ${t.toFixed(2)}: column ${k + 1} only ${(e.x1 - e.x0).toFixed(0)} px wide`);
      assert.ok(e.x0 >= 20 && e.x1 <= 1060 && e.y0 >= BAND.top + 20 && e.y1 <= 1300, `t ${t.toFixed(2)}: column ${k + 1} out of the band ${JSON.stringify(e)}`);
      const lead = columnPoints(k, t).slice(0, 2), h = extentOf(lead, t);   // the first cadet's feet and cap
      assert.ok(h.y1 - h.y0 >= 55, `t ${t.toFixed(2)}: a cadet only ${(h.y1 - h.y0).toFixed(0)} px tall`);
    }
  });
});

test('arrivals: once the camera has risen (1 s), the academy and its column both in the band, above y 1300, until the next glide', () => {
  VISITS.forEach((v, k) => {
    const end = k < N - 1 ? VISITS[k + 1].go : PULL;
    for (const t of frames.filter(t => t >= v.arrive + 1.0 && t < end)) {
      for (const [what, pts] of [['academy', academyPoints(k)], ['column', columnPoints(k, t)]] as const) {
        const e = extentOf(pts as [number, number, number][], t);
        assert.ok(e.front && e.x0 >= 20 && e.x1 <= 1060 && e.y0 >= BAND.top + 10 && e.y1 <= 1300, `t ${t.toFixed(2)}: road ${k + 1}'s ${what} ${JSON.stringify(e)}`);
      }
    }
  });
});

test('the opening: the whole diorama inside the band through the turn; tags inside the band and apart', () => {
  for (const t of frames.filter(t => t <= VISITS[0].go)) {
    const e = extentOf(slabCorners(), t);
    assert.ok(e.front && e.x0 >= 40 && e.x1 <= 1040 && e.y0 >= BAND.top + 20 && e.y1 <= 1600, `t ${t.toFixed(2)}: the diorama ${JSON.stringify(e)}`);
    const tags = ROADS.map((_, i) => tagAt(i, t)).filter(g => g.alpha > 0.05).map(g => ({ x0: g.x - TAG.r, x1: g.x + TAG.r, y0: g.y - TAG.r, y1: g.y + TAG.r }));
    for (const g of tags) assert.ok(g.y0 >= BAND.top && g.x0 >= 0 && g.x1 <= 1080, `t ${t.toFixed(2)}: a tag out of the band`);
    for (let i = 0; i < tags.length; i++) for (let j = i + 1; j < tags.length; j++) assert.ok(!overlap(tags[i], tags[j]), `t ${t.toFixed(2)}: tags overlap`);
  }
});

test('the cover: before the first glide, the promise above the picture inside the 3:4 crop', () => {
  assert.ok(COVER_T < VISITS[0].go);
  const lines = COVER_CAPTION.text.split('\n').length, h = lines * COVER_CAPTION.size * 1.22 + 60;
  assert.ok(COVER_CAPTION.y - h / 2 >= 240 && COVER_CAPTION.y + h / 2 <= BAND.top + 10);
});

test('road colours (review I3): one per road, told apart from its own ground and from each other (colour-blind safe); the pill and dot match', () => {
  ROADS.forEach((r, k) => {
    assert.ok(distinguishable(r.color, r.ground), `${r.service}: road ${r.color} on ground ${r.ground}`);
    for (let j = k + 1; j < N; j++) assert.ok(distinguishable(r.color, ROADS[j].color), `${r.service} vs ${ROADS[j].service}`);
    assert.equal(PILLS[k].color, r.color);
  });
});

test('header dots: the road being shown is "now", earlier ones "done"; the dot and the pill agree', () => {
  assert.deepEqual(ROADS.map((_, i) => dotState(i, 0)), ['next', 'next', 'next']);
  for (const t of frames) { const p = PILLS.find(q => t >= q.t0 && t < q.t1); if (p) assert.equal(dotState(PILLS.indexOf(p), t), 'now', `t ${t.toFixed(2)}`); }
  assert.deepEqual(ROADS.map((_, i) => dotState(i, DURATION - 0.1)), ['done', 'done', 'done']);
});

test('arrival moments (review I2; panel pass 1: the mist lifted off screen): a flag runs up on road 1, the ship sounds its horn and turns on road 2, the plane takes off on road 3', () => {
  assert.ok(flagAt(VISITS[0].arrive - 0.05) === 0 && flagAt(VISITS[0].arrive + 1.3) === 1, 'the flag runs up the mast as column 1 arrives');
  const horn = SOUND.hits.find(h => h.kind === 'horn')!;
  assert.ok(puffAt(horn.t - 0.05) === 0 && puffAt(horn.t + 0.4) > 0.5, 'a steam puff from the funnel with the horn (it works muted)');
  const hn = SOUND.hits.find(h => h.kind === 'horn')!.t, h0 = shipAt(hn - 0.2).heading, h1 = shipAt(hn + 1.4).heading;
  assert.ok(Math.abs(h1 - h0) > 0.6, 'the ship turns towards the shore');
  assert.ok(WHEELS_UP > VISITS[2].arrive && WHEELS_UP < PULL);
  assert.ok(planeAt(WHEELS_UP - 0.5).pos[1] < 0.5 && planeAt(WHEELS_UP + 1).pos[1] > 4, 'on the runway, then climbing');
  assert.ok(planeAt(WHEELS_UP - 0.9).speed < planeAt(WHEELS_UP).speed, 'it accelerates down the runway');
});

test('panel pass 1: the ship big in the Navy arrival, from the horn until the next glide; the peaks on the board; the roads part-drawn on frame 0', () => {
  const horn = SOUND.hits.find(h => h.kind === 'horn')!;
  for (const t of frames.filter(t => t >= horn.t && t < VISITS[2].go)) {
    const e = extentOf(shipPoints(t), t);
    assert.ok(e.front && e.x0 >= 40 && e.x1 <= 1040 && e.y0 >= BAND.top + 40 && e.y1 <= 1300, `t ${t.toFixed(2)}: the ship ${JSON.stringify(e)}`);
    assert.ok(e.x1 - e.x0 >= 260, `t ${t.toFixed(2)}: the ship only ${(e.x1 - e.x0).toFixed(0)} px`);
    const ina = extentOf(academyPoints(1), t), ox = Math.max(0, Math.min(e.x1, ina.x1) - Math.max(e.x0, ina.x0)), oy = Math.max(0, Math.min(e.y1, ina.y1) - Math.max(e.y0, ina.y0));
    assert.ok(ox * oy <= 0.15 * (e.x1 - e.x0) * (e.y1 - e.y0), `t ${t.toFixed(2)}: the ship behind the academy (stills, pass 1 fix)`);
  }
  for (const p of PEAKS) assert.ok(p.x - p.r >= SLAB.x0 + 2 && p.z - p.r >= SLAB.z0 + 2, 'a peak hangs off the board');
  assert.ok(drawnAt(0) >= 0.3 && drawnAt(2.5) === 1, 'the three colours on frame 0, drawing out');
});

test('the take-off (review B5, I9): the plane crosses the picture sideways between y 520 and 1300; a quick push in at wheels-up', () => {
  let shown = 0, xs: number[] = [];
  for (const t of frames.filter(t => t >= WHEELS_UP - 0.6 && t < PULL)) {
    const e = extentOf(planePoints(t), t);
    if (!e.front || e.x1 < 0 || e.x0 > 1080) continue;
    shown += 1 / 30; xs.push((e.x0 + e.x1) / 2);
    assert.ok(e.y0 >= 520 && e.y1 <= 1300, `t ${t.toFixed(2)}: the plane at y ${e.y0.toFixed(0)}–${e.y1.toFixed(0)}`);
  }
  assert.ok(shown >= 1.0, `the plane on screen only ${shown.toFixed(2)} s`);
  assert.ok(Math.max(...xs) - Math.min(...xs) >= 500, 'it crosses the picture sideways');
  const widest = Math.max(...frames.filter(t => t >= WHEELS_UP && t < PULL).map(t => { const e = extentOf(planePoints(t), t); return e.front ? Math.min(1080, e.x1) - Math.max(0, e.x0) : 0; }));
  assert.ok(widest >= 360, `the plane at most ${widest.toFixed(0)} px wide (panel pass 1: a third of the frame)`);
  const punch = CAM.keys.find(k => Math.abs(k.t - WHEELS_UP) < 0.05);
  assert.ok(punch && punch.dur <= 0.5, 'a quick push in at wheels-up (F9)');
  const before = CAM.keys.filter(k => k.t < punch!.t).at(-1)!;
  assert.ok(punch!.to[0] > before.to[0] * 1.1, 'it pushes in');
});

test('panel pass 2: the take-off happens in the picture: the roll and wheels-up whole in frame, clear of the column; it lifts off mid-frame and is still climbing in the pull-up', () => {
  for (const t of frames.filter(t => t >= ROLL_AT + 0.4 && t <= WHEELS_UP + 0.2)) {
    const e = extentOf(planePoints(t), t), c = extentOf(columnPoints(2, t), t);
    assert.ok(e.front && e.x0 >= 0 && e.x1 <= 1080 && e.y0 >= 520 && e.y1 <= 1300, `t ${t.toFixed(2)}: the plane ${JSON.stringify(e)} (panel pass 2: wheels-up off screen)`);
    const ox = Math.max(0, Math.min(e.x1, c.x1) - Math.max(e.x0, c.x0)), oy = Math.max(0, Math.min(e.y1, c.y1) - Math.max(e.y0, c.y0));
    assert.ok(ox * oy <= 0.1 * (c.x1 - c.x0) * (c.y1 - c.y0), `t ${t.toFixed(2)}: the plane over the column`);
  }
  const w = extentOf(planePoints(WHEELS_UP), WHEELS_UP), mid = (w.x0 + w.x1) / 2;
  assert.ok(mid >= 400 && mid <= 900, `wheels-up at x ${mid.toFixed(0)}: lift off near the middle`);
  const up = extentOf(planePoints(PULL + 0.3), PULL + 0.3);
  assert.ok(up.front && up.x1 > 0 && up.x0 < 1080, 'the plane still in the picture as the pull-up starts');
});

test('panel pass 2: the IMA flag big and rising in the picture; a pale parade square under each halted column (navy on the Navy road)', () => {
  const a = VISITS[0].arrive;
  assert.ok(flagAt(a + 0.55) === 0 && flagAt(a + 1.3) === 1, 'the flag runs up once the camera has settled');
  for (const t of frames.filter(t => t >= a + 0.8 && t < VISITS[1].go)) {
    const e = extentOf(flagPoints(0, t), t);
    assert.ok(e.front && e.x0 >= 0 && e.x1 <= 1080 && e.y0 >= BAND.top, `t ${t.toFixed(2)}: the flag out of the picture ${JSON.stringify(e)}`);
    if (t >= a + 1.0) assert.ok(e.x1 - e.x0 >= 100, `t ${t.toFixed(2)}: the flag only ${(e.x1 - e.x0).toFixed(0)} px wide`);
  }
  assert.ok(distinguishable(UNIFORM, FORECOURT.color), 'the uniforms against the parade square');
  VISITS.forEach((v, k) => {
    const c = forecourtAt(k);
    for (const p of columnPoints(k, v.arrive)) assert.ok(Math.hypot(p[0] - c[0], p[2] - c[2]) <= FORECOURT.r - 0.5, `column ${k + 1} off its parade square`);
  });
});

test('panel pass 2, Sound: the roll as loud as the reel around it, the engine through the climb, the horn and shimmers under the music, a click for every line, surf only on the coast', () => {
  const roar = SOUND.beds.filter(b => b.kind === 'roar'), lvl = (t: number) => roar.reduce((s, b) => s + (t >= b.t0 && t <= b.t1 ? b.level(t) : 0), 0);
  assert.ok(SOUND.music!(ROLL_AT + 0.2) >= 0.8, 'the music holds until the engine has built');
  for (let t = ROLL_AT; t <= PULL + 1; t += 0.05) assert.ok(SOUND.music!(t) >= 0.85 * 0.8 - 1e-9, `t ${t.toFixed(2)}: the music dips more than ~2 dB`);
  assert.ok(SOUND.music!(PASS_AT + 0.6) >= 0.84, 'the music back soon after the pass');
  assert.ok(lvl(ROLL_AT + 0.4) >= 2 && lvl(WHEELS_UP) >= 4, `the engine builds early (${lvl(ROLL_AT + 0.4).toFixed(2)}, ${lvl(WHEELS_UP).toFixed(2)})`);
  assert.ok(lvl(PULL + 0.3) >= 1.5, 'the engine still heard while the plane climbs into the pull-up');
  assert.ok(SOUND.hits.find(h => h.kind === 'horn')!.gain <= 0.25, 'the horn under the music');
  for (const h of SOUND.hits.filter(h => h.kind === 'shimmer' && h.t < END_AT)) assert.ok(h.gain <= 0.2, `shimmer at ${h.t}`);
  const four = CAPTIONS.find(c => c.text.startsWith('4 years'))!;
  assert.ok(SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - four.t0) < 0.05), 'a click as "4 years" appears');
  const waves = SOUND.beds.find(b => b.kind === 'waves')!, dawn = SOUND.beds.find(b => b.kind === 'dawn')!;
  for (const t of [1, 5, 16, 20]) assert.ok(waves.level(t) <= 0.05, `surf at ${t} s, away from the coast`);
  assert.ok(Math.max(...frames.map(t => dawn.level(t))) <= 0.65, 'wind and birds under the music');
});

test('labels: the pill, the caption and the tags never overlap and stay on screen', () => {
  for (const t of [...frames, COVER_T]) {
    const boxes = labelBoxes(t);
    for (const b of boxes) assert.ok(b.x0 >= 0 && b.x1 <= 1080 && b.y0 >= BAND.top && b.y1 <= 1600, `t ${t.toFixed(2)}: "${b.text}" off screen`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      if (boxes[i].tag && boxes[j].tag) continue;
      assert.ok(!overlap(boxes[i], boxes[j]), `t ${t.toFixed(2)}: "${boxes[i].text}" / "${boxes[j].text}"`);
    }
  }
});

test('sound (review I8): marching only while a column is followed, louder each visit; a click per pill; soft shimmers; the horn; the take-off the loudest; the music in its quiet bar under it', () => {
  const near = (k: string, t: number, w = 0.05) => SOUND.hits.filter(h => h.kind === k && Math.abs(h.t - t) < w);
  const steps = (k: number) => SOUND.hits.filter(h => h.kind === 'tap' && h.t >= VISITS[k].go && h.t <= VISITS[k].arrive + 0.05 && h.pitch === 0.8);
  VISITS.forEach((v, k) => {
    const s = steps(k);
    assert.ok(s.length >= 4, `road ${k + 1}: ${s.length} steps`);
    assert.ok(s.every(h => h.t >= v.go + 0.5 && h.t <= v.arrive + 0.05), `road ${k + 1}: steps off screen`);
    if (k) assert.ok(Math.max(...s.map(h => h.gain)) > Math.max(...steps(k - 1).map(h => h.gain)), `road ${k + 1}'s march no louder than the one before`);
    for (let j = 1; j < s.length; j++) assert.ok(Math.abs(s[j].t - s[j - 1].t - 1 / STEP_HZ) < 1e-6, 'one tap per step');
    assert.ok(near('shimmer', v.arrive).every(h => h.gain <= 0.35) && near('shimmer', v.arrive).length === 1, `a soft shimmer at ${v.arrive}`);
  });
  for (const p of PILLS) assert.equal(near('click', p.t0, 0.06).length, 1, `a click as "${p.text}" lands`);
  assert.equal(SOUND.hits.filter(h => h.kind === 'horn').length, 1);
  assert.ok(SOUND.hits.some(h => h.kind === 'horn' && h.t > VISITS[1].arrive && h.t < VISITS[2].go - 0.5));
  const pass = SOUND.hits.filter(h => h.kind === 'whoosh-in' && Math.abs(h.t - PASS_AT) < 0.3);
  assert.equal(pass.length, 1, 'one pass as the plane crosses');
  assert.ok(SOUND.hits.every(h => h === pass[0] || h.gain < pass[0].gain), 'the take-off the loudest hit');
  assert.ok(SOUND.beds.some(b => b.kind === 'roar' && b.t0 <= WHEELS_UP - 1 && b.t1 >= PASS_AT));
  assert.ok(SOUND.beds.some(b => b.kind === 'dawn') && SOUND.beds.some(b => b.kind === 'waves'));
  assert.ok(SOUND.music!(PASS_AT) < 0.9 * SOUND.music!(2) && SOUND.music!(PULL + 1) > 0.9 * SOUND.music!(2));   // a shallow dip: the track's own quiet bar does the rest (panel pass 2)
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh')).map(w => w.kind + '@' + w.t.toFixed(2));
  for (const w of whooshesFor(CAM.start, CAM.keys)) if (Math.abs(w.t - PASS_AT) > 1) assert.ok(ws.includes(w.kind + '@' + w.t.toFixed(2)));
  assert.ok(SOUND.hits.filter(h => h.kind.startsWith('whoosh') && Math.abs(h.t - PASS_AT) <= 1).length === 1, 'one whoosh at the take-off (panel pass 1: three in 0.9 s)');
  assert.ok(SOUND.hits.some(h => Math.abs(h.t - END_AT) < 0.05), 'the end card lands with a sound (panel pass 1)');
  const taps = SOUND.hits.filter(h => h.kind === 'tap' || h.kind === 'click').map(h => h.t).sort((a, b) => a - b);
  for (let i = 1; i < taps.length; i++) assert.ok(taps[i] - taps[i - 1] >= 0.08 - 1e-9, `taps ${taps[i - 1].toFixed(2)} / ${taps[i].toFixed(2)} too close`);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
});

test('the end card (stills): NDA\'s gate, where the roads meet, and all three academies stay above the card and inside the band', () => {
  for (const t of frames.filter(t => t >= END_AT)) {
    for (const [what, p] of [['the gate', GATE], ...ROADS.map(r => [r.academy, r.at] as const)] as const) {
      const q = project(p as [number, number, number], cameraAt(t));
      assert.ok(q.depth > 0 && q.y <= END_PANEL.top - 30 && q.y >= BAND.top + 20 && q.x >= 40 && q.x <= 1040, `t ${t.toFixed(2)}: ${what} at ${q.x.toFixed(0)}, ${q.y.toFixed(0)}`);
    }
  }
});
