import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DURATION, COVER_T, LINES, VOICE, BEATS, X0, H0, F, slope, chordSlope, hAt, toScreen, GRAPH, LAYOUT, captionAt, formulaAt, sceneAt,
  counterAt, figureAlphaAt, endCardAt, SOUND, SOURCE,
} from '../src/lib/pm005.ts';

// @pyqvault_ · Maths, visualised #5 (founder 2026-10-30: "create exact reel", shorter cut): @mathsy.uk's "Where
// differentiation actually comes from" copied in its look and order up to the derivative's formula, in our own words.
const frames = Array.from({ length: Math.round(DURATION * 30) }, (_, i) => i / 30);
const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const at = (id: string) => BEATS.find(b => b.id === id)!.t;

test('the maths: the chord\'s slope is (f(x+h) − f(x)) / h, and it closes in on the tangent\'s slope f′(x)', () => {
  for (const h of [1.4, 0.7, 0.1, 0.001]) assert.ok(close(chordSlope(h), (F(X0 + h) - F(X0)) / h, 1e-12));
  assert.ok(close(chordSlope(1e-7), slope(X0), 1e-6));
  // f(x) = a x² + b x + c has chord slope 2a·x0 + a·h + b: it goes down steadily as h does, to f′(x0)
  assert.ok(chordSlope(H0) > chordSlope(H0 / 2) && chordSlope(H0 / 2) > slope(X0));
  // the warning beat: f(x + h) is not f(x) + h for this curve at the start
  assert.ok(Math.abs(F(X0 + H0) - (F(X0) + H0)) > 0.3);
});

test('h only ever shrinks, never reaches 0, and is still its full size until the narration says to shrink it', () => {
  let last = Infinity;
  for (const t of frames) { const h = hAt(t); assert.ok(h > 0 && h <= last + 1e-12, `t = ${t}`); last = h; }
  assert.equal(hAt(at('shrink')), H0);
  assert.ok(hAt(at('tangent') + 1) < 0.05, 'the chord has all but become the tangent as the line says so');
});

test('the h counter shows the live h, small, with four decimals, and never 0.0000', () => {
  const shown = frames.map(t => ({ t, c: counterAt(t) })).filter(x => x.c);
  assert.ok(shown.length > 30);
  for (const { t, c } of shown) {
    assert.equal(c!.text, `h = ${hAt(t).toFixed(4)}`);
    assert.notEqual(c!.text, 'h = 0.0000');
    assert.ok(t >= at('close') && t < at('deriv') + 1, `t = ${t}`);
  }
});

test('the narration: our own lines in order, each spoken inside its slot, the last one before the end card', () => {
  assert.deepEqual(BEATS.map(b => b.id), ['title', 'curve', 'point', 'fx', 'step', 'land', 'fxh', 'warn', 'chord', 'steep', 'rise',
    'climb', 'run', 'slope', 'shrink', 'slide', 'tangent', 'close', 'limit', 'deriv']);
  for (let i = 0; i < LINES.length; i++) {
    const { t, dur } = LINES[i], next = i + 1 < LINES.length ? LINES[i + 1].t : endCardAt.start;
    assert.ok(t + dur + 0.2 <= next, `${LINES[i].id} runs into the next line`);
    assert.equal(VOICE[i].t, t);
  }
  assert.ok(endCardAt.start + 2 <= DURATION);
  // the source: a long reel, cut where its first half ends
  assert.ok(SOURCE.duration > 100 && DURATION < 70);
});

test('captions: only the words being spoken, at most four at a time, the spoken word marked', () => {
  for (const t of frames) {
    const c = captionAt(t);
    if (!c) continue;
    const line = [...LINES].reverse().find(l => t >= l.t && t < l.t + l.dur + 0.6)!;   // the newest line speaking
    assert.ok(line, `caption at ${t} with no line speaking`);
    assert.ok(c.words.length >= 1 && c.words.length <= 4, `t = ${t}: ${c.words.join(' ')}`);
    assert.ok(line.text.split(' ').join(' ').includes(c.words.join(' ')), `t = ${t}: "${c.words.join(' ')}" is not in "${line.text}"`);
    assert.ok(c.active >= 0 && c.active < c.words.length);
  }
  // every word of every line is shown at some point
  for (const l of LINES) {
    const seen = new Set<string>();
    for (let t = l.t; t < l.t + l.dur; t += 1 / 60) { const c = captionAt(t); c?.words.forEach((w, i) => i === c.active && seen.add(`${c.start + i}`)); }
    assert.equal(seen.size, l.text.split(' ').length, l.id);
  }
  assert.equal(captionAt(endCardAt.start + 0.5), null);
});

test('frame 0 already shows the hook: the opening words and the axes, as theirs', () => {
  assert.deepEqual(captionAt(0)?.words.slice(0, 2), ['Where', 'do']);
  assert.ok(sceneAt(0).axes > 0.3);
});

test('the formula builds in their order: the warning, the climb, over h, the limit, f′(x)', () => {
  const stage = (t: number) => formulaAt(t)?.stage ?? null;
  assert.equal(stage(at('warn') + 1), 'neq');
  assert.equal(stage(at('chord') + 0.5), null);
  assert.equal(stage(at('climb') + 1.5), 'climb');
  assert.equal(stage(at('run') + 1.2), 'quotient');
  assert.equal(stage(at('limit') + 1), 'limit');
  assert.equal(stage(at('deriv') + 3), 'derivative');
  assert.equal(stage(endCardAt.start + 0.6), null);
});

test('the warning dims the figure, and only the warning does', () => {
  assert.ok(figureAlphaAt(at('warn') + 1.5) < 0.5);
  for (const id of ['fxh', 'chord', 'slope', 'tangent', 'deriv']) assert.ok(figureAlphaAt(at(id) + 1) > 0.95, id);
});

test('layout: the formula sits above the graph and the captions below it, nothing off the 1080 × 1920 frame', () => {
  const top = toScreen([GRAPH.x1, GRAPH.y1]), bottom = toScreen([GRAPH.x0, GRAPH.y0]);
  assert.ok(LAYOUT.formulaY + 80 < top[1] - 40, 'formula clear of the graph');
  assert.ok(LAYOUT.captionY - 50 > bottom[1] + 90, 'captions clear of the x labels');
  for (const p of [top, bottom]) assert.ok(p[0] >= 60 && p[0] <= 1020 && p[1] >= 0 && p[1] <= 1920);
  // the curve stays inside the graph box
  for (let x = GRAPH.x0; x <= GRAPH.x1; x += 0.05) assert.ok(F(x) >= GRAPH.y0 && F(x) <= GRAPH.y1, `F(${x})`);
  assert.ok(COVER_T > at('slope') && COVER_T < at('shrink'), 'the cover shows the chord and its slope');
});

test('sound: no effects of our own, just the music under the voice; within the reel', () => {
  assert.equal(SOUND.duration, DURATION);
  for (const h of SOUND.hits) assert.ok(h.t >= 0 && h.t < DURATION);
});
