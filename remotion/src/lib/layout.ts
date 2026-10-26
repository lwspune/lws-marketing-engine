// Full-frame layout (framework F35, founder 2026-10-26): the 3D picture fills the whole page instead of a band between a
// question card and a graph card, and each text floats beside what it names. A reel lists every text on screen at t as
// named boxes; frameProblems() is its test: each box inside the safe area, no two colliding.
import type { Band } from './inductionScene.ts';

export const FULL: Band = { top: 0, width: 1080, height: 1920 };
// Instagram's own overlays (reels/lwspune-insta.md): the username + caption over the bottom ~320 px, the like / comment /
// share buttons down the right ~120 px from mid-screen.
export const SAFE = { bottom: 1600, right: 960, rightFrom: 960 } as const;

export type Box = { x: number; y: number; w: number; h: number };
export type Named = { name: string; box: Box };

/** A one-line text of `size` px centred on (x, y): about 0.55 em per character, `pad` px on each side. */
export const textBox = (text: string, size: number, x: number, y: number, pad = 0): Box => {
  const w = [...text].length * size * 0.55 + 2 * pad, h = size * 1.3;
  return { x: x - w / 2, y: y - h / 2, w, h };
};

export const inSafeArea = (b: Box) => b.x >= 0 && b.y >= 0 && b.x + b.w <= FULL.width && b.y + b.h <= SAFE.bottom
  && !(b.x + b.w > SAFE.right && b.y + b.h > SAFE.rightFrom);

export const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The share of the page width spanned by these x positions (how big the picture is, F35). */
export const widthShare = (xs: number[]) => (Math.max(...xs) - Math.min(...xs)) / FULL.width;
export const heightShare = (ys: number[]) => (Math.max(...ys) - Math.min(...ys)) / FULL.height;

export function frameProblems(texts: Named[]) {
  const out = texts.filter(t => !inSafeArea(t.box)).map(t => `${t.name} outside the safe area`);
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++)
    if (overlaps(texts[i].box, texts[j].box)) out.push(`${texts[i].name} overlaps ${texts[j].name}`);
  return out;
}
