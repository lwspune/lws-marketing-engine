// @lws.pune · reel 010 remade (predict-first): roll two dice: which total comes up most? White board, flat 2D, the zooms
// act on the picture. Real seeded rolls (lib/reel010.ts) tumble the dice from frame 0 and drop chips into a histogram of
// totals; 7 pulls ahead, a hand-drawn circle (@remotion/rough-notation) rings it as the answer lights. Then the 6×6 grid of
// outcomes: 7's diagonal lights cell by cell, and the exact 1…6…1 shape draws itself over the bars (@remotion/paths).
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { evolvePath } from '@remotion/paths';
import { Circle } from '@remotion/rough-notation';
import { WHITE as P, tint } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, ROLLS, WAYS, T_GRID, HIST, CAMERA, SEED, colX, countsAt, rolledBy,
  lastRoll, gridLitAt, chipProgress,
} from './lib/reel010.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { t: 2.0, text: 'Which total wins?', y: 1590, size: 62 };   // rolls just started: no spoiler
const BAND = { top: 470, height: 1030 };
const SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const DICE = { y: 170, size: 124, xs: [440, 640] };
const GRID = { x: 372, y: 46, cell: 56 };
const camCss = (z: number, fx: number, fy: number): React.CSSProperties =>
  ({ position: 'absolute', left: 0, top: 0, width: 1080, height: BAND.height, transformOrigin: '0 0', transform: `translate(540px, 500px) scale(${z}) translate(${-fx}px, ${-fy}px)` });

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};
function Die({ x, face, t, k }: { x: number; face: number; t: number; k: number }) {
  // A gentle tumble from frame 0 (seeded noise), a little hop on every roll.
  const tilt = 16 * noise2D(`die${k}`, t * 1.6, 0), hop = 10 * Math.abs(noise2D(`hop${k}`, t * 3, 1)), s = DICE.size;
  return (
    <g transform={`translate(${x} ${DICE.y - hop}) rotate(${tilt})`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={26} fill="#ffffff" stroke={P.ink} strokeWidth={5} />
      {PIPS[face].map(([px, py], i) => <circle key={i} cx={px * s * 0.27} cy={py * s * 0.27} r={11} fill={P.ink} />)}
    </g>
  );
}

// The exact shape: with perfect dice, 360 rolls give 10 × (ways) of each total.
const EXACT = SUMS.map((s, i) => `${i ? 'L' : 'M'}${colX(s)},${HIST.base - 10 * WAYS[s] * HIST.perChip}`).join(' ');

function Picture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), c = countsAt(t), roll = lastRoll(t), n = rolledBy(t);
  const won = prog(t, ANSWER_AT, 0.4), grid = prog(t, T_GRID - 0.3, 0.6), dice = 1 - grid, exact = prog(t, 12.5, 1.0);
  const lit = gridLitAt(t), ev = evolvePath(exact, EXACT);
  const flying = ROLLS.filter(r => r.t <= t && t < r.t + 0.35).slice(-14);
  return (
    <>
      <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g transform={`translate(540 500) scale(${z}) translate(${-fx} ${-fy})`}>
          {dice > 0 && <g opacity={dice}>
            <Die x={DICE.xs[0]} face={roll.a} t={t} k={0} /><Die x={DICE.xs[1]} face={roll.b} t={t} k={1} />
            <text x={540} y={DICE.y + 118} textAnchor="middle" fill={P.muted} style={{ ...hand(30), fontVariantNumeric: 'tabular-nums' }}>{n} rolls</text>
          </g>}
          {/* chips falling from the dice into their column */}
          {flying.map((r, i) => {
            const s = r.a + r.b, u = chipProgress(r, t), x0 = 540, y0 = DICE.y + 70;
            const before = ROLLS.slice(0, ROLLS.indexOf(r)).filter(q => q.a + q.b === s).length, y1 = HIST.base - (before + 1) * HIST.perChip;
            return <rect key={i} x={x0 + (colX(s) - x0) * u - 24} y={y0 + (y1 - y0) * u - 70 * Math.sin(Math.PI * u) - 4} width={48} height={8} rx={4}
              fill={s === 7 && t >= ANSWER_AT ? P.green : P.blue} opacity={0.9} />;   // no green hint before the answer
          })}
          {/* the histogram: one chip per landed roll, rounded bars */}
          <line x1={HIST.x0 - 10} y1={HIST.base} x2={HIST.x1 + 10} y2={HIST.base} stroke={P.axis} strokeWidth={3} strokeLinecap="round" />
          {SUMS.map(s => {
            const h = c[s] * HIST.perChip, seven = s === 7, col = seven && won > 0 ? P.green : P.blue;
            return (
              <g key={s}>
                {h > 0 && <rect x={colX(s) - 26} y={HIST.base - h} width={52} height={h + 6} rx={12} fill={tint(col, seven ? 0.85 : 0.6)} />}
                {c[s] > 0 && <text x={colX(s)} y={HIST.base - h - 14} textAnchor="middle" fill={seven && won > 0 ? P.green : P.muted}
                  style={{ ...hand(seven ? 32 : 26), fontVariantNumeric: 'tabular-nums' }}>{c[s]}</text>}
              </g>
            );
          })}
          {exact > 0 && <g>
            <path d={EXACT} fill="none" stroke={P.amber} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
            <text x={colX(7) + 40} y={HIST.base - 60 * HIST.perChip - 52} fill={P.amber} style={{ ...hand(30) }} opacity={exact}>6 of 36</text>
          </g>}
          {/* the grid of the 36 outcomes; 7's diagonal lights cell by cell */}
          {grid > 0 && <g opacity={grid}>
            {[1, 2, 3, 4, 5, 6].map(a => [1, 2, 3, 4, 5, 6].map(b => {
              const x = GRID.x + (b - 1) * GRID.cell, y = GRID.y + (a - 1) * GRID.cell, seven = a + b === 7, on = seven && a <= lit;
              return (
                <g key={`${a}${b}`}>
                  <rect x={x + 3} y={y + 3} width={GRID.cell - 6} height={GRID.cell - 6} rx={12} fill={on ? P.green : '#ffffff'} stroke={tint(P.ink, 0.25)} strokeWidth={2} />
                  <text x={x + GRID.cell / 2} y={y + GRID.cell / 2 + 9} textAnchor="middle" fill={on ? '#ffffff' : P.muted} style={{ ...hand(24) }}>{a + b}</text>
                </g>
              );
            }))}
            <text x={GRID.x - 18} y={GRID.y + 3 * GRID.cell + 10} textAnchor="end" fill={P.muted} style={{ ...hand(26) }}>die 1</text>
            <text x={GRID.x + 3 * GRID.cell} y={GRID.y - 12} textAnchor="middle" fill={P.muted} style={{ ...hand(26) }}>die 2</text>
          </g>}
        </g>
      </svg>
      {/* the totals under the bars: HTML, so the hand-drawn circle can ring the 7 (seeded, the same every render) */}
      <div style={camCss(z, fx, fy)}>
        {SUMS.map(s => (
          <div key={s} style={{ position: 'absolute', left: colX(s) - 30, width: 60, top: HIST.base + 10, textAlign: 'center', ...hand(32),
            color: s === 7 && won > 0 ? P.green : P.ink }}>
            {s === 7
              ? <Circle progress={won} seed={SEED + 70} color={P.green} strokeWidth={4} padding={{ top: 6, right: 10, bottom: 6, left: 10 }}>7</Circle>
              : s}
          </div>
        ))}
      </div>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Two dice, 36 ways to land.' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: '7 has the most: 6.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel010({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  PROBABILITY'} lines={['Roll two dice.', 'Which total comes up most?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.04, bottom: 0.05 }) }}>
          <Picture t={t} />
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-010-why-seven-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
