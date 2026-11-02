import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ORBIT_END, COVER_T, ANSWER_AT, END_AT, MARCH_IN, OPTIONS, ANSWER, CROSSED, PILLS, CAPTIONS, END_LINES, BAND, BASE,
  HILLS, PINS, STOPS, BLOCKS, LINE, cameraAt, azimuthAt, CAM, project, pinAt, figuresAt, crossingTimes, lineFlashAt, jetsAt, JET,
  lightAt, labelBoxes, captionBox, endLineBox, textsAt, SOUND, COVER_CAPTION, END_PANEL, PIN, PIN_COLOR, GRASS, WATER, MARK, ringAt,
  boatsAt, SAIL,
} from '../src/lib/life001.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { distinguishable } from '../src/lib/palette.ts';
import { contrast } from '../src/lib/paint.ts';

// @lws.pune · NDA Life #1 (3D, predict-first): NDA as a miniature. "Where is the passing-out parade held?" A Sudan Block ·
// B Khetarpal · C Peacock Bay; the tour crosses out A and C, cadets land on Khetarpal Ground (B ✓) and the passing-out
// course crosses the Antim Pag. Storyboard (independently reviewed, F31): reels/nda-life-001-campus.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);

test('the question: A Sudan Block · B Khetarpal · C Peacock Bay, answer B; the word "Ground" only from the answer on (review B1)', () => {
  assert.deepEqual(OPTIONS.map(o => o.replace(/\s+/g, ' ')), ['A Sudan Block', 'B Khetarpal', 'C Peacock Bay']);
  assert.equal(ANSWER, 1);
  assert.deepEqual(CROSSED.map(c => c.i), [0, 2], 'A then C crossed out');
  assert.deepEqual(CROSSED.map(c => c.at), [5.0, 7.9]);
  for (const t of frames) {
    const shown = textsAt(t).join(' | ');
    if (t < ANSWER_AT) assert.ok(!/Khetarpal Ground/.test(shown), `t ${t.toFixed(2)}: "${shown}"`);
  }
  assert.ok(textsAt(ANSWER_AT + 0.5).some(s => /Khetarpal Ground/.test(s)));
});

test('timeline: ≤ 25 s; the answer at 10.6 after both crosses; the cover before anything is given away', () => {
  assert.equal(DURATION, 17.6); assert.equal(ORBIT_END, 3.0); assert.equal(ANSWER_AT, 10.6); assert.equal(END_AT, 15.6);
  assert.ok(CROSSED.every(c => c.at < ANSWER_AT));
  assert.ok(COVER_T < ORBIT_END && COVER_T < MARCH_IN);
  assert.equal(figuresAt(COVER_T).length, 0, 'the ground is empty on the cover');
  for (const p of PINS) assert.equal(pinAt(PINS.indexOf(p), COVER_T).state, 'open');
  assert.deepEqual(END_LINES.map(l => l.text), ['It starts with the written exam.', 'Maths: 300 of 900 marks.', 'Follow for more']);
  assert.ok(END_LINES.every((l, i) => i === 0 || l.at > END_LINES[i - 1].at));
  assert.ok(DURATION - END_AT >= 1.8);
});

test('nothing marches before 9.5 s and no option lights before the answer', () => {
  assert.equal(MARCH_IN, 9.5);
  for (const t of frames.filter(t => t < MARCH_IN)) assert.equal(figuresAt(t).length, 0, `t ${t.toFixed(2)}`);
  for (const t of frames.filter(t => t < ANSWER_AT)) assert.ok(PINS.every((_, i) => pinAt(i, t).state !== 'right'));
  assert.equal(pinAt(ANSWER, ANSWER_AT + 0.01).state, 'right');
  assert.equal(pinAt(0, 5.01).state, 'crossed'); assert.equal(pinAt(2, 7.91).state, 'crossed');
});

