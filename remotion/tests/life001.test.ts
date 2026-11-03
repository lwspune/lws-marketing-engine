import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ORBIT_END, COVER_T, GROUND_AT, END_AT, MARCH_GO, PULL, STOPS, PLACES, PILLS, CAPTIONS, END_LINES, BAND, BASE, HILLS, PINS,
  BLOCKS, LINE, POOL, RING, SQUADRON, LAWN, LAKE, cameraAt, azimuthAt, CAM, project, pinAt, popAt, figuresAt, ptAt, swimmersAt, horsesAt,
  crossingTimes, lineFlashAt, jetsAt, JET, lightAt, labelBoxes, captionBox, endLineBox, textsAt, SOUND, COVER_CAPTION, END_PANEL, PIN,
  PIN_COLOR, GRASS, WATER, boatsAt, SAIL, routeAt, ROUTE, dotState, HEADER, ANTIM, skyAt, orbitAt,
} from '../src/lib/life001.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { contrast } from '../src/lib/paint.ts';

// @lws.pune · NDA Life #1 (3D): NDA campus tour. Six places along a route on a toy-like model, then the passing-out
// course crosses the Antim Pag and jets pass. Storyboard (independently reviewed, F31): reels/nda-life-001-campus.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const overlap = (a: { x0: number; x1: number; y0: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

test('the tour: six places in order, each with a pill, a sourced caption and a pin (storyboard § 5, § 8)', () => {
  assert.deepEqual(PLACES.map(p => p.name), ['Sudan Block', 'Squadron building', 'Swimming pool', 'Horse riding', 'Peacock Bay', 'Khetarpal Ground']);
  assert.equal(PINS.length, 6);
  assert.deepEqual(PILLS.map(p => p.text), PLACES.map((p, i) => `${i + 1} · ${p.name}`));
  assert.deepEqual(CAPTIONS.map(c => c.text), ["NDA's landmark building.", 'Cadets live in squadrons.', "One of NDA's three pools.",
    'Cadets learn horse riding.', 'Water sports all year round.', 'Where cadets pass out.', 'The last step: Antim Pag.']);
  assert.deepEqual(HEADER, ['6 places every', 'NDA cadet knows']);
  assert.deepEqual(END_LINES.map(l => l.text), ['It starts with the written exam:', 'maths is 300 of 900 marks.', 'Follow for more']);
  assert.equal(END_LINES[0].at, END_LINES[1].at, 'one sentence: both rows arrive together (review B2)');
  assert.ok(END_LINES[2].at > END_LINES[1].at);
});

test('timeline: the opening turn, a place every 3 s, the finale, ~30 s', () => {
  assert.equal(ORBIT_END, 4.0); assert.equal(COVER_T, 3.6);
  assert.deepEqual(STOPS.map(s => s.go), [4.0, 7.0, 10.0, 13.0, 16.0, 19.0]);
  STOPS.forEach((s, i) => { assert.equal(s.place, i); assert.equal(s.settled, s.go + 1.5); });
  assert.equal(GROUND_AT, 20.5); assert.ok(MARCH_GO > GROUND_AT + 0.5);
  assert.ok(DURATION <= 30 && DURATION - END_AT >= 1.8);
});

test('pacing floor (F2 v1.15): glides 1.5 s, captions ≥ 1.5 s, the turn 4 s', () => {
  for (const s of STOPS) {
    const into = CAM.keys.find(k => Math.abs(k.t + k.dur - s.settled) < 1e-9);
    assert.ok(into && into.dur >= 1.5 && into.t <= s.go + 1e-9, `the glide into ${PLACES[s.place].name}`);
  }
  // panel (Motion): the first glide starts while the turn is still going, so the opening never settles to a stop
  assert.ok(CAM.keys[0].t < ORBIT_END - 0.4);
  for (const c of CAPTIONS) assert.ok(c.t1 - c.t0 >= 1.5 - 1e-9, `"${c.text}" ${(c.t1 - c.t0).toFixed(2)} s`);
  let prev = 0;
  for (const c of CAPTIONS) { assert.ok(c.t0 >= prev - 1e-9, c.text); prev = c.t1; }
});

