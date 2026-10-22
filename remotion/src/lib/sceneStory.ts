// Sound Mind scene stories (framework S19, founder 2026-10-22): the layout of each illustrated carousel slide, drawn by
// SceneStory.tsx from a soundmind/<week>/batch.json post with format "scene" (rules: soundmind/cards.js). The text sits on
// the paper above the picture, the bubbles inside it pointing at whoever speaks, a cliffhanger line in the bar below.
// Text is measured with average glyph widths (Kalam bold, Lora), a little generous so a line never spills.

export const W = 1080, H = 1350;
export const TEXT_BOX = { x: 80, y: 96, w: 920, h: 220 };
export const PANEL = { x: 60, y: 330, w: 960, h: 820 };
export const CLIFF_BOX = { x: 80, y: 1172, w: 920, h: 90 };

// Sound Mind's carousel paper and ink (framework S8), plus a deep coral for the cliffhanger line.
export const PAPER = '#F6F1E7', INK = '#2F3A33', CLIFF_INK = '#A8352A';

export type Bubble = { who: string; kind: 'say' | 'think'; text: string };
export type SceneSlide = { type: 'cover' | 'page' | 'lesson' | 'share'; scene?: string; text: string; cliff?: string; bubbles?: Bubble[] };
export type ScenePost = { slug: string; format: 'scene'; title: string; slides: SceneSlide[]; caption: string; hashtags: string[] };

type Box = { x0: number; y0: number; x1: number; y1: number };
type Point = { x: number; y: number };
const head = (x: number, y: number, r: number): Box => ({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });

/**
 * Each scene: where its people's faces are (bubbles keep off them), the point beside each speaker a bubble's tail aims
 * at ("off" is someone out of sight, through the doorway), and where its bubbles go, in order (box centres).
 */
export type Scene = { faces: Record<string, Box>; speakers: Record<string, Point>; slots: Point[] };
export const STAND = { x: 700, y: 580, r: 50 };                     // her, standing at the stove
export const SCENES: Record<string, Scene> = {
  stove: { faces: { her: head(STAND.x, STAND.y, STAND.r) }, speakers: {}, slots: [] },
  morning: { faces: { her: head(STAND.x, STAND.y, STAND.r) }, speakers: { her: { x: 700, y: 518 } }, slots: [{ x: 700, y: 420 }] },
  calls: {
    faces: { her: head(STAND.x, STAND.y, STAND.r) }, speakers: { off: { x: 230, y: 640 } },
    slots: [{ x: 420, y: 430 }, { x: 430, y: 590 }, { x: 410, y: 760 }],
  },
  stool: { faces: { her: head(560, 720, 50) }, speakers: { off: { x: 230, y: 640 } }, slots: [{ x: 560, y: 470 }] },
  thought: { faces: { her: head(540, 840, 190) }, speakers: { her: { x: 560, y: 635 } }, slots: [{ x: 560, y: 470 }] },
  dinner: {
    faces: { her: head(780, 580, 50), f1: head(170, 790, 28), f2: head(250, 780, 28), f3: head(330, 790, 28), f4: head(410, 785, 24) },
    speakers: { off: { x: 300, y: 735 } }, slots: [{ x: 330, y: 470 }],
  },
  daughter: { faces: { her: head(720, 580, 50), daughter: head(470, 800, 40) }, speakers: { daughter: { x: 470, y: 745 } }, slots: [{ x: 360, y: 610 }] },
  ladle: {
    faces: { mil: head(380, 600, 50), her: head(740, 600, 50) }, speakers: { mil: { x: 446, y: 618 } },
    slots: [{ x: 560, y: 440 }, { x: 560, y: 980 }],
  },
  table: { faces: { her: head(540, 760, 50), daughter: head(560, 860, 34), f1: head(230, 760, 42), f2: head(850, 760, 42), mil: head(380, 740, 44) }, speakers: {}, slots: [] },
  diya: { faces: {}, speakers: {}, slots: [] },
};

// ---------- text ----------

