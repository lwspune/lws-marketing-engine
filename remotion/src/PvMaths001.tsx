// @pyqvault_ · Maths, visualised #1: sine and cosine in motion, and why cos θ = sin(θ + 90°). White look (L22 rotation).
// A point goes once round a circle; its height draws the sine wave (right), its width the cosine wave (down). Then the
// cosine wave turns onto the sine axes and slides 90° right, landing exactly on the sine wave.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { prog, clamp01, captionAt } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, CIRCLE, SINE, COSV, thetaAt, pointAt, sinPen, cosPen, cosCurve, sinCurve, morphAt, slideAt,
} from './lib/pm001.ts';
import { Board, Caption, MathRow, EndCard, TitleCard, hand, useFonts, type EndLine } from './board.tsx';

const TAU = 2 * Math.PI, DEG = 180 / Math.PI;
const COVER = { t: 11.6, text: 'Where do sin and cos\ncome from?', y: 1580, size: 58 };
const path = (pts: { x: number; y: number }[]) => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');
const upto = (th: number) => { const n = Math.max(2, Math.ceil((th / TAU) * 160) + 1); return Array.from({ length: n }, (_, i) => (th * i) / (n - 1)); };

function Scene({ t }: { t: number }) {
  const a = prog(t, 3.0, 0.6), th = thetaAt(t), p = pointAt(th), k = morphAt(t), s = slideAt(t);
  const traced = th > 0.001, landed = prog(t, 20.6, 0.5), live = 1 - prog(t, 15.6, 0.5); // the point's guides fade after the turn
  const circleDraw = prog(t, 3.0, 0.9), C = 2 * Math.PI * CIRCLE.r;
  const tick = (x: number, y: number, label: string, anchor: 'middle' | 'start' = 'middle') =>
    <text x={x} y={y} textAnchor={anchor} fill={P.muted} style={{ ...hand(28) }}>{label}</text>;
  const sx = (deg: number) => SINE.x0 + (deg / DEG) * SINE.k, cy = (deg: number) => COSV.y0 + (deg / DEG) * COSV.k;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: a }}>
      <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
      {/* axes: circle, sine (right), cosine (down) */}
      <line x1={CIRCLE.cx - CIRCLE.r - 30} y1={CIRCLE.cy} x2={SINE.x0 + TAU * SINE.k + 130} y2={CIRCLE.cy} stroke={P.axis} strokeWidth={2} />
      <line x1={CIRCLE.cx} y1={CIRCLE.cy - CIRCLE.r - 30} x2={CIRCLE.cx} y2={COSV.y0 + TAU * COSV.k + 24} stroke={P.axis} strokeWidth={2} opacity={1 - k} />
      {[90, 180, 270, 360].map(d => <g key={d}>{tick(sx(d), CIRCLE.cy + CIRCLE.r + 44, `${d}°`)}
        <line x1={sx(d)} y1={CIRCLE.cy - 6} x2={sx(d)} y2={CIRCLE.cy + 6} stroke={P.axis} strokeWidth={2} /></g>)}
      <g opacity={1 - k}>{[90, 180, 270, 360].map(d => <g key={d}>{tick(CIRCLE.cx + CIRCLE.r + 22, cy(d) + 9, `${d}°`, 'start')}
        <line x1={CIRCLE.cx - 6} y1={cy(d)} x2={CIRCLE.cx + 6} y2={cy(d)} stroke={P.axis} strokeWidth={2} /></g>)}</g>
      {tick(SINE.x0 - 22, CIRCLE.cy - CIRCLE.r + 9, '1', 'middle')}{tick(SINE.x0 - 22, CIRCLE.cy + CIRCLE.r + 40, '−1', 'middle')}
      {/* the circle */}
      <circle cx={CIRCLE.cx} cy={CIRCLE.cy} r={CIRCLE.r} fill="none" stroke={tint(P.ink, 0.55)} strokeWidth={4}
        strokeDasharray={C} strokeDashoffset={C * (1 - circleDraw)} transform={`rotate(0 ${CIRCLE.cx} ${CIRCLE.cy})`} />
      {/* the sine wave so far, and the cosine wave (vertical, then turning and sliding onto the sine axes) */}
      {traced && <path d={path(upto(th).map(sinPen))} fill="none" stroke={P.green} strokeWidth={6} strokeLinecap="round" />}
      {traced && k === 0 && <path d={path(upto(th).map(cosPen))} fill="none" stroke={P.blue} strokeWidth={6} strokeLinecap="round" />}
      {k > 0 && <>
        {landed > 0 && <path d={path(sinCurve())} fill="none" stroke={P.green} strokeWidth={16} opacity={0.35 * landed * (1 - prog(t, 22.5, 1.5))} filter="url(#glow)" />}
        <path d={path(cosCurve(k, s))} fill="none" stroke={P.blue} strokeWidth={6} strokeLinecap="round" strokeDasharray={landed > 0 ? '14 12' : undefined} />
      </>}
      {/* the 90° gap between the cosine peak (θ = 0) and the sine peak (θ = 90°), while it slides */}
      {k >= 1 && t < 21.2 && (() => {
        const y = SINE.y0 - SINE.amp - 34, x1 = SINE.x0 + s * (Math.PI / 2) * SINE.k, x2 = sx(90), o = clamp01((t - 18.2) / 0.4) * (1 - prog(t, 20.7, 0.4));
        return <g opacity={o}>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={P.amber} strokeWidth={4} />
          <line x1={x1} y1={y - 10} x2={x1} y2={y + 10} stroke={P.amber} strokeWidth={4} /><line x1={x2} y1={y - 10} x2={x2} y2={y + 10} stroke={P.amber} strokeWidth={4} />
          <text x={(x1 + x2) / 2 + (x2 - x1 < 30 ? 40 : 0)} y={y - 16} textAnchor="middle" fill={P.amber} style={{ ...hand(34) }}>90°</text>
        </g>;
      })()}
      {/* the point, its radius, its height (sin) and width (cos), and the guides to the two pens */}
      <g opacity={live}>
        <line x1={p.x} y1={p.y} x2={sinPen(th).x} y2={p.y} stroke={P.green} strokeWidth={2.5} strokeDasharray="8 8" />
        <line x1={p.x} y1={p.y} x2={p.x} y2={cosPen(th).y} stroke={P.blue} strokeWidth={2.5} strokeDasharray="8 8" />
        <line x1={CIRCLE.cx} y1={CIRCLE.cy} x2={p.x} y2={p.y} stroke={P.ink} strokeWidth={4} />
        <line x1={p.x} y1={CIRCLE.cy} x2={p.x} y2={p.y} stroke={P.green} strokeWidth={7} strokeLinecap="round" />
        <line x1={CIRCLE.cx} y1={CIRCLE.cy} x2={p.x} y2={CIRCLE.cy} stroke={P.blue} strokeWidth={7} strokeLinecap="round" />
        <circle cx={sinPen(th).x} cy={p.y} r={10} fill={P.green} /><circle cx={p.x} cy={cosPen(th).y} r={10} fill={P.blue} />
        <circle cx={p.x} cy={p.y} r={14} fill={P.ink} stroke="#fff" strokeWidth={4} />
      </g>
    </svg>
  );
}