test('each place: its caption is up only while the camera is there, under its own pill', () => {
  const pill = (t: number) => PILLS.find(p => t >= p.t0 && t < p.t1)?.text ?? null;
  CAPTIONS.slice(0, 5).forEach((c, i) => {
    const s = STOPS[i];
    assert.ok(c.t0 >= s.settled - 0.3 - 1e-9 && c.t1 <= (STOPS[i + 1]?.go ?? DURATION) + 1e-9, c.text);
    for (const t of frames.filter(t => t >= c.t0 && t < c.t1)) assert.equal(pill(t)?.[0], String(i + 1), `t ${t.toFixed(2)} "${c.text}"`);
  });
  for (const t of frames.filter(t => t >= CAPTIONS[5].t0 && t < CAPTIONS[6].t1)) assert.equal(pill(t)?.[0], '6');
});

test('captions and end lines: ≤ 7 words, ≤ 840 px wide and centred, out of the bottom 320 px and the right 120 px', () => {
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, c.text);
    const b = captionBox(c);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600, `"${c.text}" ${JSON.stringify(b)}`);
  }
  for (const l of END_LINES) {
    const b = endLineBox(l);
    assert.ok(b.x1 - b.x0 <= 840 && b.x0 >= 120 && b.x1 <= 960 && b.y1 <= 1600 && b.y0 >= END_PANEL.top, `"${l.text}" ${JSON.stringify(b)}`);
  }
});

test('the cover (review B3): the hook once, above the picture, inside the 3:4 crop, clear of every pin', () => {
  const lines = COVER_CAPTION.text.split('\n').length, h = lines * COVER_CAPTION.size * 1.22 + 60;
  const box = { x0: 100, x1: 980, y0: COVER_CAPTION.y - h / 2, y1: COVER_CAPTION.y + h / 2 };
  assert.ok(box.y0 >= 240 && box.y1 <= BAND.top + 10, `cover hook at ${box.y0.toFixed(0)}–${box.y1.toFixed(0)}`);
  for (let i = 0; i < PINS.length; i++) {
    const p = pinAt(i, COVER_T), pb = { x0: p.x - PIN.r, x1: p.x + PIN.r, y0: p.y - 2 * PIN.r - PIN.tip, y1: p.y };
    assert.ok(p.alpha > 0.5 && !overlap(box, pb), `pin ${i + 1}`);
  }
});

test('camera: one full orbit from frame 0, at speed on frame 0, easing out only, back at the front by 4 s; no jumps', () => {
  assert.equal(azimuthAt(0) % 360, 0);
  assert.ok(Math.abs(orbitAt(ORBIT_END) - orbitAt(0) - 360) < 1e-9, 'one full turn');
  const speed = (t: number) => (orbitAt(t + 1 / 30) - orbitAt(t)) * 30;
  assert.ok(speed(0) > 120, `${speed(0).toFixed(0)}°/s on frame 0`);
  for (let t = 1 / 30; t < ORBIT_END - 1 / 30; t += 1 / 30) assert.ok(speed(t) <= speed(t - 1 / 30) + 1e-9, 'eases out only');
  let prev = cameraAt(0);
  for (const t of frames.slice(1)) {
    const c = cameraAt(t), d = Math.hypot(...c.position.map((v, i) => v - prev.position[i]) as [number, number, number]);
    const reach = Math.hypot(...c.position.map((v, i) => v - c.target[i]) as [number, number, number]);
    assert.ok(d < 0.2 * reach + 1, `t ${t.toFixed(2)}: camera jumps ${d.toFixed(1)} m`);
    prev = c;
  }
});

test('framing: the whole model ≤ 960 px wide and inside the band in the orbit and the closing view, above the end card', () => {
  const corners = [BASE.x0, BASE.x1].flatMap(x => [BASE.z0, BASE.z1].flatMap(z => [[x, 0, z], [x, -BASE.h, z]] as [number, number, number][]));
  const tops = HILLS.map(h => [h.x, h.h, h.z] as [number, number, number]);
  for (const t of frames.filter(t => t <= CAM.keys[0].t || t >= END_AT)) {
    const ps = [...corners, ...tops].map(p => project(p, cameraAt(t)));
    const x0 = Math.min(...ps.map(p => p.x)), x1 = Math.max(...ps.map(p => p.x)), y0 = Math.min(...ps.map(p => p.y)), y1 = Math.max(...ps.map(p => p.y));
    assert.ok(x1 - x0 <= 960 && x0 >= 40 && x1 <= 1040, `t ${t.toFixed(2)}: model ${x0.toFixed(0)}–${x1.toFixed(0)}`);
    assert.ok(y0 >= BAND.top && y1 <= BAND.top + BAND.height, `t ${t.toFixed(2)}: model y ${y0.toFixed(0)}–${y1.toFixed(0)}`);
    if (t >= END_AT) assert.ok(y1 <= END_PANEL.top - 10, `t ${t.toFixed(2)}: model to ${y1.toFixed(0)} under the end card`);
  }
});