test('each stop pill holds ≥ 0.6 s after its "not here" caption appears, and a caption never outlives its stop (review B3)', () => {
  const pillAt = (t: number) => PILLS.find(p => t >= p.t0 && t < p.t1)?.text ?? null;
  for (const c of CAPTIONS) {
    const p = pillAt(c.t0);
    assert.ok(p, `"${c.text}" has a pill`);
    for (const t of frames.filter(t => t >= c.t0 && t < c.t1)) assert.equal(pillAt(t)?.[0], p![0], `t ${t.toFixed(2)}: "${c.text}" under another stop's pill`);
  }
  for (const x of CROSSED) {
    const cap = CAPTIONS.find(c => Math.abs(c.t0 - x.at) < 1e-9)!;
    assert.ok(cap, `a caption at the cross ${x.at}`);
    const change = PILLS.find(p => p.t0 > x.at)!.t0;
    assert.ok(change - x.at >= 0.6, `pill changes ${(change - x.at).toFixed(2)} s after the cross`);
  }
  assert.deepEqual(PILLS.map(p => p.text), ['A · Sudan Block', 'C · Peacock Bay', 'B · Khetarpal', 'B · Khetarpal Ground']);
});

test('captions and end lines: ≤ 7 words, ≤ 840 px wide and centred, out of the bottom 320 px and the right 120 px (review B4)', () => {
  let prev = 0;
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, c.text);
    assert.ok(c.t0 >= prev && c.t1 > c.t0, c.text); prev = c.t1;
    const b = captionBox(c);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600, `"${c.text}" ${JSON.stringify(b)}`);
  }
  for (const l of END_LINES) {
    const b = endLineBox(l);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600 && b.y0 >= 1100, `"${l.text}" ${JSON.stringify(b)}`);
  }
  assert.ok(COVER_CAPTION.y - 80 >= 240 && COVER_CAPTION.y + 80 <= 1680, 'the cover question survives the 3:4 grid crop');
});

test('camera: one full orbit from frame 0, at speed on frame 0 and easing out only (F22, logged B7); no jumps', () => {
  assert.equal(azimuthAt(0) % 360, 0);
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - azimuthAt(0) - 360) < 1e-9, 'exactly 360°');
  const speed = (t: number) => (azimuthAt(t + 1 / 30) - azimuthAt(t)) * 30;
  assert.ok(speed(0) > 150, `moving at ${speed(0).toFixed(0)}°/s on frame 0`);
  for (let t = 1 / 30; t < ORBIT_END - 1 / 30; t += 1 / 30) assert.ok(speed(t) <= speed(t - 1 / 30) + 1e-9, 'eases out only');
  let prev = cameraAt(0);
  for (const t of frames.slice(1)) {
    const c = cameraAt(t), d = Math.hypot(...c.position.map((v, i) => v - prev.position[i]) as [number, number, number]);
    const reach = Math.hypot(...c.position.map((v, i) => v - c.target[i]) as [number, number, number]);
    assert.ok(d < 0.2 * reach + 1, `t ${t.toFixed(2)}: camera jumps ${d.toFixed(1)} m`);
    prev = c;
  }
});

test('framing: the whole model ≤ 960 px wide and inside the band in the orbit and the closing view (review L)', () => {
  const corners = [BASE.x0, BASE.x1].flatMap(x => [BASE.z0, BASE.z1].flatMap(z => [[x, 0, z], [x, -BASE.h, z]] as [number, number, number][]));
  const tops = HILLS.map(h => [h.x, h.h, h.z] as [number, number, number]);
  for (const t of frames.filter(t => t <= ORBIT_END || t >= END_AT)) {
    const ps = [...corners, ...tops].map(p => project(p, cameraAt(t)));
    const x0 = Math.min(...ps.map(p => p.x)), x1 = Math.max(...ps.map(p => p.x));
    const y0 = Math.min(...ps.map(p => p.y)), y1 = Math.max(...ps.map(p => p.y));
    assert.ok(x1 - x0 <= 960 && x0 >= 40 && x1 <= 1040, `t ${t.toFixed(2)}: model ${x0.toFixed(0)}–${x1.toFixed(0)}`);
    assert.ok(y0 >= BAND.top && y1 <= BAND.top + BAND.height, `t ${t.toFixed(2)}: model y ${y0.toFixed(0)}–${y1.toFixed(0)}`);
    if (t >= END_AT) assert.ok(y1 <= END_PANEL.top - 10, `t ${t.toFixed(2)}: the model (to ${y1.toFixed(0)}) under the end card`);
  }
});

test('at each stop its pin stays inside the picture band; at the punch-in pin B and the ground stay in (review L)', () => {
  for (const s of STOPS) {
    for (const t of frames.filter(t => t >= s.settled && t < s.t1)) {
      const p = pinAt(s.pin, t);
      assert.ok(p.alpha > 0.5, `t ${t.toFixed(2)}: pin ${'ABC'[s.pin]} hidden`);
      assert.ok(p.y >= BAND.top + 40 && p.y <= BAND.top + BAND.height - 20 && p.x >= 60 && p.x <= 1020, `t ${t.toFixed(2)}: pin ${'ABC'[s.pin]} at ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`);
    }
  }
});

