// @pyqvault_ · Maths, visualised #2: calculus in one curve. Dark lab look (L22 rotation: M2 lab).
// Limit: a magnifier zooms ×1 → ×64 until the curve is straight. Derivative: a secant shrinks onto the tangent, its slope
// settling on f′(2.2). Integral: 4 → 64 strips close in on the exact area.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAB as P, tint } from './lib/palette.ts';
import { prog, captionAt } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, PHASES, f, df, A, X1, AREA, PLOT, px, py, zoomAt, INSET, hAt, secantSlope, stripsAt, riemann,
} from './lib/pm002.ts';
import { Board, Caption, MathRow, EndCard, TitleCard, Theme, hand, useFonts, type EndLine } from './board.tsx';

const COVER = { t: 20.6, text: 'Calculus in\none curve', y: 1580, size: 64 };
const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const curvePts = (x0: number, x1: number, n = 160) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [px(x), py(f(x))] as [number, number]; });
const win = (t: number, [a, b]: readonly [number, number]) => prog(t, a, 0.4) * (1 - prog(t, b - 0.2, 0.4));

function Plot({ t }: { t: number }) {
  const a = prog(t, 3.0, 0.5), draw = prog(t, 3.0, 1.2), L = 1400;
  const lim = win(t, PHASES.limit), slp = win(t, PHASES.slope), area = prog(t, PHASES.area[0], 0.4);
  const z = zoomAt(t), h = hAt(t), m = secantSlope(h), pa: [number, number] = [px(A), py(f(A))];
  // The secant: through (A, f(A)) and (A + h, f(A + h)), drawn across the plot.
  const sec = (x: number): [number, number] => [px(x), py(f(A) + m * (x - A))];
  const n = stripsAt(t), w = X1 / n;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs><clipPath id="lens"><circle cx={INSET.cx} cy={INSET.cy} r={INSET.r} /></clipPath>
        <clipPath id="plot"><rect x={PLOT.x0} y={py(2.2)} width={px(3.2) - PLOT.x0} height={PLOT.y0 - py(2.2)} /></clipPath></defs>
      <line x1={PLOT.x0} y1={PLOT.y0} x2={px(3.2)} y2={PLOT.y0} stroke={P.axis} strokeWidth={2.5} />
      <line x1={PLOT.x0} y1={PLOT.y0} x2={PLOT.x0} y2={py(2.2)} stroke={P.axis} strokeWidth={2.5} />
      {[1, 2, 3].map(k => <text key={k} x={px(k)} y={PLOT.y0 + 40} textAnchor="middle" fill={P.muted} style={{ ...hand(30) }}>{k}</text>)}
      {/* integral: midpoint strips from 0 to 3 */}
      {area > 0 && Array.from({ length: n }, (_, i) => {
        const x = i * w, hgt = f(x + w / 2);
        return <rect key={`${n}-${i}`} x={px(x)} y={py(hgt)} width={w * PLOT.sx} height={hgt * PLOT.sy} fill={tint(P.green, 0.32 * area)}
          stroke={tint(P.green, 0.85 * area)} strokeWidth={n > 30 ? 1 : 2} />;
      })}
      {/* the curve */}
      <path d={path(curvePts(0, 3.2))} fill="none" stroke={P.blue} strokeWidth={6} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
      {/* derivative: the secant swinging onto the tangent */}
      {slp > 0 && <g opacity={slp} clipPath="url(#plot)">
        <line x1={sec(0.2)[0]} y1={sec(0.2)[1]} x2={sec(3.2)[0]} y2={sec(3.2)[1]} stroke={P.amber} strokeWidth={4} />
        <circle cx={px(A + h)} cy={py(f(A + h))} r={11} fill={P.amber} />
      </g>}
      {(lim > 0 || slp > 0) && <circle cx={pa[0]} cy={pa[1]} r={12} fill={P.ink} stroke={P.board} strokeWidth={4} />}
      {/* limit: the magnifier */}
      {lim > 0 && <g opacity={lim}>
        <line x1={pa[0]} y1={pa[1]} x2={INSET.cx + INSET.r * 0.7} y2={INSET.cy + INSET.r * 0.7} stroke={tint(P.ink, 0.35)} strokeWidth={2} />
        <circle cx={INSET.cx} cy={INSET.cy} r={INSET.r} fill={P.card} stroke={tint(P.ink, 0.45)} strokeWidth={3} />
        <g clipPath="url(#lens)">
          <line x1={INSET.cx - INSET.r} y1={INSET.cy + df(A) * INSET.r * (PLOT.sy / PLOT.sx)} x2={INSET.cx + INSET.r} y2={INSET.cy - df(A) * INSET.r * (PLOT.sy / PLOT.sx)}
            stroke={tint(P.amber, 0.6)} strokeWidth={2.5} strokeDasharray="8 8" />
          <path d={path(Array.from({ length: 101 }, (_, i) => {
            const u = ((i - 50) / 50) * INSET.r, dx = u / (PLOT.sx * z);
            return [INSET.cx + u, INSET.cy - (f(A + dx) - f(A)) * PLOT.sy * z] as [number, number];
          }))} fill="none" stroke={P.blue} strokeWidth={6} />
          <circle cx={INSET.cx} cy={INSET.cy} r={9} fill={P.ink} />
        </g>
        <text x={INSET.cx} y={INSET.cy + INSET.r + 44} textAnchor="middle" fill={P.ink} style={{ ...hand(36), fontVariantNumeric: 'tabular-nums' }}>
          zoom ×{z < 10 ? z.toFixed(1) : Math.round(z)}
        </text>
      </g>}
    </svg>
  );
}

function Readouts({ t }: { t: number }) {
  const slp = win(t, PHASES.slope), area = prog(t, PHASES.area[0], 0.4) * (1 - prog(t, 23.6, 0.4)), num = { fontVariantNumeric: 'tabular-nums' as const };
  const h = hAt(t), n = stripsAt(t);
  return (
    <>
      <MathRow y={1360} size={44} opacity={slp}>
        <span style={{ color: P.amber }}>slope <span style={num}>{secantSlope(h).toFixed(3)}</span></span>
        <span style={{ color: P.muted, marginLeft: 22 }}>(h = <span style={num}>{h.toFixed(3)}</span>)</span>
        <span style={{ marginLeft: 22 }}>→ f′(2.2) = {df(A).toFixed(3)}</span>
      </MathRow>
      <MathRow y={1360} size={44} opacity={area}>
        <span style={{ color: P.green }}><span style={num}>{n}</span> strips: <span style={num}>{riemann(n).toFixed(3)}</span></span>
        <span style={{ marginLeft: 28 }}>→ exact area {AREA.toFixed(3)}</span>
      </MathRow>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Limit, slope, area.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the maths.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #3' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvMaths002({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <TitleCard t={t} label={'MATHS, VISUALISED  #2'} lines={['All of calculus', 'in one curve']} size={78} color={P.green} />
        <Plot t={t} />
        {!cover && <Readouts t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1540} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-maths-002-calculus.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