test('at each place its pin is up and inside the band, and the place itself is in the middle of the picture', () => {
  const centre: [number, number, number][] = [[0, 20, -90], [SQUADRON.x, 4, (SQUADRON.z + LAWN.z) / 2], [POOL.x, 0, POOL.z], [RING.x, 1, RING.z], [LAKE.x, 0, LAKE.z], [0, 0, -29]];
  for (const s of STOPS) for (const t of frames.filter(t => t >= s.settled && t < (STOPS[s.place + 1]?.go ?? MARCH_GO))) {
    const p = pinAt(s.place, t);
    assert.ok(p.alpha > 0.5, `t ${t.toFixed(2)}: pin ${s.place + 1} hidden`);
    assert.ok(p.y >= BAND.top + 40 && p.y <= 1600 && p.x >= 60 && p.x <= 1020, `t ${t.toFixed(2)}: pin ${s.place + 1} at ${p.x.toFixed(0)}, ${p.y.toFixed(0)}`);
    const c = project(centre[s.place], cameraAt(t));
    assert.ok(c.x > 200 && c.x < 880 && c.y > BAND.top + 150 && c.y < 1450, `t ${t.toFixed(2)}: ${PLACES[s.place].name} at ${c.x.toFixed(0)}, ${c.y.toFixed(0)}`);
  }
});

test('pins: one dark colour that stands out on grass and water; all six on frame 0; each pops in the opening and pulses on its visit (review B4)', () => {
  for (const ground of [GRASS, WATER]) assert.ok(contrast(PIN_COLOR, ground) >= 4.5, `pin on ${ground}`);
  PINS.forEach((_, i) => assert.ok(pinAt(i, 0).alpha > 0.5, `pin ${i + 1} on frame 0`));
  PINS.forEach((_, i) => assert.ok(popAt(i, 0.4 + 0.35 * i + 0.12) > 1.15, `pin ${i + 1} pops`));
  STOPS.forEach(s => { assert.ok(s.pulse > s.go && s.pulse < s.settled); assert.ok(popAt(s.place, s.pulse + 0.15) > 1.15, `pin ${s.place + 1} pulses on its visit`); });
  assert.ok(pinAt(5, MARCH_GO + 0.5).alpha < 0.05, 'pin 6 is gone in the low swing (review)');
  assert.ok(PINS.every((_, i) => pinAt(i, PULL + 0.5).alpha < 0.05), 'pins leave in the pull-back');
});

test('labels: the pill, the caption and the pins never overlap and stay on screen (pins may pass behind each other mid-orbit)', () => {
  for (const t of [...frames, COVER_T]) {
    const all = labelBoxes(t), readFrame = t === 0 || Math.abs(t - COVER_T) < 1e-9 || t >= ORBIT_END;
    const boxes = readFrame ? all : all.filter(b => !b.pin);
    for (const b of boxes) assert.ok(b.x0 >= 0 && b.x1 <= 1080 && b.y0 >= BAND.top && b.y1 <= 1600, `t ${t.toFixed(2)}: "${b.text}" off screen`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!overlap(boxes[i], boxes[j]), `t ${t.toFixed(2)}: "${boxes[i].text}" / "${boxes[j].text}"`);
  }
});

test('header dots: the place being visited is "now", earlier ones "done", later ones "next"', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(i => dotState(i, 0)), Array(6).fill('next'));
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(i => dotState(i, 11)), ['done', 'done', 'now', 'next', 'next', 'next']);
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(i => dotState(i, 23)), ['done', 'done', 'done', 'done', 'done', 'now']);
});

test('the route: drawn from 1 to 6 in the opening, then stays, fainter', () => {
  assert.ok(ROUTE.length >= 6);
  assert.equal(routeAt(0.4).shown, 0); assert.equal(routeAt(3.6).shown, 1);
  assert.ok(routeAt(2.0).shown > 0.2 && routeAt(2.0).shown < 0.8);
  assert.ok(routeAt(8).alpha < routeAt(3.6).alpha && routeAt(8).alpha > 0.2);
});

