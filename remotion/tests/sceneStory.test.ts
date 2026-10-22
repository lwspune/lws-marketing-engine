import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  W, H, PANEL, TEXT_BOX, CLIFF_BOX, SCENES, INK, PAPER, CLIFF_INK, slideLayout, contrast, type ScenePost,
} from '../src/lib/sceneStory.ts';

// Sound Mind scene stories (framework S19): each slide of a soundmind/<week>/batch.json post with format "scene" is drawn
// by SceneStory.tsx from this layout. Checked against every scene post in the batches, so a new story can't ship a slide
// whose text spills, whose bubble covers a face, or whose speaker isn't drawn.
const batch = JSON.parse(readFileSync(new URL('../../soundmind/2026-w44/batch.json', import.meta.url), 'utf8'));
const posts: ScenePost[] = batch.posts.filter((p: { format: string }) => p.format === 'scene');
type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const inside = (a: Box, b: Box) => a.x0 >= b.x0 && a.y0 >= b.y0 && a.x1 <= b.x1 && a.y1 <= b.y1;
const asBox = (b: { x: number; y: number; w: number; h: number }): Box => ({ x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h });

test('the batch has a scene story, at Instagram portrait size', () => {
  assert.ok(posts.length >= 1);
  assert.deepEqual([W, H], [1080, 1350]);
});

test('every scene the story uses is drawn, and every speaker is in that scene', () => {
  for (const p of posts) p.slides.forEach((s, i) => {
    if (!s.scene) return;
    const scene = SCENES[s.scene];
    assert.ok(scene, `${p.slug} slide ${i + 1}: no scene "${s.scene}"`);
    for (const b of s.bubbles ?? []) assert.ok(scene.speakers[b.who], `${p.slug} slide ${i + 1}: "${b.who}" isn't in "${s.scene}"`);
  });
});

test('the slide text fits its box, and the cliffhanger its bar', () => {
  for (const p of posts) p.slides.forEach((s, i) => {
    const l = slideLayout(s, i, p.slides.length);
    assert.ok(l.text.lines.length * l.text.lineHeight <= TEXT_BOX.h, `${p.slug} slide ${i + 1}: text too tall (${l.text.lines.length} lines)`);
    for (const line of l.text.lines) assert.ok(line.width <= TEXT_BOX.w, `${p.slug} slide ${i + 1}: "${line.text}" too wide`);
    if (s.cliff) {
      assert.ok(l.cliff, `${p.slug} slide ${i + 1}: cliffhanger not laid out`);
      assert.ok(l.cliff!.width <= CLIFF_BOX.w, `${p.slug} slide ${i + 1}: cliffhanger too wide`);
    }
    assert.equal(l.page, `${i + 1}/${p.slides.length}`);
  });
});

test('bubbles sit inside the picture, clear of each other, the text and every face, with their tails at the speaker', () => {
  const panel = asBox(PANEL);
  for (const p of posts) p.slides.forEach((s, i) => {
    if (!s.scene) return;
    const l = slideLayout(s, i, p.slides.length), scene = SCENES[s.scene];
    l.bubbles.forEach((b, k) => {
      const where = `${p.slug} slide ${i + 1} bubble ${k + 1}`;
      assert.ok(inside(b.box, panel), `${where} sticks out of the picture`);
      for (const line of b.lines) assert.ok(line.width <= b.box.x1 - b.box.x0 - 40, `${where}: "${line.text}" too wide`);
      assert.ok(b.lines.length * b.lineHeight <= b.box.y1 - b.box.y0 - 30, `${where} too tall for its text`);
      for (const face of Object.values(scene.faces)) assert.ok(!overlaps(b.box, face), `${where} covers a face`);
      l.bubbles.slice(k + 1).forEach((o, j) => assert.ok(!overlaps(b.box, o.box), `${where} overlaps bubble ${k + j + 2}`));
      const at = scene.speakers[s.bubbles![k].who];
      const d = Math.hypot(b.tail.x - at.x, b.tail.y - at.y);
      assert.ok(d < Math.hypot(b.box.x0 - at.x, b.box.y0 - at.y) && d < 90, `${where}'s tail doesn't point at the speaker`);
    });
  });
});

test('text colours pass WCAG AA on the paper', () => {
  assert.ok(contrast(INK, PAPER) >= 4.5);
  assert.ok(contrast(CLIFF_INK, PAPER) >= 4.5);
});
