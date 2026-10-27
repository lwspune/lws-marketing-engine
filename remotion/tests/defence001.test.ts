import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, ANSWER_AT, ORBIT_END, COVER_T, END_AT, OPTIONS, ANSWER, RANKS, FIELD_MARSHAL, OPENING, rankTimes, FM_AT, TRAP,
  CLEAR, badgesAt, stateAt, STRAP, badgeExtent, CAPTIONS, MUSIC_HITS, SOUND, cameraAt, azimuthAt, ZOOM, project, BAND,
  strapCorners, ladderAt, rankNameAt, labelBoxes, captionBox, COLORS, CAPTION_Y, type BadgeKind,
} from '../src/lib/defence001.ts';
import { tween } from '../src/lib/motion.ts';
import { whooshesFor } from '../src/lib/sfx.ts';
import { contrast } from '../src/lib/paint.ts';
import { WHITE } from '../src/lib/palette.ts';

// @lws.pune · defence #1 (3D, predict-first): Indian Army officer ranks on a shoulder strap. Frame 0 wears the
// Brigadier's badge (B); the trap is Colonel (one star fewer); then the climb Lieutenant → General and the Field Marshal.
// Storyboard (independently reviewed, F31): reels/nda-defence-001-army-ranks.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const count = (kinds: BadgeKind[], k: BadgeKind) => kinds.filter(x => x === k).length;
const kindsOf = (r: { badges: Record<string, { kind: BadgeKind }> }) => Object.values(r.badges).map(b => b.kind);

test('the ranks, in order, each with the badge checked against its picture (storyboard § 8)', () => {
  assert.deepEqual(RANKS.map(r => r.name), ['Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 'Colonel', 'Brigadier',
    'Major General', 'Lieutenant General', 'General']);
  const expect: [number, number, number][] = [   // stars, emblems, sword-and-baton
    [2, 0, 0], [3, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [3, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1],
  ];
  RANKS.forEach((r, i) => {
    const k = kindsOf(r);
    assert.deepEqual([count(k, 'star'), count(k, 'emblem'), count(k, 'swordBaton')], expect[i], r.name);
    assert.equal(k.length, expect[i].reduce((a, b) => a + b), `${r.name}: nothing else on it`);
  });
  // the field marshal: the emblem over two crossed batons in a wreath (Commons, corrected 2024 from Manekshaw's uniform)
  assert.deepEqual(kindsOf(FIELD_MARSHAL).sort(), ['batonsWreath', 'emblem']);
});

test('badge layout: stars and Colonel in a column; Brigadier one star then two side by side; emblem on top; all on the strap', () => {
  for (const name of ['Lieutenant', 'Captain', 'Colonel']) {
    const r = RANKS.find(x => x.name === name)!;
    for (const b of Object.values(r.badges)) assert.equal(b.x, 0, `${name}: a column`);
  }
  const brig = RANKS[5], stars = Object.values(brig.badges).filter(b => b.kind === 'star').sort((a, b) => b.y - a.y);
  assert.equal(stars[0].x, 0);
  assert.equal(stars[1].y, stars[2].y);
  assert.ok(stars[1].y < stars[0].y && stars[1].x === -stars[2].x && stars[1].x !== 0, 'two side by side, below the first');
  for (const r of [...RANKS, FIELD_MARSHAL]) {
    const bs = Object.values(r.badges), top = Math.max(...bs.map(b => b.y));
    const e = bs.find(b => b.kind === 'emblem');
    if (e) assert.equal(e.y, top, `${r.name}: the emblem is the top badge`);
    for (const b of bs) {
      const [hw, hh] = badgeExtent(b.kind);
      assert.ok(Math.abs(b.x) + hw <= STRAP.w / 2 - 0.04, `${r.name} ${b.kind}: inside the strap's width`);
      assert.ok(b.y - hh >= -STRAP.len / 2 + 0.08 && b.y + hh <= STRAP.button.y - STRAP.button.r - 0.04, `${r.name} ${b.kind}: below the button`);
    }
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const [a, b] = [bs[i], bs[j]], [aw, ah] = badgeExtent(a.kind), [bw, bh] = badgeExtent(b.kind);
      assert.ok(Math.abs(a.x - b.x) >= aw + bw - 0.02 || Math.abs(a.y - b.y) >= ah + bh - 0.02, `${r.name}: ${a.kind} and ${b.kind} overlap`);
    }
  }
});

test('the question: frame 0 wears the Brigadier\'s badge; B Brigadier; the trap is Colonel, one star fewer', () => {
  assert.deepEqual(OPTIONS.map(o => o.replace(/\s+/g, ' ')), ['A Colonel', 'B Brigadier', 'C Major Gen']);
  assert.equal(ANSWER, 1);
  const same = (a: Record<string, { kind: BadgeKind; x: number; y: number }>, b: typeof a) =>
    Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([id, v]) => b[id] && b[id].kind === v.kind && b[id].x === v.x && b[id].y === v.y);
  assert.ok(same(OPENING, RANKS[5].badges), 'frame 0 = Brigadier');
  assert.ok(same(stateAt(TRAP.t + TRAP.dur + 0.01), RANKS[4].badges), 'after the trap beat: Colonel');
  for (const t of [0, 1, 2.9, ANSWER_AT - 0.01]) assert.ok(same(stateAt(t), RANKS[5].badges));
});

