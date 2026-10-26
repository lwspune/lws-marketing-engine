import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, COVER_T, ORBIT_END, SUN_UP, MORPH, HOLD_END, GATE, WALK, STEPS, MUSIC_HITS, CAPTIONS, TITLE, QUESTION,
  STUDENT_Z, GATE_Z, GATE_H, DOME_Z, DOME_TOP, SIL_H, azimuthAt, sunElevation, domeShadowTip, shadowLength, morphAt,
  silhouetteAt, studentZAt, gateAngleAt, cameraAt, project, titleAlpha, captionBox, SOUND,
} from '../src/lib/story001.ts';

// @lws.pune · defence story 001 "ONE DAY": a student at Sudan Block's closed gate at dawn; the sun clears the dome, his
// shadow becomes a cadet's, the gate opens and he walks in. Storyboard (reviewed, F31): reels/nda-story-001-one-day.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;
const capEnd = (t: number) => [0, 0, studentZAt(t) + shadowLength(t)] as [number, number, number];

test('timing: 12 s; the sun at 4.8 and the finished shadow at 7.2 land on bar downbeats (100 BPM, 2.4 s a bar)', () => {
  assert.equal(DURATION, 12);
  assert.deepEqual(MUSIC_HITS, [SUN_UP, 7.2]);
  for (const h of MUSIC_HITS) assert.ok(Math.abs(h / 2.4 - Math.round(h / 2.4)) < 1e-9, `${h} is not a downbeat`);
  assert.ok(ORBIT_END <= 2.4 && SUN_UP < 5 && HOLD_END - (MORPH.t + MORPH.dur) >= 1, 'payoff by 7.2 s, held ≥ 1 s');
  assert.ok(Math.abs(MORPH.t + MORPH.dur - MUSIC_HITS[1]) < 1e-9, 'the cadet is complete on the second hit');
});

test('the orbit: a full turn ending front-on, already moving on frame 0 (F5, F22), never turning back', () => {
  assert.equal(azimuthAt(0), 0);
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9);
  assert.ok(azimuthAt(1 / 30) > 4 * DEG, `frame 1 has turned only ${(azimuthAt(1 / 30) / DEG).toFixed(1)}°`);
  for (const t of frames.slice(1)) assert.ok(azimuthAt(t) >= azimuthAt(t - 1 / 30));
});

test('the sun clears the dome exactly as the dome\'s shadow edge reaches his feet; then he stands in the light', () => {
  const feetLine = Math.atan(DOME_TOP / (STUDENT_Z - DOME_Z));
  assert.ok(Math.abs(sunElevation(SUN_UP) - feetLine) < 1e-9);
  assert.ok(Math.abs(domeShadowTip(SUN_UP) - STUDENT_Z) < 1e-6);
  assert.ok(domeShadowTip(4.0) > STUDENT_Z + 1, 'before 4.8 he is still in the dome\'s shadow');
  assert.ok(domeShadowTip(6.5) < STUDENT_Z - 12, 'by 6.5 s the shadow edge is well up the path');
  for (const t of frames.slice(1)) assert.ok(sunElevation(t) >= sunElevation(t - 1 / 30), 'the sun never sets');
  assert.ok(sunElevation(DURATION) <= 32.5 * DEG);
});

test('his shadow: height ÷ tan(sun); stretched under 2× once the cap shows, so the cadet reads', () => {
  for (const t of [MORPH.t, 7, 8.2]) assert.ok(Math.abs(shadowLength(t) - SIL_H / Math.tan(sunElevation(t))) < 1e-9);
  for (let t = MORPH.t + 0.3 * MORPH.dur; t <= HOLD_END; t += 0.1) {
    assert.ok(shadowLength(t) / SIL_H < 2, `${t.toFixed(1)}: stretched ${(shadowLength(t) / SIL_H).toFixed(2)}×`);
  }
});

test('the change: a student (bag, no cap, no rifle) at 0, a cadet (cap wider than the head, rifle above it, no bag) at 1', () => {
  const s = silhouetteAt(0), c = silhouetteAt(1);
  assert.ok(s.bag > 0.9 && s.cap < 0.05 && s.rifle < 0.05);
  assert.ok(c.bag < 0.05 && c.cap > 0.95 && c.rifle > 0.95);
  const top = (sh: ReturnType<typeof silhouetteAt>) => Math.max(...sh.parts.map(p => Math.max(p.a[1], p.b[1]) + p.r));
  const capPart = c.parts.find(p => p.id === 'cap')!, head = c.parts.find(p => p.id === 'head')!;
  assert.ok(Math.abs(capPart.a[0] - capPart.b[0]) + 2 * capPart.r > 2 * head.r * 1.15, 'the cap is wider than the head');
  assert.ok(top(c) > top(s) + 0.2, 'the rifle rises above everything');
  assert.ok(top(c) <= SIL_H + 1e-9 && top(s) <= SIL_H + 1e-9, 'the shadow texture holds both');
  assert.equal(morphAt(MORPH.t - 0.01), 0);
  assert.equal(morphAt(MORPH.t + MORPH.dur), 1);
  for (const t of frames.slice(1)) assert.ok(Math.abs(morphAt(t) - morphAt(t - 1 / 30)) < 0.06, `jump at ${t}`);
});