export type Line = { text: string; width: number };
// Average glyph width as a fraction of the font size (bold handwriting is wider than the serif).
const GLYPH = { Kalam: 0.54, Lora: 0.52 };
const plain = (s: string) => s.replace(/\*/g, '');
const measure = (s: string, font: keyof typeof GLYPH, size: number) => plain(s).length * GLYPH[font] * size;

/** Greedy word wrap to `maxWidth` px. Non-breaking spaces keep their words together. */
export function wrap(text: string, font: keyof typeof GLYPH, size: number, maxWidth: number): Line[] {
  const lines: Line[] = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next, font, size) > maxWidth) { lines.push({ text: cur, width: measure(cur, font, size) }); cur = word; }
    else cur = next;
  }
  if (cur) lines.push({ text: cur, width: measure(cur, font, size) });
  return lines;
}

// Each slide type's text: its font, the largest size it starts from and the smallest it may shrink to, line spacing.
const TYPE = {
  cover: { font: 'Kalam', max: 72, min: 50, leading: 1.16 },
  page: { font: 'Lora', max: 48, min: 34, leading: 1.32 },
  lesson: { font: 'Kalam', max: 54, min: 40, leading: 1.18 },
  share: { font: 'Kalam', max: 66, min: 48, leading: 1.18 },
} as const;

export type TextLayout = { font: 'Kalam' | 'Lora'; size: number; lineHeight: number; lines: Line[] };
function fitText(text: string, type: SceneSlide['type'], box = TEXT_BOX): TextLayout {
  const t = TYPE[type];
  for (let size = t.max; ; size -= 2) {
    const lines = wrap(text, t.font, size, box.w), lineHeight = Math.round(size * t.leading);
    if ((lines.length * lineHeight <= box.h && lines.every(l => l.width <= box.w)) || size <= t.min) return { font: t.font, size, lineHeight, lines };
  }
}

// ---------- bubbles ----------

export const BUBBLE = { size: 38, lineHeight: 44, maxText: 440, padX: 28, padY: 18 };
export type BubbleLayout = { kind: Bubble['kind']; lines: Line[]; lineHeight: number; box: Box; tail: Point };
function layBubble(b: Bubble, slot: Point, speaker: Point): BubbleLayout {
  const lines = wrap(b.text, 'Kalam', BUBBLE.size, BUBBLE.maxText);
  const w = Math.max(...lines.map(l => l.width)) + 2 * BUBBLE.padX + 20, h = lines.length * BUBBLE.lineHeight + 2 * BUBBLE.padY + 4;
  const box = { x0: slot.x - w / 2, y0: slot.y - h / 2, x1: slot.x + w / 2, y1: slot.y + h / 2 };
  // The tail stops just short of the speaker, on the way from the bubble.
  const dx = slot.x - speaker.x, dy = slot.y - speaker.y, d = Math.hypot(dx, dy) || 1;
  return { kind: b.kind, lines, lineHeight: BUBBLE.lineHeight, box, tail: { x: speaker.x + (dx / d) * 15, y: speaker.y + (dy / d) * 15 } };
}

export type SlideLayout = { text: TextLayout; bubbles: BubbleLayout[]; cliff: (Line & { size: number }) | null; page: string };
export function slideLayout(s: SceneSlide, index: number, count: number): SlideLayout {
  const scene = s.scene ? SCENES[s.scene] : undefined;
  const bubbles = (s.bubbles ?? []).map((b, k) => layBubble(b, scene!.slots[k], scene!.speakers[b.who]));
  // The cliffhanger stays on one line beside its arrow (70 px), shrinking from 46 px to 34 px if it must.
  let cliff: SlideLayout['cliff'] = null;
  for (let size = 46; s.cliff && size >= 34; size -= 2) {
    cliff = { text: s.cliff, width: measure(s.cliff, 'Kalam', size) + 70, size };
    if (cliff.width <= CLIFF_BOX.w) break;
  }
  return { text: fitText(s.text, s.type), bubbles, cliff, page: `${index + 1}/${count}` };
}

// ---------- contrast (WCAG 2) ----------

const lum = (hex: string) => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
