// @lws.pune · Why? #6 (predict-first): a coin shows heads AND a die shows 6: chance? 1/12. White board (F12), flat 2D
// (the founder dropped the 3D opening for 2D reels, 2026-10-20). The 12 outcomes pop into the grid from frame 0 under a
// slow push; heads fills half, a six fills a row, the crossing cell lights (1/12); a second coin halves it (1/24).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, OPTIONS, ANSWER, ANSWER_AT, T_HEADS, T_SIX, T_COIN2, GRID, cell, HEADS, SIX, popAt, headsCellAt, sixCellAt, bothAt, splitAt,
  chanceAt, CAPTIONS, CAMERA, COVER_T,
} from './lib/reel016.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const PAD = 24, GAP = 6, CELL = '#eef1f7';

// ---- the 2D grid ---------------------------------------------------------------------------------------------------
function Die({ n, x, y, s }: { n: number; x: number; y: number; s: number }) {
  const P6: Record<number, [number, number][]> = {
    1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  return (
    <g>
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.22} fill="#ffffff" stroke={tint(P.ink, 0.35)} strokeWidth={3} />
      {P6[n].map(([a, b], i) => <circle key={i} cx={x + a * s * 0.26} cy={y + b * s * 0.26} r={s * 0.08} fill={P.ink} />)}
    </g>
  );
}

function Grid({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), both = bothAt(t), split = splitAt(t), B = cell(HEADS, SIX);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(540 904) scale(${z}) translate(${-fx} ${-fy})`}>
        <rect x={GRID.x - PAD} y={GRID.y - PAD} width={GRID.w + 2 * PAD} height={GRID.h + 2 * PAD} rx={36} fill="#ffffff" />
        {Array.from({ length: GRID.cols * GRID.rows }, (_, i) => {
          const c = i % GRID.cols, r = Math.floor(i / GRID.cols), k = cell(c, r);
          const h = c === HEADS ? headsCellAt(r, t) : 0, s = r === SIX ? sixCellAt(c, t) : 0, pop = popAt(i, t);
          if (pop <= 0) return null;
          const sc = 0.6 + 0.4 * pop + 0.08 * Math.sin(Math.PI * pop);   // pops in with a little overshoot
          return (
            <g key={i} opacity={pop} transform={`translate(${k.cx} ${k.cy}) scale(${sc}) translate(${-k.cx} ${-k.cy})`}>
              <rect x={k.x + GAP} y={k.y + GAP} width={k.w - 2 * GAP} height={k.h - 2 * GAP} rx={18} fill={CELL} />
              {h > 0 && <rect x={k.x + GAP} y={k.y + GAP} width={k.w - 2 * GAP} height={k.h - 2 * GAP} rx={18} fill={tint(P.blue, 0.32 * h)} />}
              {s > 0 && <rect x={k.x + GAP} y={k.y + GAP} width={k.w - 2 * GAP} height={k.h - 2 * GAP} rx={18} fill={tint(P.amber, 0.32 * s)} />}
            </g>
          );
        })}
        {/* the crossing cell: heads and six. A second coin keeps only its left half */}
        {both > 0 && <g opacity={both}>
          <rect x={B.x + GAP} y={B.y + GAP} width={(B.w - 2 * GAP) * (1 - 0.5 * split)} height={B.h - 2 * GAP} rx={18} fill={P.green}
            style={{ filter: `drop-shadow(0 0 ${14 * both}px ${tint(P.green, 0.7)})` }} />
          {split > 0 && <rect x={B.x + GAP + (B.w - 2 * GAP) * 0.5} y={B.y + GAP} width={(B.w - 2 * GAP) * 0.5} height={B.h - 2 * GAP} rx={18}
            fill="none" stroke={tint(P.green, 0.6)} strokeWidth={4} strokeDasharray="10 10" opacity={split} />}
          <text x={B.x + (B.w * (1 - 0.5 * split)) / 2} y={B.cy + 14} textAnchor="middle" fill="#ffffff" style={{ ...hand(40) }}>{split > 0.5 ? 'H H 6' : 'H 6'}</text>
        </g>}
        {/* labels: the coin above, die faces down the side */}
        {['Heads', 'Tails'].map((s, c) => (
          <text key={s} x={cell(c, 0).cx} y={GRID.y - PAD - 18} textAnchor="middle" fill={c === HEADS ? P.blue : P.muted} style={{ font: `600 32px ${SOFT_UI}` }}>{s}</text>
        ))}
        {Array.from({ length: 6 }, (_, r) => <Die key={r} n={r + 1} x={GRID.x - PAD - 52} y={cell(0, r).cy} s={56} />)}
      </g>
    </svg>
  );
}

// The live count under the grid: lit cells out of all, as a fraction.
function Readout({ t }: { t: number }) {
  const a = prog(t, 0.3, 0.3);
  if (a <= 0) return null;
  const { num, den } = chanceAt(t);
  const line = t >= T_COIN2 + 0.4 ? 'HH6: 1 of 24 = ½ × ½ × ⅙'
    : t >= ANSWER_AT ? 'H6: 1 of 12 = ½ × ⅙'
    : t >= T_SIX + 0.3 ? 'a six: 2 of 12 = ⅙'
    : t >= T_HEADS + 0.5 ? 'heads: 6 of 12 = ½' : 'all outcomes: 12 cells';
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1380, textAlign: 'center', opacity: a }}>
      <span style={{ ...hand(46), color: num === 1 && den >= 12 ? P.green : P.ink, fontVariantNumeric: 'tabular-nums' }}>{line}</span>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Each “and” cuts the space:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the chances multiply.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel016({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  PROBABILITY'} lines={['Toss a coin, roll a die.', 'Chance of heads AND a six?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={52} />
        {/* the picture area: clipped below the question so a zoom never covers it, soft at its edges (F8) */}
        <div style={{ position: 'absolute', left: 0, top: 445, width: 1080, height: 1090, overflow: 'hidden', ...softEdges({ top: 0.015, bottom: 0.08 }) }}>
          <div style={{ position: 'absolute', left: 0, top: -445, width: 1080, height: 1920 }}><Grid t={t} /></div>
        </div>
        <Readout t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-016-multiply-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
