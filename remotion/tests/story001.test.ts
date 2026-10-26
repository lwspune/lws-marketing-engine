import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, COVER_T, GATE_VIEW_T, COVER_TITLE, ORBIT_END, SUN_UP, CRANE, MORPH, HOLD_END, TURN_BACK, GATE, WALK, STEPS,
  MUSIC_HITS, CAPTIONS, TITLE, QUESTION, STUDENT_Z, GATE_Z, GATE_H, BAY, DOME_Z, DOME_TOP, SIL_H, azimuthAt, sunElevation,
  domeShadowTip, shadowLength, morphAt, silhouetteAt, studentZAt, gateAngleAt, headLiftAt, cameraAt, project, titleAlpha,
  captionBox, SOUND,
} from '../src/lib/story001.ts';

// @lws.pune · defence story 001 "ONE DAY": a student at Sudan Block's closed gate at dawn; the sun clears the dome, his
// shadow becomes a cadet's, the gate opens and he walks in. Storyboard (reviewed, F31): reels/nda-story-001-one-day.storyboard.md.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const DEG = Math.PI / 180;
const capEnd = (t: number) => [0, 0, studentZAt(t) + shadowLength(t)] as [number, number, number];
const look = (t: number) => { const c = cameraAt(t), f = [c.target[0] - c.position[0], c.target[1] - c.position[1], c.target[2] - c.position[2]], n = Math.hypot(...f); return { c, down: -f[1] / n, back: f[2] / n }; };

test('timing: 12 s; the sun at 4.8 and the finished shadow at 7.2 land on bar downbeats (100 BPM, 2.4 s a bar)', () => {
  assert.equal(DURATION, 12);
  assert.deepEqual(MUSIC_HITS, [SUN_UP, 7.2]);
  for (const h of MUSIC_HITS) assert.ok(Math.abs(h / 2.4 - Math.round(h / 2.4)) < 1e-9, `${h} is not a downbeat`);
  assert.ok(ORBIT_END <= 2.4 && SUN_UP < 5 && HOLD_END - (MORPH.t + MORPH.dur) >= 0.5, 'payoff by 7.2 s, held ≥ 0.5 s');
  assert.ok(Math.abs(MORPH.t + MORPH.dur - MUSIC_HITS[1]) < 1e-9, 'the cadet is complete on the second hit');
});

test('the orbit: a full turn ending front-on, already moving on frame 0 (F5, F22), never turning back', () => {
  assert.equal(azimuthAt(0), 0);
  assert.ok(Math.abs(azimuthAt(ORBIT_END) - 2 * Math.PI) < 1e-9);
  assert.ok(azimuthAt(1 / 30) > 4 * DEG, `frame 1 has turned only ${(azimuthAt(1 / 30) / DEG).toFixed(1)}°`);
  for (const t of frames.slice(1)) assert.ok(azimuthAt(t) >= azimuthAt(t - 1 / 30));
});

test('the orbit (both critics: no edge of the world, no dome on dark ground): the dome and drum stand above the horizon', () => {
  for (let t = 0; t <= ORBIT_END; t += 0.1) {
    const cam = cameraAt(t), f = [cam.target[0] - cam.position[0], cam.target[2] - cam.position[2]], n = Math.hypot(f[0], f[1]);
    const horizon = project([cam.position[0] + (f[0] / n) * 3000, 0, cam.position[2] + (f[1] / n) * 3000], cam), drum = project([0, BAY.h, DOME_Z], cam);
    assert.ok(horizon.y > drum.y + 20, `${t.toFixed(1)}: horizon y ${horizon.y.toFixed(0)}, drum base y ${drum.y.toFixed(0)}`);
  }
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
  for (const t of [MORPH.t, 7, HOLD_END]) assert.ok(Math.abs(shadowLength(t) - SIL_H / Math.tan(sunElevation(t))) < 1e-9);
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
  for (const t of frames.slice(1)) assert.ok(Math.abs(morphAt(t) - morphAt(t - 1 / 30)) < 0.07, `jump at ${t}`);
});

