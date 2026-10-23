// @lws.pune · reel 019 (predict-first): the area between y = x and y = x³ from 0 to 1 is…? An NDA maths concept, white
// look. Both curves draw from frame 0; green strips rise between them, each top minus bottom, the total counting up;
// the strips double three times and the total settles on 0.25 (B ¼). Then why: ½ under the line, ¼ under x³ drops away,
// ½ − ¼ = ¼. Midpoint strips, so the total on screen is the true strip sum. Timeline and checks: lib/reel019.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { clamp01, captionAt, prog, tween } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COLORS, COVER_T, CAMERA, SWEEP, BEATS, top, bottom, drawAt, stripsAt, readoutAt, px, py,
} from './lib/reel019.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: '½, ¼ or ⅛?', y: 1590, size: 62 };
const BAND = { top: 470, height: 1030 };
const STEP = SWEEP.dur / 10;

const trace = (g: (x: number) => number, a: number, b: number, n = 90) =>
  b <= a ? '' : Array.from({ length: n + 1 }, (_, i) => { const x = a + ((b - a) * i) / n; return `${i ? 'L' : 'M'}${px(x).toFixed(1)},${py(g(x)).toFixed(1)}`; }).join(' ');
// The region between the line and the cubic, the one under the cubic, and the triangle under the line, as closed paths.
const betweenPath = () => {
  const up = Array.from({ length: 91 }, (_, i) => i / 90).map(x => `${px(x).toFixed(1)},${py(top(x)).toFixed(1)}`);
  const down = Array.from({ length: 91 }, (_, i) => 1 - i / 90).map(x => `${px(x).toFixed(1)},${py(bottom(x)).toFixed(1)}`);
  return `M${up.join(' L')} L${down.join(' L')} Z`;
};
const underCubic = `${trace(bottom, 0, 1)} L${px(1)},${py(0)} L${px(0)},${py(0)} Z`;
const triangle = `M${px(0)},${py(0)} L${px(1)},${py(1)} L${px(1)},${py(0)} Z`;

function Strips({ t }: { t: number }) {
  const { n } = stripsAt(t), melt = prog(t, ANSWER_AT, 0.5), w = 1 / n, gap = n <= 10 ? 5 : n <= 20 ? 3 : n <= 40 ? 1.5 : 0.6;
  if (t < SWEEP.t || melt >= 1) return null;
  return <g opacity={1 - melt}>{Array.from({ length: n }, (_, i) => {
    const m = (i + 0.5) * w, grow = n === 10 ? clamp01((t - SWEEP.t - i * STEP) / (STEP * 1.6)) : 1;
    if (grow <= 0) return null;
    const lo = py(bottom(m)), hi = py(bottom(m) + grow * (top(m) - bottom(m)));
    return <rect key={i} x={px(i * w) + gap} y={hi} width={Math.max(0.5, px(w) - px(0) - 2 * gap)} height={Math.max(0, lo - hi)} rx={n <= 20 ? 6 : 1}
      fill={tint(COLORS.area, 0.78)} />;
  })}</g>;
}