test('timeline: answer at the end of the orbit, 9 ranks 1.1 s apart from 6.0, the field marshal held, ≤ 25 s', () => {
  assert.equal(ORBIT_END, 3.0); assert.equal(ANSWER_AT, ORBIT_END);
  assert.deepEqual(rankTimes.map(t => +t.toFixed(2)), [6.0, 7.1, 8.2, 9.3, 10.4, 11.5, 12.6, 13.7, 14.8]);
  assert.ok(FM_AT > rankTimes[8] + 1 && END_AT - FM_AT >= 2.3, 'the field marshal held ≥ 2.3 s');
  assert.ok(DURATION <= 25 && DURATION - END_AT >= 2);
  assert.ok(CLEAR.t > TRAP.t + TRAP.dur - 0.01 && CLEAR.t + CLEAR.dur <= rankTimes[0]);
  // after each rank's change has settled the strap wears exactly that rank's badges
  RANKS.forEach((r, i) => {
    const end = (rankTimes[i + 1] ?? FM_AT) - 0.01, bs = badgesAt(end).filter(b => b.alpha > 0.99);
    assert.equal(bs.length, Object.keys(r.badges).length, r.name);
    for (const b of bs) {
      const want = r.badges[b.id];
      assert.ok(want && Math.abs(b.x - want.x) < 1e-6 && Math.abs(b.y - want.y) < 1e-6 && Math.abs(b.z) < 1e-6, `${r.name}: ${b.id} settled`);
    }
  });
  assert.equal(badgesAt(CLEAR.t + CLEAR.dur).filter(b => b.alpha > 0.01).length, 0, 'the strap is cleared before the climb');
});

test('frame 0 moves; the cover is before the answer and shows the Brigadier\'s badge', () => {
  assert.ok(COVER_T < ANSWER_AT - 0.2);
  for (let i = 1; i < 90; i++) assert.ok(azimuthAt(i / 30) > azimuthAt((i - 1) / 30), `still at frame ${i}`);
  assert.equal(badgesAt(COVER_T).filter(b => b.alpha > 0.99).length, 4);
});

test('camera: one full orbit from frame 0, slow at the front and fast behind, front-on by 3 s; smooth; 2 zooms in, 2 out', () => {
  assert.equal(azimuthAt(0), 0);
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9);
  assert.equal(azimuthAt(ORBIT_END + 1), 2 * Math.PI);
  const speed = (t: number) => (azimuthAt(t + 1 / 30) - azimuthAt(t)) * 30;
  assert.ok(speed(1.4) > 3 * speed(0.05), 'fast through the back half');
  let prev = cameraAt(0).position;
  for (const t of frames.slice(1)) {
    const p = cameraAt(t).position, d = Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
    assert.ok(d < 0.85, `jump at ${t.toFixed(2)}: ${d}`);
    prev = p;
  }
  let z = ZOOM.start[0], ins = 0, outs = 0;
  for (const k of ZOOM.keys) { if (k.to[0] > z) ins++; else if (k.to[0] < z) outs++; z = k.to[0]; }
  assert.ok(ins >= 2 && outs >= 1);
  const punch = ZOOM.keys.find(k => k.to[0] > 1.2)!;
  assert.ok(Math.abs(punch.t - ANSWER_AT) < 0.05 && punch.dur <= 0.5, 'a punch-in on the answer');
});

test('framing: the strap inside the band at every camera (button below 470, bottom above 1500); right of the ladder in the climb', () => {
  for (const t of frames.filter(t => t < END_AT)) {
    const cam = cameraAt(t), ps = strapCorners().map(p => project(p, cam));
    const top = Math.min(...ps.map(p => p.y)), bottom = Math.max(...ps.map(p => p.y));
    assert.ok(top >= BAND.top + 8 && bottom <= BAND.top + BAND.height - 8, `t ${t.toFixed(2)}: strap ${top.toFixed(0)}–${bottom.toFixed(0)}`);
    if (t >= CLEAR.t + CLEAR.dur) assert.ok(Math.min(...ps.map(p => p.x)) >= 500, `t ${t.toFixed(2)}: strap over the ladder`);
    if (t <= ORBIT_END + 0.4 || t >= CLEAR.t + CLEAR.dur) for (const p of ps) assert.ok(p.x >= 16 && p.x <= 1064);
  }
  // star size on a phone: ≥ 80 px across at the front
  const cam = cameraAt(ORBIT_END - 0.001), a = project([-0.13, 0, STRAP.t / 2], cam), b = project([0.13, 0, STRAP.t / 2], cam);
  assert.ok(b.x - a.x >= 80, `a star is ${(b.x - a.x).toFixed(0)} px`);
});

