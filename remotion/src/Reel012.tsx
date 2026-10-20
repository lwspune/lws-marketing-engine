// @lws.pune · reel 012 remade (predict-first): the angle keeps turning: sin²θ + cos²θ is…? White board, flat 2D, the zooms
// act on the picture. A point circles a circle of radius 1 with its right triangle (legs cos θ, sin θ); a stacked bar shows
// sin² and cos² trading places inside a total that never leaves 1; both waves draw themselves below, their sum a flat line.
// The live numbers sit in a fixed strip above (F9). Timeline and rules: lib/reel012.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, BAND, CIRCLE, BAR, GRAPH, CAMERA, thetaAt, pointAt, partsAt, drawnRanges,
} from './lib/reel012.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { t: 2.0, text: 'sin²θ + cos²θ = ?', y: 1590, size: 62 };   // half a turn not shown yet: no spoiler
const SIN = P.amber, COS = P.blue, SUM = P.green;
const rad = (d: number) => (d * Math.PI) / 180;
const gx = (deg: number) => GRAPH.x0 + (deg / 360) * (GRAPH.x1 - GRAPH.x0), gy = (v: number) => GRAPH.y0 - v * GRAPH.unit;
const wave = (f: (d: number) => number, a: number, b: number) => {
  const n = Math.max(2, Math.ceil((b - a) / 3));
  return Array.from({ length: n + 1 }, (_, i) => { const d = a + ((b - a) * i) / n; return `${i ? 'L' : 'M'}${gx(d).toFixed(1)},${gy(f(d)).toFixed(1)}`; }).join(' ');
};