test('moving things at each place: PT in time, swimmers doing lengths, horses trotting round the ring', () => {
  const pt = ptAt(8.0);
  assert.equal(pt.length, 40, 'a squadron of 5 × 8');
  assert.ok(pt.every(f => Math.abs(f.x - LAWN.x) < LAWN.w / 2 && Math.abs(f.z - LAWN.z) < LAWN.d / 2), 'on its lawn');
  const ys = [8.0, 8.17, 8.33].map(t => ptAt(t)[0].y);
  assert.ok(Math.max(...ys) - Math.min(...ys) > 0.4, 'they jump');
  const sw = swimmersAt(11.5), sw2 = swimmersAt(12.5);
  assert.equal(sw.length, 4);
  sw.forEach((s, i) => {
    assert.ok(Math.abs(s.x - POOL.x) < POOL.w / 2 && Math.abs(s.z - POOL.z) < POOL.d / 2, 'in the pool');
    assert.ok(Math.abs(sw2[i].x - s.x) > 0.8, 'moving');
  });
  const hs = horsesAt(14.5), hs2 = horsesAt(15.0);
  assert.equal(hs.length, 3);
  hs.forEach((h, i) => {
    const r = ((h.x - RING.x) / RING.rx) ** 2 + ((h.z - RING.z) / RING.rz) ** 2;
    assert.ok(r > 0.4 && r < 1, 'inside the rail');
    assert.ok(Math.hypot(hs2[i].x - h.x, hs2[i].z - h.z) > 1, 'trotting');
  });
});

test('the size of things (storyboard § 9): a horse ≥ 60 px long and a swimmer ≥ 25 px at their stops', () => {
  const len = (p: [number, number, number], q: [number, number, number], t: number) => { const a = project(p, cameraAt(t)), b = project(q, cameraAt(t)); return Math.hypot(a.x - b.x, a.y - b.y); };
  const h = horsesAt(15.0)[0];
  const px = len([h.x - 1.6 * Math.sin(h.heading), 2, h.z - 1.6 * Math.cos(h.heading)], [h.x + 1.6 * Math.sin(h.heading), 2, h.z + 1.6 * Math.cos(h.heading)], 15.0);
  assert.ok(px >= 60, `a horse ${px.toFixed(0)} px`);
  const s = swimmersAt(12.0)[0], sp = len([s.x - 1.3, 0.3, s.z], [s.x + 1.3, 0.3, s.z], 12.0);
  assert.ok(sp >= 55, `a swimmer ${sp.toFixed(0)} px (panel, Colour: dashes)`);
});

test('the parade: blocks stand on the ground from frame 0 (review I3); only the passing-out course moves and crosses the line', () => {
  const all = BLOCKS.reduce((n, b) => n + b.rows * b.cols, 0);
  assert.equal(figuresAt(0).length, all, 'on the ground from frame 0');
  const course = (t: number) => figuresAt(t).filter(f => f.course), others = (t: number) => figuresAt(t).filter(f => !f.course);
  const a = others(GROUND_AT), b = others(DURATION - 0.1);
  a.forEach((f, i) => assert.ok(Math.abs(f.x - b[i].x) < 1e-9 && Math.abs(f.z - b[i].z) < 1e-9, 'the other blocks stand still'));
  for (const f of course(MARCH_GO)) assert.ok(f.z > LINE.z);
  const times = crossingTimes();
  assert.ok(times.length >= 4 && times[0] > CAPTIONS[6].t0 && times[times.length - 1] < CAPTIONS[6].t1, `crossings ${times.map(t => t.toFixed(2)).join(', ')} under the Antim Pag caption`);
  assert.ok(times[times.length - 1] - times[0] >= 1.6, 'rank by rank, slowly');
  for (const c of times) assert.ok(lineFlashAt(c + 0.02) > 0.8);
  assert.ok(LINE.width >= 2);
  for (const bl of BLOCKS) {
    const half = ((bl.cols - 1) * bl.dx) / 2 + 0.5;
    if (bl.course) assert.ok(Math.abs(bl.x) + half <= LINE.half); else assert.ok(Math.abs(bl.x) - half > LINE.half || bl.z > -40);
  }
});

