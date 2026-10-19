// @pyqvault_ · Maths, visualised #3 (predict-first): e, why 2.718? White look (L22: M3 white).
// Frame 0: "₹1 at 100% a year, added every second. You end with? A ₹2 · B ₹2.72 · C crores". The year's money is drawn
// as a staircase: interest added once, twice, 4 times, monthly, daily, every second; earlier stairs stay as ghosts; the
// steps melt into the curve eᵗ, which stops at 2.71828… = e. House settings: short labels, pyqvault.com at the end.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import { END_AT, CAPTIONS, OPTIONS, ANSWER, STAGES, T_ANSWER, amount, valueAt, stageAt } from './lib/pm003.ts';
import { Board, Caption, EndCard, PredictHeader, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 8.9, text: 'Guess before you watch', y: 1610, size: 58 };   // before the answer lights (predict-first)
const G = { x0: 140, x1: 990, y0: 1150, top: 560 }, VMIN = 1, VMAX = 3;
const X = (tau: number) => G.x0 + tau * (G.x1 - G.x0), Y = (v: number) => G.y0 - ((v - VMIN) / (VMAX - VMIN)) * (G.y0 - G.top);
const DRAW = 1.2;                                                   // seconds to draw one staircase across the year

function stairPath(n: number, upto: number) {
  if (n >= 1e6) {                                                    // every second: the smooth curve eᵗ
    const k = Math.max(2, Math.round(upto * 200));
    return Array.from({ length: k + 1 }, (_, i) => { const tau = (upto * i) / k; return `${i ? 'L' : 'M'}${X(tau).toFixed(1)},${Y(valueAt(n, tau)).toFixed(1)}`; }).join(' ');
  }
  let d = `M${X(0)},${Y(1)}`;
  for (let j = 1; j <= n; j++) {
    const tau = j / n; if (tau > upto + 1e-9) { d += ` L${X(upto).toFixed(1)},${Y(valueAt(n, (j - 1) / n)).toFixed(1)}`; return d; }
    d += ` L${X(tau).toFixed(1)},${Y(valueAt(n, (j - 1) / n)).toFixed(1)} L${X(tau).toFixed(1)},${Y(valueAt(n, tau)).toFixed(1)}`;
  }
  return d;
}

function Chart({ t }: { t: number }) {
  const cur = stageAt(t), idx = STAGES.indexOf(cur), upto = Math.min(1, (t - cur.t0 - 0.2) / DRAW), eLine = prog(t, T_ANSWER - 0.3, 0.6);
  const lab = (x: number, y: number, s: string, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = P.muted, size = 30) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(size) }}>{s}</text>;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <line x1={G.x0} y1={G.y0} x2={G.x1 + 20} y2={G.y0} stroke={P.axis} strokeWidth={2.5} />
      <line x1={G.x0} y1={G.y0} x2={G.x0} y2={G.top - 20} stroke={P.axis} strokeWidth={2.5} />
      {[1, 2, 3].map(v => <g key={v}><line x1={G.x0 - 8} y1={Y(v)} x2={G.x0} y2={Y(v)} stroke={P.axis} strokeWidth={2} />{lab(G.x0 - 16, Y(v) + 10, `₹${v}`, 'end')}</g>)}
      {lab(X(0), G.y0 + 38, 'start')}{lab(X(0.5), G.y0 + 38, '6 months')}{lab(X(1), G.y0 + 38, '1 year')}
      {/* e: the ceiling */}
      {eLine > 0 && <g opacity={eLine}>
        <line x1={G.x0} y1={Y(Math.E)} x2={G.x1 + 20} y2={Y(Math.E)} stroke={P.amber} strokeWidth={3} strokeDasharray="10 9" />
        {lab(G.x0 + 14, Y(Math.E) - 14, 'e = 2.71828…', 'start', P.amber, 36)}
      </g>}
      {/* earlier staircases, fading back */}
      {STAGES.slice(0, idx).map((s, i) => <path key={s.n} d={stairPath(s.n, 1)} fill="none" stroke={tint(P.blue, 0.12 + 0.1 * (i / Math.max(1, idx)))} strokeWidth={3} />)}
      {/* the one being drawn */}
      {upto > 0 && <path d={stairPath(cur.n, upto)} fill="none" stroke={cur.n >= 1e6 ? P.green : P.blue} strokeWidth={6} strokeLinejoin="round" />}
      {upto > 0 && <circle cx={X(upto)} cy={Y(valueAt(cur.n, upto))} r={12} fill={cur.n >= 1e6 ? P.green : P.blue} stroke="#fff" strokeWidth={4} />}
    </svg>
  );
}

// The running tally: each way of adding interest and what ₹1 grows to.
function Tally({ t }: { t: number }) {
  const cur = stageAt(t), idx = STAGES.indexOf(cur);
  return (
    <div style={{ position: 'absolute', left: 170, width: 740, top: 1210 }}>
      {STAGES.map((s, i) => {
        const shown = i < idx || (i === idx && t > s.t0 + 0.2 + DRAW * 0.9), a = shown ? 1 : 0, now = i === idx;
        return <div key={s.n} style={{ display: 'flex', justifyContent: 'space-between', height: 50, opacity: a * (now ? 1 : 0.62),
          font: `600 ${now ? 36 : 32}px ${SOFT_UI}`, color: s.n >= 1e6 ? P.green : P.ink }}>
          <span>{s.label}</span><span style={{ ...hand(now ? 40 : 34), fontVariantNumeric: 'tabular-nums' }}>₹{amount(s.n).toFixed(s.n >= 1e6 ? 5 : 2)}</span>
        </div>;
      })}
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'More often, never past e.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the maths.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #4' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvMaths003({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <PredictHeader t={t} label={'MATHS, VISUALISED  #3'} lines={['₹1 at 100% a year, added', 'every second. You end with?']}
        options={OPTIONS} answer={ANSWER} at={T_ANSWER} size={54} />
      <Chart t={t} />
      {!cover && <Tally t={t} />}
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1610} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('pv-maths-003-e.wav')} />}
    </AbsoluteFill>
  );
}