function Graph({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), d = drawAt(t), end = 0.22 + 0.86 * d;
  const area = prog(t, ANSWER_AT, 0.5);
  const tri = prog(t, BEATS.triangle + 0.1, 0.6) * (1 - prog(t, BEATS.subtract, 0.8));
  const cub = prog(t, BEATS.cubic, 0.6), drop = prog(t, BEATS.subtract, 0.8);
  const lab = (x: number, y: number, s: string, color: string, size: number, anchor: 'start' | 'middle' | 'end' = 'middle', opacity = 1) =>
    <text x={x} y={y} textAnchor={anchor} fill={color} opacity={opacity} style={hand(size)}>{s}</text>;
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform={`translate(540 515) scale(${z}) translate(${-fx} ${-fy})`}>
        {[0.25, 0.5, 0.75, 1].map(v => <g key={v}>
          <line x1={px(v)} y1={py(0)} x2={px(v)} y2={py(1.1)} stroke={P.grid} strokeWidth={2} />
          <line x1={px(0)} y1={py(v)} x2={px(1.1)} y2={py(v)} stroke={P.grid} strokeWidth={2} />
        </g>)}
        <line x1={px(-0.08)} y1={py(0)} x2={px(1.12)} y2={py(0)} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={px(0)} y1={py(-0.06)} x2={px(0)} y2={py(1.12)} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        {lab(px(0) - 18, py(0) + 40, '0', P.muted, 32, 'end')}
        {lab(px(1), py(0) + 44, '1', P.muted, 32)}
        {lab(px(0) - 18, py(1) + 10, '1', P.muted, 32, 'end')}
        {/* the area, once the strips melt into it */}
        {area > 0 && <path d={betweenPath()} fill={tint(COLORS.area, 0.6 * area)} />}
        <Strips t={t} />
        {/* the why: ½ under the line, ¼ under x³ (which drops away), ½ − ¼ = ¼ */}
        {tri > 0 && <path d={triangle} fill={tint(COLORS.top, 0.16 * tri)} stroke={tint(COLORS.top, 0.7 * tri)} strokeWidth={3} strokeDasharray="12 10" />}
        {tri > 0 && lab(px(1) + 30, py(0.5), '½', COLORS.top, 64, 'start', tri)}
        {cub > 0 && drop < 1 && <g opacity={cub * (1 - drop)} transform={`translate(0 ${drop * 160})`}>
          <path d={underCubic} fill={tint(COLORS.bottom, 0.32)} />
          {lab(px(0.83), py(0.12), '¼', COLORS.bottom, 60)}
        </g>}
        {drop > 0 && lab(px(0.5), py(0.33), '¼', COLORS.area, 72, 'middle', drop)}
        {/* the curves, drawing themselves from frame 0 */}
        <path d={trace(bottom, 0, Math.min(end, 1.08))} fill="none" stroke={COLORS.bottom} strokeWidth={8} strokeLinecap="round" />
        <path d={trace(top, 0, Math.min(end, 1.08))} fill="none" stroke={COLORS.top} strokeWidth={8} strokeLinecap="round" />
        {lab(px(0.5) - 24, py(0.5) - 30, 'y = x', COLORS.top, 40, 'end', clamp01((end - 0.52) / 0.1))}
        {lab(px(0.7) + 22, py(bottom(0.7)) + 52, 'y = x³', COLORS.bottom, 40, 'start', clamp01((end - 0.72) / 0.08) * (1 - cub * (1 - drop)))}
      </g>
    </svg>
  );
}

// The running total, held still at the top of the picture (text never zooms); the arithmetic of the why after it.
function Readout({ t }: { t: number }) {
  const r = readoutAt(t), shown = t >= SWEEP.t;
  const text = t >= BEATS.subtract ? 'area = ½ − ¼ = ¼' : t >= BEATS.cubic ? 'under x³ = ¼' : t >= BEATS.triangle ? 'under the line = ½'
    : t >= ANSWER_AT ? 'area = 0.25 = ¼' : `area ≈ ${r}`;
  const color = t >= BEATS.cubic && t < BEATS.subtract ? COLORS.bottom : t >= BEATS.triangle && t < BEATS.cubic ? COLORS.top : COLORS.area;
  return shown ? (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: BAND.top + 22, textAlign: 'center', opacity: clamp01((t - SWEEP.t) / 0.3) }}>
      <span style={{ display: 'inline-block', padding: '8px 34px', borderRadius: 40, background: tint(P.board, 0.92), boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`,
        border: `3px solid ${tint(color, 0.5)}`, color, ...hand(54) }}>{text}</span>
    </div>
  ) : null;
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Area between two curves:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: '∫ (top − bottom) dx' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel019({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  AREA UNDER CURVES'} lines={['Area between y = x and y = x³', 'from 0 to 1 is…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Graph t={t} />
        </div>
        <Readout t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-019-area-between-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