test('jets (review B1): only after the last rank and its caption, three in a vee, big, all in frame together ≥ 0.5 s', () => {
  const last = Math.max(...crossingTimes()), j0 = CAPTIONS[6].t1;
  for (const t of frames) if (jetsAt(t).length) assert.ok(t >= j0 && t >= last && t < PULL, `jets at ${t.toFixed(2)}`);
  assert.ok(frames.some(t => jetsAt(t).length === 3));
  assert.equal(JET.smoke, false);
  let best = 0, ok = 0;
  for (const t of frames.filter(t => jetsAt(t).length)) {
    const cam = cameraAt(t), js = jetsAt(t), lead = js[0];
    const at = (k: number) => lead.pos.map((v, i) => v + k * (JET.span / 2) * lead.side[i]) as [number, number, number];
    const l = project(at(-1), cam), r = project(at(1), cam);
    if (l.depth > 0 && r.depth > 0 && l.y > BAND.top && l.y < BAND.top + BAND.height) best = Math.max(best, Math.hypot(r.x - l.x, r.y - l.y));
    const ps = js.map(j => project(j.pos, cam));
    const inside = ps.every(p => p.depth > 0 && p.x >= 60 && p.x <= 1020 && p.y >= BAND.top + 40 && p.y <= 1600);
    const apart = ps.every((a, i) => ps.every((b, k) => i === k || Math.hypot(a.x - b.x, a.y - b.y) >= 120));
    if (inside && apart) ok += 1 / 30;
  }
  assert.ok(best >= 270, `the lead jet ${best.toFixed(0)} px wide`);
  assert.ok(ok >= 0.5, `all three in frame and apart ${ok.toFixed(2)} s`);
});

test('no boat in the picture comes within 70 m of the camera (a near sail filled the frame), sails white', () => {
  for (const t of frames) for (const b of boatsAt(t)) {
    const cam = cameraAt(t), c = cam.position, p = project([b.x, 4, b.z], cam);
    const inPicture = p.depth > 0 && p.x > -100 && p.x < 1180 && p.y > BAND.top - 100 && p.y < BAND.top + BAND.height + 100;
    if (inPicture) assert.ok(Math.hypot(b.x - c[0], b.z - c[2]) >= 70, `t ${t.toFixed(2)}`);
  }
  assert.ok(boatsAt(0).every(b => b.sail === SAIL));
});

test('light: golden afternoon, then low and orange in the pull-back', () => {
  assert.ok(lightAt(5).elevation > 25 && lightAt(END_AT).elevation < 12);
  assert.ok(lightAt(PULL - 0.4).elevation - lightAt(PULL + 1.0).elevation > 15);
  assert.ok(lightAt(END_AT).warm > 0.95 && lightAt(5).warm === 0);
});

test('texts: the place names appear only from their visit; the hook in the header all along', () => {
  for (const t of frames) {
    const shown = textsAt(t);
    for (const l of HEADER) assert.ok(shown.includes(l));
    PILLS.forEach((p, i) => { if (shown.includes(p.text)) assert.ok(t >= STOPS[i].go, `${p.text} at ${t.toFixed(2)}`); });
  }
});

test('sound: a click per pin pop and visit; PT claps, splashes, hoofbeats each only at their place; rank taps; the roar after the march; music dips under it', () => {
  const at = (kind: string, a: number, b: number) => SOUND.hits.filter(h => h.kind === kind && h.t >= a && h.t < b);
  assert.ok(at('click', 0, ORBIT_END).length >= 6, 'six pops');
  for (const s of STOPS) assert.ok(SOUND.hits.some(h => h.kind === 'click' && Math.abs(h.t - s.pulse) < 0.02), `a click as ${PLACES[s.place].name} starts`);
  const taps = SOUND.hits.filter(h => h.kind === 'tap');
  const inStop = (i: number) => (h: { t: number }) => h.t >= STOPS[i].go && h.t < STOPS[i + 1].go;
  for (const i of [1, 2, 3, 4]) assert.ok(taps.filter(inStop(i)).length >= 3, `sounds at ${PLACES[i].name}`);
  for (const c of crossingTimes()) assert.ok(taps.some(h => Math.abs(h.t - c) < 0.02), `a tap as a rank crosses at ${c.toFixed(2)}`);
  const sorted = taps.map(h => h.t).sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i] - sorted[i - 1] >= 0.08 - 1e-9, `taps at ${sorted[i - 1].toFixed(2)} / ${sorted[i].toFixed(2)}`);
  const roar = SOUND.beds.find(b => b.kind === 'roar')!;
  assert.ok(roar.t0 >= CAPTIONS[6].t1 - 0.3 && roar.t1 <= DURATION, 'the roar after the march');
  const peak = frames.filter(t => t >= roar.t0 && t <= roar.t1).reduce((m, t) => (roar.level(t) > roar.level(m) ? t : m), roar.t0);
  assert.ok(SOUND.music!(peak) < 0.8 && SOUND.music!(5) === 1, 'the music dips under the jets');
  const ws = SOUND.hits.filter(h => h.kind.startsWith('whoosh'));
  const has = ws.map(w => w.kind + '@' + w.t.toFixed(2));
  for (const w of whooshesFor(CAM.start, CAM.keys)) assert.ok(has.includes(w.kind + '@' + w.t.toFixed(2)), `the camera's whoosh at ${w.t.toFixed(2)}`);
  for (const k of CAM.keys) if (k.dur > 0.9) assert.ok(!ws.some(w => w.t > k.t && w.t < k.t + k.dur - 0.2 && !jetsAt(w.t).length), `a whoosh in the slow move at ${k.t}`);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
});

