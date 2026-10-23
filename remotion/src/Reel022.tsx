// @lws.pune · reel 022 (predict-first): x² + 6x: add what to make a perfect square? An NDA maths concept, white look.
// Tiles: a blue x² square and an orange 6x strip that splits from frame 0; one half lands beside the square, the other
// drops, slides under, turns and slides up; the dashed 3 × 3 corner fills green: 9 (B). The 9 lifts back out
// (x² + 6x = (x + 3)² − 9); the tiles shrink and a dot rides the parabola down to −9 with a live readout. Labels come
// from labelsAt(), the same list the overlap test checks. Timeline and checks: lib/reel022.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog, tween } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, CAMERA, SQUARE, GRAPH, RIDE, f, leftHalfAt, rightHalfAt, cornerAt,
  tileScale, tileShift, tileAlpha, gx, gy, dotX, readoutAt, labelsAt, type Label,
} from './lib/reel022.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: '6, 9 or 36?', y: 1590, size: 62 };
const BAND = { top: 470, height: 1030 };
const XL = -3 - Math.sqrt(14), XR = -3 + Math.sqrt(14);         // where the parabola leaves the y ≤ 5 window

const text = (l: Label) => <text key={`${l.text}${l.x}${l.y}`} x={l.x} y={l.y} textAnchor={l.anchor} fill={l.color} opacity={l.alpha} style={hand(l.size)}>{l.text}</text>;

function Picture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), l = leftHalfAt(t), r = rightHalfAt(t), k = cornerAt(t);
  const glow = prog(t, ANSWER_AT, 0.3) * (1 - prog(t, 6.2, 0.8)), graph = prog(t, GRAPH.t - 0.2, 0.3);
  const gap = r.cx - 60 - (l.x + l.w), whole = gap < 3 ? 1 : Math.max(0, 1 - (gap - 3) / 5);
  const xEnd = XL + (XR - XL) * prog(t, GRAPH.t, GRAPH.dur), dx = dotX(t), vertex = prog(t, RIDE.t + RIDE.dur, 0.4);
  const curve = xEnd <= XL ? '' : Array.from({ length: 121 }, (_, i) => { const x = XL + ((xEnd - XL) * i) / 120; return `${i ? 'L' : 'M'}${gx(x).toFixed(1)},${gy(f(x)).toFixed(1)}`; }).join(' ');
  const labels = labelsAt(t, P.ink, P.muted).filter(lb => lb.alpha > 0.01);
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform={`translate(540 515) scale(${z}) translate(${-fx} ${-fy})`}>
        {/* the tiles */}
        <g transform={`translate(0 ${tileShift(t)}) scale(${tileScale(t)})`} opacity={tileAlpha(t)}>
          <rect x={SQUARE.x} y={SQUARE.y} width={SQUARE.w} height={SQUARE.h} rx={10} fill={tint(COLORS.square, 0.28)} stroke={COLORS.square} strokeWidth={5} />
          <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={8} fill={tint(COLORS.strip, 0.3)} stroke={COLORS.strip} strokeWidth={5} />
          <g transform={`translate(${r.cx} ${r.cy}) rotate(${r.angle})`}>
            <rect x={-60} y={-180} width={120} height={360} rx={8} fill={tint(COLORS.strip, 0.3)} stroke={COLORS.strip} strokeWidth={5} />
          </g>
          {/* one whole 6x strip until the split visibly opens (no dividing line through "6x" on the cover) */}
          {whole > 0 && <rect x={l.x} y={150} width={940 - l.x} height={360} rx={8} opacity={whole} fill="#f5c8ae" /* orange at 0.3 over the board, the halves' look, opaque */ stroke={COLORS.strip} strokeWidth={5} />}
          {k.outline > 0 && <rect x={660} y={510} width={120} height={120} rx={8} fill="none" stroke={tint(COLORS.corner, 0.45 + 0.5 * k.pulse * k.outline)} strokeWidth={5} strokeDasharray="12 10" />}
          {k.fill > 0 && <rect x={k.x} y={k.y} width={120} height={120} rx={8} opacity={k.alpha} fill={tint(COLORS.corner, 0.5 * k.fill)} stroke={COLORS.corner} strokeWidth={5} />}
          {glow > 0 && <rect x={300} y={150} width={480} height={480} rx={12} fill="none" stroke={tint(COLORS.corner, 0.8 * glow)} strokeWidth={6} style={{ filter: `drop-shadow(0 0 14px ${tint(COLORS.corner, 0.7 * glow)})` }} />}
        </g>
        {/* the graph of x² + 6x */}
        {graph > 0 && <g opacity={graph}>
          <line x1={gx(-7)} y1={gy(0)} x2={gx(1)} y2={gy(0)} stroke={P.axis} strokeWidth={2.5} />
          <line x1={gx(0)} y1={gy(-11)} x2={gx(0)} y2={gy(5)} stroke={P.axis} strokeWidth={2.5} />
          <text x={gx(-3) - 12} y={gy(0) - 14} textAnchor="end" fill={P.muted} style={hand(30)}>−3</text>
          <text x={gx(0) + 12} y={gy(0) + 34} fill={P.muted} style={hand(30)}>0</text>
          <path d={curve} fill="none" stroke={COLORS.square} strokeWidth={7} strokeLinecap="round" />
          {vertex > 0 && <line x1={gx(-3)} y1={gy(-9)} x2={gx(-3)} y2={gy(0)} stroke={tint(COLORS.corner, 0.6 * vertex)} strokeWidth={3} strokeDasharray="10 9" />}
          {dx !== null && <circle cx={gx(dx)} cy={gy(f(dx))} r={13 + 6 * vertex} fill={COLORS.corner} stroke={P.board} strokeWidth={4}
            style={{ filter: vertex > 0 ? `drop-shadow(0 0 10px ${tint(COLORS.corner, 0.8 * vertex)})` : undefined }} />}
        </g>}
        {labels.filter(lb => !lb.fixed).map(text)}
      </g>
      {labels.filter(lb => lb.fixed).map(text)}
    </svg>
  );
}

// The live readout, held still at the top of the picture.
function Readout({ t }: { t: number }) {
  const r = readoutAt(t); if (!r) return null;
  const low = t >= RIDE.t + RIDE.dur;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: BAND.top + 22, textAlign: 'center', opacity: prog(t, RIDE.t, 0.3) }}>
      <span style={{ display: 'inline-block', padding: '8px 34px', borderRadius: 40, background: tint(P.board, 0.92), boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`,
        border: `3px solid ${tint(COLORS.corner, 0.5)}`, color: COLORS.corner, ...hand(52) }}>{low ? 'y = −9 (lowest)' : r}</span>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Completing the square:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'add (half the x number)².' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel022({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  QUADRATIC EQUATIONS'} lines={['x² + 6x: add what to make', 'a perfect square?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Picture t={t} />
        </div>
        <Readout t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-022-complete-square-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