test('the gate opens in view (Motion critic), before he reaches it, and he ends past it', () => {
  assert.equal(studentZAt(0), STUDENT_Z);
  assert.ok(studentZAt(WALK.t + WALK.dur) < GATE_Z - 0.5);
  for (const t of frames) if (studentZAt(t) < GATE_Z + 0.5) assert.ok(gateAngleAt(t) > 65 * DEG, `${t}: through the bars`);
  assert.ok(GATE.t >= TURN_BACK.t + TURN_BACK.dur - 1e-9, 'the camera has turned back before the gate moves');
  for (let t = GATE.t; t <= GATE.t + GATE.dur; t += 1 / 30) {
    const { c, down } = look(t), top = project([1.0, GATE_H, GATE_Z], c);
    assert.ok(down < 0.6 && top.y > 0 && top.y < 1500 && top.x > 0 && top.x < 1080, `${t.toFixed(2)}: the gate isn't in view`);
  }
  for (const s of STEPS) assert.ok(s >= WALK.t && s <= WALK.t + WALK.dur);
  assert.ok(headLiftAt(4.6) > 0.4, 'the head lift can be seen');
});

test('the crane rises before it looks down, and turns slowly, only once looking down', () => {
  assert.ok(CRANE.dur >= 1.2);
  let turnStart = Infinity, turnEnd = -Infinity;
  for (let t = CRANE.t; t <= CRANE.t + CRANE.dur; t += 1 / 30) {
    const { c, down, back } = look(t);
    if (down > 0.5) assert.ok(c.position[1] > 5, `${t.toFixed(2)}: looking down from only ${c.position[1].toFixed(1)} m`);
    if (back > 0.05) assert.ok(down > 0.95, `${t.toFixed(2)}: turned before looking down`);
    const yaw = Math.atan2(c.target[0] - c.position[0], -(c.target[2] - c.position[2]));
    if (down > 0.95 && Math.abs(yaw) > 1 * DEG && Math.abs(yaw) < 179 * DEG) { turnStart = Math.min(turnStart, t); turnEnd = Math.max(turnEnd, t); }
  }
  assert.ok(turnEnd - turnStart >= 0.7, `the 180° spin takes only ${(turnEnd - turnStart).toFixed(2)} s`);
});

test('frames: the camera never jumps', () => {
  for (const t of frames.slice(1)) {
    const a = cameraAt(t - 1 / 30).position, b = cameraAt(t).position, d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    assert.ok(d < (t <= ORBIT_END ? 40 : 4), `${t.toFixed(2)}: moved ${d.toFixed(1)} m in a frame`);
  }
});

test('gate view: the dome above him, his head low in the frame', () => {
  const cam = cameraAt(GATE_VIEW_T), top = project([0, DOME_TOP, DOME_Z], cam), head = project([0, 1.75, STUDENT_Z], cam);
  assert.ok(top.y > 450 && top.y < 760, `dome top at y ${top.y.toFixed(0)}`);
  assert.ok(head.y > 1150 && head.y < 1600, `his head at y ${head.y.toFixed(0)}`);
});

test('cover (both critics: the strongest image): the finished cadet shadow, its title clear of him and inside the 3:4 crop', () => {
  assert.ok(morphAt(COVER_T) === 1 && COVER_T < HOLD_END);
  const cam = cameraAt(COVER_T), feet = project([0, 0, studentZAt(COVER_T)], cam), head = project([0, 1.75, studentZAt(COVER_T)], cam), cap = project(capEnd(COVER_T), cam);
  assert.ok(COVER_TITLE.y0 > Math.max(feet.y, head.y) + 60, `title at ${COVER_TITLE.y0}, his feet ${feet.y.toFixed(0)}, head ${head.y.toFixed(0)}`);
  assert.ok(COVER_TITLE.y1 < 1680 && cap.y > 240, 'title and cap inside the 3:4 crop');
});