test('the gate opens before he reaches it, and he ends past it', () => {
  assert.equal(studentZAt(0), STUDENT_Z);
  assert.ok(studentZAt(DURATION) < GATE_Z - 0.5);
  for (const t of frames) if (studentZAt(t) < GATE_Z + 0.5) assert.ok(gateAngleAt(t) > 65 * DEG, `${t}: through the bars`);
  assert.equal(STEPS.length, 3);
  for (const s of STEPS) assert.ok(s >= WALK.t && s <= WALK.t + WALK.dur);
  assert.ok(GATE.t >= HOLD_END);
});

test('frames: the camera never jumps; it whips only in the crane', () => {
  for (const t of frames.slice(1)) {
    const a = cameraAt(t - 1 / 30).position, b = cameraAt(t).position, d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    assert.ok(d < (t <= ORBIT_END ? 40 : 4), `${t.toFixed(2)}: moved ${d.toFixed(1)} m in a frame`);
  }
});

test('gate view (cover): the dome above him, his head low in the frame, the 3:4 crop keeps both', () => {
  const cam = cameraAt(COVER_T), top = project([0, DOME_TOP, DOME_Z], cam), head = project([0, 1.75, STUDENT_Z], cam);
  assert.ok(top.y > 450 && top.y < 760, `dome top at y ${top.y.toFixed(0)}`);
  assert.ok(head.y > 1150 && head.y < 1600, `his head at y ${head.y.toFixed(0)}`);
  assert.ok(COVER_T < SUN_UP && morphAt(COVER_T) === 0, 'the cover doesn\'t show the twist');
});

test('shadow shot: from straight above, the shadow stands upright (cap at the top, his feet below), clear of the caption zone', () => {
  for (let t = MORPH.t; t <= HOLD_END; t += 1 / 30) {
    const cam = cameraAt(t), cap = project(capEnd(t), cam), feet = project([0, 0, studentZAt(t)], cam), head = project([0, 1.75, studentZAt(t)], cam);
    assert.ok(cap.y > 120 && cap.y < feet.y - 700, `${t.toFixed(2)}: cap y ${cap.y.toFixed(0)}, feet ${feet.y.toFixed(0)}`);
    assert.ok(feet.y < 1500 && head.y < 1540, `${t.toFixed(2)}: head y ${head.y.toFixed(0)}, feet ${feet.y.toFixed(0)}`);
    assert.ok(cap.depth > 0 && Math.abs(cap.x - 540) < 120);
    const fwd = [cam.target[0] - cam.position[0], cam.target[1] - cam.position[1], cam.target[2] - cam.position[2]];
    assert.ok(fwd[1] / Math.hypot(...fwd) < -0.99, `${t.toFixed(2)}: not looking straight down`);
    assert.ok(head.y > feet.y - 400, 'from above he is seen from the top (head near his feet), never face-on');
  }
});

test('the walk: he and the opening gate are in frame while he walks through it', () => {
  for (let t = WALK.t; t <= WALK.t + WALK.dur; t += 1 / 30) {
    const cam = cameraAt(t), head = project([0, 1.75, studentZAt(t)], cam), gateTop = project([0, GATE_H, GATE_Z], cam);
    assert.ok(head.y > 500 && head.y < 1500 && head.x > 150 && head.x < 930, `${t.toFixed(2)}: his head at ${head.x.toFixed(0)}, ${head.y.toFixed(0)}`);
    assert.ok(gateTop.y > 0 && gateTop.y < 1500, `${t.toFixed(2)}: gate top y ${gateTop.y.toFixed(0)}`);
  }
});

test('title: up only at the start and the end, and then the dome\'s finial is below it (y > 460) and in frame', () => {
  for (const t of frames) {
    if (titleAlpha(t) < 0.01) continue;
    assert.ok(t <= ORBIT_END + 0.3 || t >= 9.6, `title at ${t}`);
    const fin = project([0, DOME_TOP, DOME_Z], cameraAt(t));
    assert.ok(fin.y > TITLE.y1 + 50 && fin.y < 1300, `${t.toFixed(2)}: finial y ${fin.y.toFixed(0)}`);
  }
  assert.ok(titleAlpha(0) > 0.99 && titleAlpha(DURATION - 0.1) > 0.99);
});

test('captions: one at a time, inside the frame, under the picture; none while the shadow is in the lower frame', () => {
  for (const t of frames) {
    const on = CAPTIONS.filter(c => t >= c.t0 && t < c.t1);
    assert.ok(on.length <= 1, `${t}: two captions`);
    if (on.length) {
      const b = captionBox(on[0].text);
      assert.ok(b.x0 >= 40 && b.x1 <= 1040 && b.y0 >= 1540 && b.y1 <= 1680, on[0].text);
      assert.ok(t < SUN_UP || t >= GATE.t, `${t}: a caption over the shadow`);
    }
  }
  assert.ok(QUESTION.t0 >= 10 && QUESTION.text.includes('?'));
});

test('sound: the boom on the sun, a shimmer as the shadow changes, the clang on the gate, a step per step, dawn air', () => {
  const at = (kind: string, t: number) => SOUND.hits.some(h => h.kind === kind && Math.abs(h.t - t) < 0.05);
  assert.ok(at('boom', SUN_UP) && at('shimmer', MORPH.t) && at('clang', GATE.t));
  for (const s of STEPS) assert.ok(at('tap', s), `no footstep at ${s}`);
  assert.ok(SOUND.beds.some(b => b.kind === 'dawn' && b.t0 === 0 && b.t1 >= DURATION - 0.01));
  assert.equal(SOUND.duration, DURATION);
});
