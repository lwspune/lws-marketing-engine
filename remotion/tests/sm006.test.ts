import test from 'node:test';
import assert from 'node:assert/strict';
import { SAFE, TEXT_BOXES } from '../src/lib/meStory.ts';
import {
  DURATION, HOOK, LINE2, ZOOM, MUSIC, MIRROR, NOTE, NOTE_FONT, CHAR_W, NOTES, noteAt, noteLines, clothAt, CLOTH_REST,
  FLOWERS, flowerAt, smileAt, sunAt, sparkleAt, textAlpha, zoomAt,
} from '../src/lib/sm006.ts';

// @soundmindwithshivani reel #6, "the mirror": "Your body is not a project to fix." ME sits beside a standing mirror that
// shows her reflection. Sticky notes slap onto the glass (FIX THIS, HIDE THAT…); ME's cloth wipes each one off and it
// flutters to the grass. Close-up. "It's the home you live in." A second wave of notes is wiped, and a flower grows on the
// mirror's frame for each. Ending: flowers all round the frame, the reflection and ME smile, the glass sparkles, the sun.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });
const noteBox = (x: number, y: number): Box => ({ x0: x - NOTE.w / 2, y0: y - NOTE.h / 2, x1: x + NOTE.w / 2, y1: y + NOTE.h / 2 });
const firstWave = NOTES.filter(n => n.t0 < ZOOM.t0), secondWave = NOTES.filter(n => n.t0 > ZOOM.t1);
const ORDER = ['wait', 'slap', 'stuck', 'wipe', 'fall', 'gone'];

test('20–30 s long; the message is fully on screen at frame 0; nothing written over the close-up', () => {
  assert.ok(DURATION >= 20 && DURATION <= 30);
  assert.equal(textAlpha(HOOK, 0), 1);
  assert.match(HOOK.text, /body/);
  assert.ok(HOOK.t1 <= ZOOM.t0 && LINE2.t0 >= ZOOM.t1);
  assert.ok(textAlpha(LINE2, LINE2.t0 + 0.5) > 0.9);
});

test('the notes are short, in capitals, in two waves (five, then three), and every word fits on its note', () => {
  assert.equal(firstWave.length, 5);
  assert.equal(secondWave.length, 3);
  for (const n of NOTES) {
    assert.ok(n.label.split(/\s+/).length <= 5, n.label);
    assert.equal(n.label, n.label.toUpperCase());
    const lines = noteLines(n.label);
    assert.ok(lines.length <= 2, `${n.label} needs more than two lines`);
    assert.equal(lines.join(' '), n.label);
    for (const l of lines) assert.ok(l.length * CHAR_W <= NOTE.w - 24, `"${l}" is too wide for the note`);
    assert.ok(lines.length * NOTE_FONT * 1.15 <= NOTE.h - 20, `${n.label} too tall for the note`);
  }
  for (const n of firstWave) assert.equal(noteAt(n, ZOOM.t0).phase, 'gone', `${n.label} still there in the close-up`);
  for (const n of NOTES) assert.equal(noteAt(n, DURATION - 3).phase, 'gone', n.label);
});

test('a note sticks on the glass, clear of the text and of the other note up at the same time', () => {
  for (const n of NOTES) {
    const dx = (n.x - MIRROR.x) / MIRROR.rx, dy = (n.y - MIRROR.y) / MIRROR.ry;
    assert.ok(dx * dx + dy * dy < 0.5, `${n.label} isn't on the glass`);
    const b = noteBox(n.x, n.y);
    assert.ok(b.x1 <= SAFE.right && b.x0 >= SAFE.left, `${n.label} under Instagram's buttons`);
    for (const box of TEXT_BOXES) assert.ok(!overlaps(b, asBox(box)), `${n.label} under the ${box.id} text`);
  }
  for (const t of frames) {
    const stuck = NOTES.filter(n => ['slap', 'stuck', 'wipe'].includes(noteAt(n, t).phase));
    for (let i = 0; i < stuck.length; i++) for (let j = i + 1; j < stuck.length; j++)
      assert.ok(!overlaps(noteBox(stuck[i].x, stuck[i].y), noteBox(stuck[j].x, stuck[j].y)), `${stuck[i].label} and ${stuck[j].label} overlap at ${t.toFixed(2)} s`);
  }
});

