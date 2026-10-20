// @lws.pune · reel 011 remade (predict-first): double every number in a 2×2 matrix: its determinant? White board, flat 2D,
// the zooms act on the picture. The rows of A draw themselves as arrows (@remotion/paths) and the area between them is
// |det|; row 1 stretches, then row 2, and the copies tile it: 2, then 4. Then any k: a graph of area = 5k² draws itself
// while k sweeps 2 → 3 → 1. Timeline and rules: lib/reel011.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { WHITE as P, tint } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import {
  END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, A, T_ROW1, T_SWEEP, CAMERA, GRAPH, BAND, U, sx, sy, drawAt, rowsAt, areaAt, scaleAt,
} from './lib/reel011.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { t: 2.2, text: 'Determinant: ×2, ×4 or same?', y: 1590, size: 58 };   // row 1 mid-stretch: no spoiler
const R1 = P.blue, R2 = P.amber;
const fmt = (v: number) => (Math.abs(v - Math.round(v)) < 0.05 ? `${Math.round(v)}` : v.toFixed(1));

function Arrow({ x, y, colour, draw, label }: { x: number; y: number; colour: string; draw: number; label: string }) {
  const d = `M${sx(0)},${sy(0)} L${sx(x)},${sy(y)}`, ev = evolvePath(draw, d), ang = Math.atan2(-(y * U), x * U);
  return (
    <g>
      <path d={d} stroke={colour} strokeWidth={8} strokeLinecap="round" fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      {draw > 0.92 && <g transform={`translate(${sx(x)} ${sy(y)}) rotate(${(ang * 180) / Math.PI})`}>
        <path d="M 6 0 L -22 -14 L -22 14 Z" fill={colour} stroke={colour} strokeWidth={5} strokeLinejoin="round" />
      </g>}
      {draw > 0.92 && <text x={sx(x) + 16} y={sy(y) - 14} fill={colour} style={{ ...hand(30) }}>{label}</text>}
    </g>
  );
}

function Picture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), [[a, b], [c, d]] = rowsAt(t), [k1, k2] = scaleAt(t), draw = drawAt(t);
  const area = areaAt(t), won = prog(t, ANSWER_AT, 0.4), sweep = prog(t, T_SWEEP - 0.2, 0.6);
  const poly = `M${sx(0)},${sy(0)} L${sx(a)},${sy(b)} L${sx(a + c)},${sy(b + d)} L${sx(c)},${sy(d)} Z`;
  // the copies of the original parallelogram (before the sweep): split lines and a "5" in each whole copy
  const n1 = k1 >= 2 - 1e-6 ? 2 : 1, n2 = k2 >= 2 - 1e-6 ? 2 : 1, copies = t < T_SWEEP ? 1 - sweep : 0;
  const [p1, q1] = A[0], [p2, q2] = A[1];
  const gx = (k: number) => GRAPH.x0 + (k / GRAPH.kMax) * (GRAPH.x1 - GRAPH.x0), gy = (ar: number) => GRAPH.y0 - (ar / GRAPH.areaMax) * GRAPH.h;
  const curve = Array.from({ length: 65 }, (_, i) => { const k = (i / 64) * GRAPH.kMax; return `${i ? 'L' : 'M'}${gx(k).toFixed(1)},${gy(5 * k * k).toFixed(1)}`; }).join(' ');
  const ev = evolvePath(prog(t, T_SWEEP, 1.0), curve);
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <g transform={`translate(540 ${BAND.height / 2}) scale(${z}) translate(${-fx} ${-fy})`}>
        {/* faint grid, one unit per square */}
        {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={sx(i)} y1={sy(0)} x2={sx(i)} y2={sy(10)} stroke={P.grid} strokeWidth={1.5} />)}
        {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1={sx(0)} y1={sy(i)} x2={sx(13)} y2={sy(i)} stroke={P.grid} strokeWidth={1.5} />)}
        <path d={poly} fill={tint(won > 0 && t < T_SWEEP ? P.green : P.blue, 0.16 * Math.min(1, draw * 1.3))} stroke={tint(P.ink, 0.35)} strokeWidth={2.5} strokeLinejoin="round" />
        {copies > 0 && <g opacity={copies}>
          {k1 > 1.001 && <line x1={sx(p1)} y1={sy(q1)} x2={sx(p1 + c)} y2={sy(q1 + d)} stroke={tint(P.ink, 0.45)} strokeWidth={3} strokeDasharray="10 9" />}
          {k2 > 1.001 && <line x1={sx(p2)} y1={sy(q2)} x2={sx(p2 + a)} y2={sy(q2 + b)} stroke={tint(P.ink, 0.45)} strokeWidth={3} strokeDasharray="10 9" />}
          {Array.from({ length: n1 }, (_, i) => Array.from({ length: n2 }, (_, j) => (
            <text key={`${i}${j}`} x={sx((i + 0.5) * p1 + (j + 0.5) * p2)} y={sy((i + 0.5) * q1 + (j + 0.5) * q2) + 12} textAnchor="middle"
              fill={won > 0 ? P.green : P.muted} style={{ ...hand(36) }}>5</text>
          )))}
        </g>}
        <Arrow x={a} y={b} colour={R1} draw={draw} label="row 1" />
        <Arrow x={c} y={d} colour={R2} draw={draw} label="row 2" />
        {/* from the sweep: area against k, a graph that draws itself, with the live point */}
        {sweep > 0 && <g opacity={sweep}>
          <line x1={GRAPH.x0} y1={GRAPH.y0} x2={GRAPH.x1 + 10} y2={GRAPH.y0} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={GRAPH.x0} y1={GRAPH.y0} x2={GRAPH.x0} y2={GRAPH.y0 - GRAPH.h - 10} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
          <text x={GRAPH.x1 + 10} y={GRAPH.y0 + 34} textAnchor="end" fill={P.ink} style={{ ...hand(28) }}>k</text>
          <text x={GRAPH.x0 - 12} y={GRAPH.y0 - GRAPH.h + 4} textAnchor="end" fill={P.ink} style={{ ...hand(28) }}>area</text>
          <path d={curve} fill="none" stroke={P.blue} strokeWidth={5} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          {[1, 2, 3].map(k => <text key={k} x={gx(k)} y={GRAPH.y0 + 34} textAnchor="middle" fill={P.muted} style={{ ...hand(26) }}>{k}</text>)}
          {t >= T_SWEEP && <circle cx={gx(k1)} cy={gy(area)} r={12} fill={P.green} stroke={P.board} strokeWidth={4} />}
          <text x={gx(1.1)} y={gy(38)} fill={P.blue} style={{ ...hand(32) }}>area = 5 k²</text>
        </g>}
      </g>
    </svg>
  );
}