test('shadow shot: from straight above, the shadow stands upright (cap at the top, his feet below), clear of the words', () => {
  for (let t = MORPH.t + 0.2; t <= HOLD_END; t += 1 / 30) {
    const cam = cameraAt(t), cap = project(capEnd(t), cam), feet = project([0, 0, studentZAt(t)], cam), head = project([0, 1.75, studentZAt(t)], cam);
    assert.ok(cap.y > 120 && cap.y < feet.y - 700, `${t.toFixed(2)}: cap y ${cap.y.toFixed(0)}, feet ${feet.y.toFixed(0)}`);
    assert.ok(feet.y < 1500 && head.y < 1540, `${t.toFixed(2)}: head y ${head.y.toFixed(0)}, feet ${feet.y.toFixed(0)}`);
    assert.ok(cap.depth > 0 && Math.abs(cap.x - 540) < 120);
    assert.ok(look(t).down > 0.99, `${t.toFixed(2)}: not looking straight down`);
    assert.ok(head.y > feet.y - 400, 'from above he is seen from the top (head near his feet), never face-on');
  }
});

test('the walk: he and the open gate are in frame while he walks through it', () => {
  for (let t = WALK.t; t <= WALK.t + WALK.dur; t += 1 / 30) {
    const cam = cameraAt(t), head = project([0, 1.75, studentZAt(t)], cam), gateTop = project([0, GATE_H, GATE_Z], cam);
    assert.ok(head.y > 500 && head.y < 1500 && head.x > 150 && head.x < 930, `${t.toFixed(2)}: his head at ${head.x.toFixed(0)}, ${head.y.toFixed(0)}`);
    assert.ok(gateTop.y > 0 && gateTop.y < 1500, `${t.toFixed(2)}: gate top y ${gateTop.y.toFixed(0)}`);
  }
});

test('title: up only at the start and the end, and then the dome\'s finial is below it (y > 460) and in frame', () => {
  for (const t of frames) {
    if (titleAlpha(t) < 0.01) continue;
    assert.ok(t <= ORBIT_END + 0.6 || t >= 9.6, `title at ${t}`);
    const fin = project([0, DOME_TOP, DOME_Z], cameraAt(t));
    assert.ok(fin.y > TITLE.y1 + 50 && fin.y < 1300, `${t.toFixed(2)}: finial y ${fin.y.toFixed(0)}`);
  }
  assert.ok(titleAlpha(0) > 0.99 && titleAlpha(DURATION - 0.1) > 0.99);
});

test('words (both critics: not on his shirt): story lines in the top band while the title is down; the question big, mid-low', () => {
  for (const t of frames) {
    const on = CAPTIONS.filter(c => t >= c.t0 && t < c.t1);
    assert.ok(on.length <= 1, `${t}: two captions`);
    for (const c of on) {
      const b = captionBox(c);
      assert.ok(b.x0 >= 40 && b.x1 <= 1040, c.text);
      if (c === QUESTION) assert.ok(b.y0 >= 1250 && b.y1 <= 1560 && b.size >= 72, 'the question');
      else {
        assert.ok(b.y0 >= TITLE.y0 - 20 && b.y1 <= TITLE.y1 + 20, c.text);
        assert.ok(titleAlpha(t) < 0.01, `${t}: a line on the title`);
        const head = project([0, 1.75, studentZAt(t)], cameraAt(t));
        assert.ok(head.depth < 0 || head.y > b.y1 + 100, `${t}: a line on his head`);
      }
      assert.ok(t < SUN_UP || t >= GATE.t, `${t}: a caption over the sunrise or the shadow`);
    }
  }
  assert.ok(QUESTION.t0 <= 10.5 && QUESTION.text.includes('?'));
});

test('sound: the boom on the sun, a shimmer as the shadow changes, the clang on the gate, a step per step, dawn air', () => {
  const at = (kind: string, t: number) => SOUND.hits.some(h => h.kind === kind && Math.abs(h.t - t) < 0.05);
  assert.ok(at('boom', SUN_UP) && at('shimmer', MORPH.t) && at('clang', GATE.t));
  for (const s of STEPS) assert.ok(at('tap', s), `no footstep at ${s}`);
  assert.ok(SOUND.beds.some(b => b.kind === 'dawn' && b.t0 === 0 && b.t1 >= DURATION - 0.01));
  assert.equal(SOUND.duration, DURATION);
});