test('labels: the stop pill, the caption and the pins never overlap and stay on screen (pins may pass behind each other mid-orbit)', () => {
  for (const t of [...frames, COVER_T]) {
    const all = labelBoxes(t), readFrame = t === 0 || Math.abs(t - COVER_T) < 1e-9 || t >= ORBIT_END;
    const boxes = readFrame ? all : all.filter(b => !b.pin);
    for (const b of boxes) assert.ok(b.x0 >= 0 && b.x1 <= 1080 && b.y0 >= BAND.top && b.y1 <= 1600, `t ${t.toFixed(2)}: "${b.text}" off screen`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [a, b] = [boxes[i], boxes[j]];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `t ${t.toFixed(2)}: "${a.text}" / "${b.text}"`);
    }
  }
});

test('the parade: blocks land one after another by the answer; then only the passing-out course moves and crosses the line (review I1)', () => {
  assert.ok(BLOCKS.filter(b => b.course).length >= 1 && BLOCKS.some(b => !b.course));
  const settled = figuresAt(ANSWER_AT - 0.05);
  assert.equal(settled.length, BLOCKS.reduce((n, b) => n + b.rows * b.cols, 0), 'every block landed before the answer');
  assert.ok(settled.every(f => Math.abs(f.y) < 1e-6));
  const course = (t: number) => figuresAt(t).filter(f => f.course), others = (t: number) => figuresAt(t).filter(f => !f.course);
  const a = others(ANSWER_AT + 0.05), b = others(13.4);
  a.forEach((f, i) => assert.ok(Math.abs(f.x - b[i].x) < 1e-9 && Math.abs(f.z - b[i].z) < 1e-9, 'the other blocks stand still'));
  for (const f of course(11.5)) assert.ok(f.z > LINE.z, 'no one crosses before 11.6 s');
  for (const f of course(13.0)) assert.ok(f.z < LINE.z, 'every rank of the course has crossed by 13.0 s');
  const times = crossingTimes();
  assert.ok(times.length >= 4 && times.every(c => c >= 11.6 && c <= 13.0), times.join(', '));
  for (const c of times) assert.ok(lineFlashAt(c + 0.02) > 0.8, `the line flashes as a rank crosses at ${c.toFixed(2)}`);
  assert.ok(LINE.width >= 2, 'a band, not a hairline (panel pass 1)');
  // the course blocks are inside the line's length, the others outside it
  for (const bl of BLOCKS) {
    const half = ((bl.cols - 1) * bl.dx) / 2 + 0.5;
    if (bl.course) assert.ok(Math.abs(bl.x) + half <= LINE.half, 'the course fits the line');
    else assert.ok(Math.abs(bl.x) - half > LINE.half || bl.z > -40, 'other blocks clear of the line');
  }
});

test('jets: only in 13.0–14.4, three in a vee, at least a quarter of the frame wide as they pass (review I2: no smoke)', () => {
  for (const t of frames) {
    const js = jetsAt(t);
    if (t < 13.0 || t >= 14.4) assert.equal(js.length, 0, `t ${t.toFixed(2)}`);
    else assert.equal(js.length, 3);
  }
  assert.equal(JET.smoke, false);
  let best = 0;
  for (const t of frames.filter(t => t >= 13.0 && t < 14.4)) {
    const cam = cameraAt(t), lead = jetsAt(t)[0];
    const at = (k: number) => lead.pos.map((v, i) => v + k * (JET.span / 2) * lead.side[i]) as [number, number, number];
    const l = project(at(-1), cam), r = project(at(1), cam);
    if (l.depth > 0 && r.depth > 0 && l.y > BAND.top && l.y < BAND.top + BAND.height) best = Math.max(best, Math.hypot(r.x - l.x, r.y - l.y));
  }
  assert.ok(best >= 270, `the lead jet at most ${best.toFixed(0)} px wide`);
});