test('labels: the ladder, the big rank name and the captions never overlap each other or the strap, and stay on screen', () => {
  for (const t of frames.filter(t => t >= CLEAR.t && t < END_AT)) {
    const boxes = labelBoxes(t), cam = cameraAt(t), ps = strapCorners().map(p => project(p, cam));
    const strap = { x0: Math.min(...ps.map(p => p.x)), x1: Math.max(...ps.map(p => p.x)), y0: Math.min(...ps.map(p => p.y)), y1: Math.max(...ps.map(p => p.y)) };
    for (const b of boxes) {
      assert.ok(b.x0 >= 16 && b.x1 <= 1064 && b.y0 >= 440 && b.y1 <= 1680, `t ${t.toFixed(2)}: "${b.text}" off screen`);
      const hit = b.x0 < strap.x1 && strap.x0 < b.x1 && b.y0 < strap.y1 && strap.y0 < b.y1;
      assert.ok(!hit, `t ${t.toFixed(2)}: "${b.text}" over the strap`);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [a, b] = [boxes[i], boxes[j]];
      assert.ok(!(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1), `t ${t.toFixed(2)}: "${a.text}" / "${b.text}"`);
    }
  }
  assert.equal(ladderAt(CLEAR.t - 0.01).length, 0, 'no ladder in the opening');
  const lad = ladderAt(rankTimes[3] + 0.5);
  assert.equal(lad.length, 9);
  assert.deepEqual(lad.map(r => r.state), ['done', 'done', 'done', 'lit', 'next', 'next', 'next', 'next', 'next']);
  assert.ok(lad[0].y > lad[8].y, 'climbing: Lieutenant at the bottom');
  assert.equal(ladderAt(FM_AT + 0.5).length, 10);
  assert.equal(rankNameAt(rankTimes[6] + 0.5)?.text, 'Major General');
  assert.equal(rankNameAt(FM_AT + 0.5)?.text, 'Field Marshal');
  assert.equal(rankNameAt(rankTimes[0] - 0.1), null);
});

test('captions: ≤ 7 words, ≤ 36 characters, in order, inside the frame; no claim that General is "only one"', () => {
  let prev = 0;
  for (const c of CAPTIONS) {
    assert.ok(c.text.split(/\s+/).filter(w => /\w/.test(w)).length <= 7, c.text);
    assert.ok([...c.text].length <= 36, c.text);
    assert.ok(c.t0 >= prev && c.t1 > c.t0); prev = c.t1;
    const b = captionBox(c);
    assert.ok(b.x0 >= 40 && b.x1 <= 1040 && Math.abs((c.y ?? CAPTION_Y) - CAPTION_Y) < 1e-9);
    assert.ok(!/only one/i.test(c.text));
  }
  assert.ok(CAPTIONS.some(c => /Manekshaw/.test(c.text) && /1973/.test(c.text) && /Cariappa/.test(c.text) && /1986/.test(c.text)));
});

test('colours: the lit rank stands out (≥ 3:1 on the board) and is told apart by weight and a marker, not colour alone', () => {
  assert.ok(contrast(COLORS.lit, WHITE.board) >= 3);
  assert.ok(contrast(WHITE.ink, WHITE.board) >= 7);
  const lad = ladderAt(rankTimes[2] + 0.5), lit = lad.find(r => r.state === 'lit')!, done = lad.find(r => r.state === 'done')!;
  assert.ok(lit.weight > done.weight && lit.marker && !done.marker);
});

test('sound: a tink as each badge lands, a thunk on the answer, a clank as badges come off, whooshes on fast zooms', () => {
  const tinks = SOUND.hits.filter(h => h.kind === 'clang' && (h.pitch ?? 1) >= 1.5).map(h => h.t);
  const landings: number[] = [];
  for (const t of frames) for (const b of badgesAt(t)) if (b.landed && b.landed > t - 1 / 30 && b.landed <= t) landings.push(b.landed);
  for (const l of new Set(landings)) assert.ok(tinks.some(t => Math.abs(t - l) < 0.02), `no tink at ${l.toFixed(2)}`);
  assert.ok(SOUND.hits.some(h => h.kind === 'thunk' && Math.abs(h.t - ANSWER_AT) < 0.02));
  for (const t of [CLEAR.t, rankTimes[2], rankTimes[6], FM_AT]) assert.ok(SOUND.hits.some(h => h.kind === 'clang' && (h.pitch ?? 1) < 1.2 && Math.abs(h.t - t) < 0.05), `clank at ${t}`);
  for (const w of whooshesFor(ZOOM.start, ZOOM.keys)) assert.ok(SOUND.hits.some(h => h.kind === w.kind && Math.abs(h.t - w.t) < 1e-9));
  assert.deepEqual(MUSIC_HITS, [ANSWER_AT, rankTimes[8]]);
  assert.ok(SOUND.hits.every(h => h.t >= 0 && h.t < DURATION));
  void tween;
});