test('panel fixes: the gold band reads by brightness too (a dark edge), PT jumps high, a sky only behind the jets', () => {
  assert.ok(contrast(ANTIM.edge, GRASS) >= 4.5 && contrast(ANTIM.edge, ANTIM.gold) >= 4.5, 'a dark edge between gold and grass (colour-blind safe)');
  const ys = Array.from({ length: 20 }, (_, k) => ptAt(8 + k / 30)[0].y);
  assert.ok(Math.max(...ys) >= 1.3, 'star jumps you can see');
  for (const t of frames) {
    if (jetsAt(t).length && t > 25.2 && t < PULL - 0.3) assert.ok(skyAt(t) > 0.9, `sky behind the jets at ${t.toFixed(2)}`);
    if (t < CAPTIONS[6].t1 || t > PULL + 0.6) assert.equal(skyAt(t), 0, `no sky at ${t.toFixed(2)}`);
  }
});

test('panel fixes (Sound): the jets the loudest stretch, the march heard, no flams, no marching over the lake, the bed fades out', () => {
  const taps = SOUND.hits.filter(h => h.kind === 'tap'), crossings = crossingTimes();
  const rankTaps = taps.filter(h => crossings.some(c => Math.abs(c - h.t) < 0.02));
  assert.ok(rankTaps.every(r => taps.every(h => h.gain <= r.gain)), 'the rank steps are the loudest taps');
  for (const c of crossings) assert.ok(SOUND.music!(c) <= 0.55, `the music dips ~6 dB under the step at ${c.toFixed(2)}`);
  const step = crossings[1] - crossings[0], march = taps.filter(h => h.t >= GROUND_AT);
  assert.ok(march.filter(h => h.t < crossings[0] - 0.01).length >= 3, 'marching time is heard on the ground (pass 2: it was missing)');
  for (const h of march) { const k = (h.t - crossings[0]) / step; assert.ok(Math.abs(k - Math.round(k)) * step < 0.02, `tap at ${h.t.toFixed(2)} off the step's beat`); }
  const shimmer = SOUND.hits.find(h => h.kind === 'shimmer')!;
  assert.ok(rankTaps.every(r => r.gain > shimmer.gain), 'the band shimmer quieter than the steps');
  assert.ok(!taps.some(h => h.t >= STOPS[4].settled + 1.5 && h.t < GROUND_AT - 0.2), 'no marching taps before the ground is on screen');
  const jets = SOUND.hits.filter(h => h.kind.startsWith('whoosh') && jetsAt(h.t).length).sort((a, b) => b.gain - a.gain).slice(0, 3);
  assert.equal(jets.length, 3, 'a pass per jet, while the jets are on screen');
  const rest = SOUND.hits.filter(h => !jets.includes(h));
  assert.ok(jets.every(j => rest.every(h => h.gain < j.gain)), 'the jets the loudest hits');
  assert.ok(SOUND.music!(26.1) <= 0.56, 'the music ducked ~5 dB under the jets');
  const dawn = SOUND.beds.find(b => b.kind === 'dawn')!;
  assert.ok(dawn.level(DURATION - 0.3) < 0.05, 'the bed fades out before the end');
});