test('each note slaps on, stays long enough to read, is wiped, then flutters down to the grass', () => {
  for (const n of NOTES) {
    const phases = frames.map(t => noteAt(n, t).phase);
    for (let i = 1; i < phases.length; i++) assert.ok(ORDER.indexOf(phases[i]) >= ORDER.indexOf(phases[i - 1]), `${n.label} goes back a phase`);
    const readable = frames.filter(t => noteAt(n, t).phase === 'stuck').length / 30;
    assert.ok(readable >= 0.8, `${n.label} is only readable for ${readable.toFixed(2)} s`);
    const wiped = frames.filter(t => noteAt(n, t).phase === 'wipe');
    assert.ok(wiped.length > 0);
    for (const t of wiped) { const c = clothAt(t); assert.ok(Math.abs(c.x - n.x) < NOTE.w / 2 + 10 && Math.abs(c.y - n.y) < NOTE.h / 2 + 10, `the cloth isn't on ${n.label}`); }
    const fall = frames.filter(t => noteAt(n, t).phase === 'fall');
    assert.ok(noteAt(n, fall[fall.length - 1]).y > noteAt(n, fall[0]).y + 150, `${n.label} doesn't fall`);
  }
});

test('the cloth rests in ME’s hand between wipes and never jumps', () => {
  assert.deepEqual(clothAt(0), CLOTH_REST);
  assert.deepEqual(clothAt((ZOOM.t0 + ZOOM.t1) / 2), CLOTH_REST);
  for (let i = 1; i < frames.length; i++) {
    const a = clothAt(frames[i - 1]), b = clothAt(frames[i]);
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) < 45, `the cloth jumps at ${frames[i].toFixed(2)} s`);
  }
});

test('a flower grows on the frame after each note of the second wave, and the rest at the ending', () => {
  assert.ok(FLOWERS.length >= 6);
  for (const n of secondWave) {
    const done = frames.find(t => noteAt(n, t).phase === 'fall')!;
    assert.ok(FLOWERS.some(f => f.t0 >= done - 0.05 && f.t0 <= done + 0.3), `no flower for ${n.label}`);
  }
  for (const f of FLOWERS) {
    assert.equal(flowerAt(f, ZOOM.t1), 0);
    assert.equal(flowerAt(f, DURATION), 1);
    assert.ok(f.x + 30 <= SAFE.right, 'a flower under Instagram’s buttons');
  }
});

test('a happy ending: ME and her reflection smile, the glass sparkles, the sun comes out', () => {
  const lastGone = Math.max(...secondWave.map(n => frames.find(t => noteAt(n, t).phase === 'gone')!));
  assert.equal(smileAt(lastGone), 0);
  assert.ok(smileAt(DURATION) > 0.95);
  assert.equal(sparkleAt(10), 0); assert.ok(sparkleAt(DURATION - 1) > 0);
  assert.equal(sunAt(0), 0); assert.equal(sunAt(DURATION), 1);
  assert.ok(MUSIC.chime > lastGone && MUSIC.chime < DURATION);
});

test('something moves at least every 1.5 s (no dead air)', () => {
  const dt = 1 / 30;
  const moving = (t: number) => {
    const a = clothAt(t), b = clothAt(t + dt);
    return Math.hypot(b.x - a.x, b.y - a.y) > 0.5 || Math.abs(zoomAt(t + dt) - zoomAt(t)) > 1e-4 || Math.abs(sunAt(t + dt) - sunAt(t)) > 1e-4 ||
      NOTES.some(n => { const p = noteAt(n, t), q = noteAt(n, t + dt); return p.phase !== q.phase || p.y !== q.y || p.scale !== q.scale; }) ||
      FLOWERS.some(f => flowerAt(f, t + dt) !== flowerAt(f, t));
  };
  for (let t0 = 0; t0 < DURATION - 1.5; t0 += 0.25) assert.ok(frames.some(t => t >= t0 && t < t0 + 1.5 && moving(t)), `nothing moves after ${t0} s`);
});