function Picture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), [x, y] = pointAt(t), { sin2, cos2 } = partsAt(t), th = thetaAt(t);
  const won = prog(t, ANSWER_AT, 0.4), { x: cx, y: cy, r } = CIRCLE, px = cx + r * x, py = cy - r * y, d = ((th % 360) + 360) % 360;
  const hBottom = BAR.top + BAR.unit, hCos = cos2 * BAR.unit;
  const lab = (lx: number, ly: number, s: string, colour: string, size = 30, anchor: 'start' | 'middle' | 'end' = 'middle') =>
    <text x={lx} y={ly} textAnchor={anchor} fill={colour} style={{ ...hand(size) }}>{s}</text>;
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform={`translate(540 ${BAND.height / 2}) scale(${z}) translate(${-fx} ${-fy})`}>
        {/* the circle of radius 1 and its axes */}
        <line x1={cx - r - 30} y1={cy} x2={cx + r + 30} y2={cy} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={cx} y1={cy - r - 30} x2={cx} y2={cy + r + 30} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={tint(P.ink, 0.35)} strokeWidth={3} />
        {/* the right triangle: cos along, sin up, hypotenuse 1 */}
        <path d={`M${cx},${cy} L${px},${cy} L${px},${py} Z`} fill={tint(P.ink, 0.05)} />
        <line x1={cx} y1={cy} x2={px} y2={cy} stroke={COS} strokeWidth={8} strokeLinecap="round" />
        <line x1={px} y1={cy} x2={px} y2={py} stroke={SIN} strokeWidth={8} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={px} y2={py} stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
        {lab((cx + px) / 2 + 14 * x, (cy + py) / 2 - 14 * Math.sign(y || 1) - 6, '1', P.ink, 32)}
        <circle cx={px} cy={py} r={14} fill={P.ink} stroke={P.board} strokeWidth={4} />
        {lab(cx, cy + r + 66, `θ = ${Math.round(d)}°`, P.muted, 30)}
        {/* the stacked bar: cos² at the bottom, sin² on top, always exactly 1 tall */}
        <rect x={BAR.x} y={hBottom - hCos} width={BAR.w} height={hCos} fill={tint(COS, 0.75)} />
        <rect x={BAR.x} y={BAR.top} width={BAR.w} height={BAR.unit - hCos} fill={tint(SIN, 0.75)} />
        <rect x={BAR.x} y={BAR.top} width={BAR.w} height={BAR.unit} rx={14} fill="none" stroke={won > 0 ? SUM : tint(P.ink, 0.4)} strokeWidth={won > 0 ? 6 : 3} />
        <line x1={BAR.x - 30} y1={BAR.top} x2={BAR.x + BAR.w + 30} y2={BAR.top} stroke={SUM} strokeWidth={3} strokeDasharray="10 9" />
        {lab(BAR.x + BAR.w + 40, BAR.top + 10, '1', SUM, 36, 'start')}
        {BAR.unit - hCos > 46 && lab(BAR.x + BAR.w / 2, BAR.top + (BAR.unit - hCos) / 2 + 10, 'sin²', '#ffffff', 28)}
        {hCos > 46 && lab(BAR.x + BAR.w / 2, hBottom - hCos / 2 + 10, 'cos²', '#ffffff', 28)}
        {lab(BAR.x + BAR.w / 2, hBottom + 40, '0', P.muted, 26)}
        {/* the waves, drawn as the angle turns, and their sum: flat at 1 */}
        <line x1={GRAPH.x0} y1={GRAPH.y0} x2={GRAPH.x1 + 10} y2={GRAPH.y0} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={GRAPH.x0} y1={GRAPH.y0} x2={GRAPH.x0} y2={gy(1) - 20} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        {[90, 180, 270, 360].map(k => lab(gx(k), GRAPH.y0 + 34, `${k}°`, P.muted, 24))}
        {lab(GRAPH.x0 - 14, gy(1) + 8, '1', P.muted, 26, 'end')}{lab(GRAPH.x0 - 14, GRAPH.y0 + 8, '0', P.muted, 26, 'end')}
        {drawnRanges(t).map(([a, b], i) => (
          <g key={i}>
            <path d={wave(v => Math.cos(rad(v)) ** 2, a, b)} fill="none" stroke={COS} strokeWidth={5} strokeLinecap="round" />
            <path d={wave(v => Math.sin(rad(v)) ** 2, a, b)} fill="none" stroke={SIN} strokeWidth={5} strokeLinecap="round" />
            <path d={`M${gx(a)},${gy(1)} L${gx(b)},${gy(1)}`} stroke={SUM} strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={gx(d)} cy={gy(sin2)} r={10} fill={SIN} stroke={P.board} strokeWidth={3} />
        <circle cx={gx(d)} cy={gy(cos2)} r={10} fill={COS} stroke={P.board} strokeWidth={3} />
        <circle cx={gx(d)} cy={gy(1)} r={11} fill={SUM} stroke={P.board} strokeWidth={3} />
      </g>
    </svg>
  );
}

// The fixed strip: sin²θ + cos²θ = their sum, live (F9: labels stay still while the picture zooms).
function Readout({ t }: { t: number }) {
  const { sin2, cos2 } = partsAt(t), won = prog(t, ANSWER_AT, 0.4) > 0, num = { fontVariantNumeric: 'tabular-nums' as const };
  const part = (label: string, v: string, colour: string) => <><span style={{ color: colour }}>{label} </span><span style={{ color: colour, ...num }}>{v}</span></>;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 486, textAlign: 'center', ...hand(46), color: P.ink, opacity: prog(t, 0.2, 0.4), whiteSpace: 'pre' }}>
      {part('sin²θ', sin2.toFixed(2), SIN)}{'   +   '}{part('cos²θ', cos2.toFixed(2), COS)}{'   =   '}
      <span style={{ color: won ? SUM : P.ink, ...num }}>{(sin2 + cos2).toFixed(2)}</span>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Any angle at all:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'sin²θ + cos²θ = 1.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel012({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  TRIGONOMETRY'} lines={['The angle keeps turning.', 'sin²θ + cos²θ is…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <Readout t={t} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.05 }) }}>
          <Picture t={t} />
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-012-why-sin-cos-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