// The fixed strip above the picture: the matrix (live numbers, row colours) and its area = |det|. Not zoomed (F9).
function Readouts({ t }: { t: number }) {
  const [[a, b], [c, d]] = rowsAt(t), won = prog(t, ANSWER_AT, 0.4) > 0 && t < T_SWEEP, num = { fontVariantNumeric: 'tabular-nums' as const };
  // the matrix's name says what it is: A, then (one row stretched) no name, then 2A, then kA in the sweep
  const name = t < T_ROW1 ? 'A =' : t < ANSWER_AT ? '' : t < T_SWEEP ? '2A =' : 'kA =';
  return (
    <svg width={1080} height={150} style={{ position: 'absolute', left: 0, top: 462 }}>
      <g style={num} opacity={prog(t, 0.2, 0.4)}>
        <text x={170} y={92} textAnchor='end' fill={P.ink} style={{ ...hand(42) }}>{name}</text>
        <path d='M 196 30 h -12 v 100 h 12 M 372 30 h 12 v 100 h -12' fill='none' stroke={P.ink} strokeWidth={4} strokeLinecap='round' />
        <text x={242} y={72} textAnchor='middle' fill={R1} style={{ ...hand(40) }}>{fmt(a)}</text>
        <text x={326} y={72} textAnchor='middle' fill={R1} style={{ ...hand(40) }}>{fmt(b)}</text>
        <text x={242} y={120} textAnchor='middle' fill={R2} style={{ ...hand(40) }}>{fmt(c)}</text>
        <text x={326} y={120} textAnchor='middle' fill={R2} style={{ ...hand(40) }}>{fmt(d)}</text>
        <text x={990} y={52} textAnchor='end' fill={P.muted} style={{ ...hand(30) }}>area = |det|</text>
        <text x={990} y={124} textAnchor='end' fill={won ? P.green : P.ink} style={{ ...hand(70) }}>{fmt(areaAt(t))}</text>
      </g>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Double a 2×2 matrix:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the determinant goes ×4.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel011({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  DETERMINANTS'} lines={['Double every number in a 2×2 matrix.', 'Its determinant becomes…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={50} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.05 }) }}>
          <Picture t={t} />
        </div>
        <Readouts t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-011-why-det-area-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