test('light: golden afternoon, then low and orange in the pull-back (the dome-lights beat was cut, panel pass 1)', () => {
  assert.ok(lightAt(5).elevation > 25 && lightAt(15.6).elevation < 12);
  assert.ok(lightAt(14.0).elevation - lightAt(15.4).elevation > 15, 'the light drops in the pull-back');
  assert.ok(lightAt(15.6).warm > 0.95 && lightAt(5).warm === 0);
  assert.ok(!SOUND.hits.some(h => h.kind === 'shimmer'), 'no sound for a beat that is gone');
});

test('pins (panel pass 1): one dark colour that stands out on grass and water; big coloured marks; each pin pops in turn in the opening', () => {
  for (const ground of [GRASS, WATER]) assert.ok(contrast(PIN_COLOR, ground) >= 4.5, `pin on ${ground}`);
  assert.ok(PINS.every(p => p.color === PIN_COLOR));
  const right = pinAt(ANSWER, ANSWER_AT + 0.5), wrong = pinAt(0, 6);
  assert.equal(right.mark, '✓'); assert.equal(wrong.mark, '✗');
  assert.ok(MARK.r >= PIN.r * 0.8, 'the mark is nearly pin-sized');
  assert.ok(distinguishable(MARK.right, MARK.wrong), 'tick and cross told apart by colour too');
  assert.ok(pinAt(0, 5.15).pop > 1.2 && pinAt(2, 8.05).pop > 1.2 && pinAt(ANSWER, ANSWER_AT + 0.15).pop > 1.3, 'the pin pops with its mark');
  PINS.forEach((_, i) => assert.ok(pinAt(i, 0).alpha > 0.5, `pin ${i} on frame 0`));
  for (const at of [0.3, 0.9, 1.5]) assert.ok(PINS.some((_, i) => pinAt(i, at + 0.12).pop > 1.15), `a pin pops at ${at}`);
  assert.ok(ringAt(ANSWER_AT + 0.2) > 0 && ringAt(ANSWER_AT - 0.1) === 0, 'a ring flashes out from B on the answer');
});

test('boats keep their distance from the camera, so no sail fills the frame (panel pass 1)', () => {
  for (const t of frames) for (const b of boatsAt(t)) {
    const c = cameraAt(t).position, d = Math.hypot(b.x - c[0], b.z - c[2]);
    assert.ok(d >= 70, `t ${t.toFixed(2)}: a boat ${d.toFixed(0)} m from the camera`);
  }
  assert.ok(boatsAt(0).every(b => b.sail === SAIL), 'every sail white');
});

test('jets (panel pass 1): as they pass, all three are in frame and apart', () => {
  let ok = false;
  for (const t of frames.filter(t => t >= 13.4 && t < 14.3)) {
    const cam = cameraAt(t), ps = jetsAt(t).map(j => project(j.pos, cam));
    const inside = ps.every(p => p.depth > 0 && p.x >= 60 && p.x <= 1020 && p.y >= BAND.top + 40 && p.y <= 1600);
    const apart = ps.every((a, i) => ps.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) >= 120));
    if (inside && apart) ok = true;
  }
  assert.ok(ok, 'no frame shows the three jets inside the picture and apart');
});

test('sound: whooshes only on the fast glides (F15, review B5), a thud per cross, a thunk on the answer, a tap per landing and per rank crossing', () => {
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh'));
  assert.deepEqual(ws.map(w => w.kind + '@' + w.t.toFixed(2)), whooshesFor(CAM.start, CAM.keys).map(w => w.kind + '@' + w.t.toFixed(2)));
  for (const k of CAM.keys) if (k.dur > 0.9) assert.ok(!ws.some(w => w.t > k.t && w.t < k.t + k.dur - 0.2), `a whoosh in the slow move at ${k.t}`);
  assert.ok(ws.length >= 3);
  for (const x of CROSSED) assert.ok(SOUND.hits.some(h => h.kind === 'whump' && Math.abs(h.t - x.at) < 0.02), `thud at ${x.at}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 0.02));
  const taps = SOUND.hits.filter(h => h.kind === 'tap').map(h => h.t);
  for (const b of BLOCKS) assert.ok(taps.some(t => Math.abs(t - b.lands) < 0.02), `a tap as the block at ${b.x}, ${b.z} lands`);
  for (const c of crossingTimes()) assert.ok(taps.some(t => Math.abs(t - c) < 0.02), `a tap as a rank crosses at ${c.toFixed(2)}`);
  const roar = SOUND.beds.find(b => b.kind === 'roar')!;
  assert.ok(roar && roar.t0 <= 13.0 && roar.t1 >= 14.2);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
});
