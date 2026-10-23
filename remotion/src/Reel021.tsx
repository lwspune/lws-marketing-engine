// @lws.pune · reel 021 (predict-first): flip y = 2ˣ over the line y = x; you get…? An NDA maths concept, white look.
// The blue curve 2ˣ draws itself with three dots; a copy folds across the dashed mirror and lands as the orange log₂x,
// each dot's coordinates swapped. The (3, 8)–(8, 3) pair becomes 2³ = 8 / log₂8 = 3, then the other pairs; finally the
// strip y ≤ 0 (2ˣ never goes there) folds onto x ≤ 0: no log there. Drawn in screen space; labels come from labelsAt(),
// the same list the overlap test checks. Timeline and checks: lib/reel021.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { clamp01, captionAt, prog } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, DOTS, FOLD, SEGMENT, SHADE_AT, exp2, fold, foldAt,
  xEndAt, dotAt, stripFoldAt, stripCorners, cam, toScreen, labelsAt, type Cam,
} from './lib/reel021.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Flip 2ˣ over y = x → ?', y: 1590, size: 58 };
const BAND = { top: 470, height: 1030 };
const mix = (s: number) => (s > 0 ? COLORS.exp : COLORS.log);
const path = (pts: [number, number][], c: Cam) => pts.map(([x, y], i) => { const [u, v] = toScreen(x, y, c); return `${i ? 'L' : 'M'}${u.toFixed(1)},${v.toFixed(1)}`; }).join(' ');
const expPts = (x0: number, x1: number, n = 120): [number, number][] => x1 <= x0 ? [] : Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, exp2(x)]; });

function Graph({ t }: { t: number }) {
  const c = cam(t), s = foldAt(t), zoomed = clamp01((c.z - 1.065) / 0.025), folding = t >= FOLD.t;
  const [ox, oy] = toScreen(0, 0, c), seg = prog(t, SEGMENT.t, SEGMENT.dur), pulse = Math.sin(Math.PI * clamp01((t - 7.3) / 0.6));
  const shade = prog(t, SHADE_AT, 0.5), ss = stripFoldAt(t), strip = stripCorners(ss).map(p => toScreen(p[0], p[1], c));
  const line = (x0: number, y0: number, x1: number, y1: number, stroke: string, w: number, dash?: string) => {
    const [a, b] = toScreen(x0, y0, c), [d, e] = toScreen(x1, y1, c);
    return <line x1={a} y1={b} x2={d} y2={e} stroke={stroke} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />;
  };
  const tick = (x: number, y: number, s2: string, anchor: 'middle' | 'end') => { const [u, v] = toScreen(x, y, c); return <text x={u} y={v} textAnchor={anchor} fill={P.muted} opacity={1 - zoomed} style={hand(30)}>{s2}</text>; };
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      {Array.from({ length: 11 }, (_, i) => i - 1).map(k => <g key={k}>{line(k, -1.5, k, 8.8, P.grid, 1.5)}{line(-1.5, k, 8.8, k, P.grid, 1.5)}</g>)}
      <line x1={0} y1={oy} x2={1080} y2={oy} stroke={P.axis} strokeWidth={2.5} />
      <line x1={ox} y1={0} x2={ox} y2={BAND.height} stroke={P.axis} strokeWidth={2.5} />
      {tick(4, -0.42, '4', 'middle')}{tick(8, -0.42, '8', 'middle')}{tick(-0.18, 3.85, '4', 'end')}{tick(-0.18, 7.85, '8', 'end')}
      {/* the strip 2ˣ never enters (y ≤ 0), folding onto x ≤ 0 */}
      {shade > 0 && <polygon points={strip.map(p => p.join(',')).join(' ')} fill={tint(mix(ss), 0.16 * shade)} stroke={tint(mix(ss), 0.5 * shade)} strokeWidth={2} strokeDasharray="10 8" />}
      {line(-1.5, -1.5, 8.8, 8.8, tint(P.ink, 0.45), 3, '14 12')}
      <path d={path(expPts(-1.5, Math.min(xEndAt(t), 3.1)), c)} fill="none" stroke={COLORS.exp} strokeWidth={7} strokeLinecap="round" />
      {/* the folding copy: thinner, with a soft shadow so it never vanishes on the mirror */}
      {folding && <path d={path(expPts(-1.5, 3.1).map(p => fold(p, s)), c)} fill="none" stroke={mix(s)} strokeWidth={s > 0 ? 5 : 7} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 6px 6px ${tint(P.ink, 0.25 * (1 - Math.abs(s)) + 0.08)})` }} />}
      {seg > 0 && (() => { const [a, b] = toScreen(3, 8, c), [d, e] = toScreen(3 + 5 * seg, 8 - 5 * seg, c);
        return <line x1={a} y1={b} x2={d} y2={e} stroke={tint(P.ink, 0.5)} strokeWidth={3} strokeDasharray="10 9" />; })()}
      {DOTS.map(d => { const [u, v] = toScreen(d[0], d[1], c), k = dotAt(d, t), r = 13 * (1 + (d[0] === 3 ? 0.35 * pulse : 0));
        return k > 0 && <circle key={`e${d[0]}`} cx={u} cy={v} r={r * k} fill={COLORS.exp} stroke={P.board} strokeWidth={4} />; })}
      {folding && DOTS.map(d => { const [u, v] = toScreen(...fold(d, s), c), r = 13 * (1 + (d[0] === 3 ? 0.35 * pulse : 0));
        return <circle key={`l${d[0]}`} cx={u} cy={v} r={r} fill={mix(s)} stroke={P.board} strokeWidth={4} />; })}
      {labelsAt(t, P.muted).filter(l => l.alpha > 0.01).map(l => (
        <text key={l.text + l.color} x={l.x} y={l.y} textAnchor={l.anchor} fill={l.color} opacity={l.alpha} style={hand(l.size)}
          transform={l.vertical ? `rotate(-90 ${l.x} ${l.y})` : undefined} dominantBaseline={l.vertical ? 'middle' : undefined}>{l.text}</text>
      ))}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Logarithm =' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the power, flipped.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel021({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  LOGARITHMS'} lines={['Flip y = 2ˣ over the line y = x.', 'You get…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Graph t={t} />
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-021-log-flip-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