function Readouts({ t }: { t: number }) {
  const th = thetaAt(t), a = prog(t, 4.6, 0.5) * (1 - prog(t, 15.6, 0.5)), num = { fontVariantNumeric: 'tabular-nums' as const };
  const f = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2).replace('-', '−');
  return (
    <>
      <MathRow y={1490} size={44} opacity={a}>
        <span style={{ marginRight: 46 }}>θ = <span style={{ ...num, display: 'inline-block', width: 90, textAlign: 'right' }}>{Math.round(th * DEG)}°</span></span>
        <span style={{ color: P.green, marginRight: 46 }}>sin θ = <span style={{ ...num, display: 'inline-block', width: 96, textAlign: 'right' }}>{f(Math.sin(th))}</span></span>
        <span style={{ color: P.blue }}>cos θ = <span style={{ ...num, display: 'inline-block', width: 96, textAlign: 'right' }}>{f(Math.cos(th))}</span></span>
      </MathRow>
      <MathRow y={1490} size={58} opacity={prog(t, 21.0, 0.5)}>
        <span style={{ color: P.blue }}>cos θ</span>{' = '}<span style={{ color: P.green }}>sin(θ + 90°)</span>
      </MathRow>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'One circle, two waves.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the maths.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #2' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvMaths001({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill>
      <Board watermark={false} />
      <TitleCard t={t} label={'MATHS, VISUALISED  #1'} lines={['Where do the sin and', 'cos waves come from?']} size={70} />
      <Scene t={t} />
      {!cover && <Readouts t={t} />}
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1600} />}
      {!cover && <EndCard t={t} at={END_AT} lines={END} />}
      {!cover && <Html5Audio src={staticFile('pv-maths-001-sin-cos.wav')} />}
    </AbsoluteFill>
  );
}
