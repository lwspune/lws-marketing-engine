// @lws.pune · reel 025 (predict-first, F32–F33): 256 balls, 8 rows of pegs; which bin fills most? A Galton board on the
// white look. From frame 0 blue balls rain through the pegs and stack in nine bins with live counts; the middle wins
// (A). Then one orange path to the edge bin, a green web of 70 paths into the middle, Pascal's numbers on the pegs and
// bins, the expected piles (⁸Cₖ) dropping onto the real ones, and one path as coin tosses (H/T). Timeline: lib/reel025.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog, tween } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, CAMERA, ROWS, BALLS, BALL_R, PEG_R, DISC_R, WALL_TOP, FLOOR,
  FLAT_AT, EXPECTED_AT, EDGE_PATH, MIDDLE_PATHS, COIN_PATH, FLAT, TRAP_OUT, DIM, EDGE, EXPECTED, COIN, ballAt, pegX, pegY, binX,
  pileHeight, pathPoints, webPathAt, numberAlpha, labelsAt, labelBox,
} from './lib/reel025.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Middle, edges or all equal?', y: 1590, size: 60 };
const BAND = { top: 470, height: 1030 };
type Pt = { x: number; y: number };

/** The first fraction p (by length) of a polyline, as an SVG path, plus where its head is. */
function partial(pts: Pt[], p: number) {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y)), total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, p)), d = `M${pts[0].x},${pts[0].y}`, head = pts[0];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i]), a = pts[i], b = pts[i + 1];
    head = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    d += ` L${head.x.toFixed(1)},${head.y.toFixed(1)}`; left -= seg[i];
  }
  return { d, head };
}

function BoardLayer({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys);
  const ballA = 1 - 0.75 * prog(t, DIM.t, DIM.dur) + 0.75 * prog(t, EXPECTED.t, 0.4);
  const flatY = FLOOR - pileHeight(FLAT_AT), flatA = prog(t, FLAT.t, 0.2) * (1 - prog(t, TRAP_OUT, 0.3));
  const pathsA = 1 - prog(t, 12.8, 0.4), drop = prog(t, EXPECTED.t, EXPECTED.dur);
  const labels = labelsAt(t).filter(l => l.role !== 'readout' && l.alpha > 0.01);
  const flash = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - ANSWER_AT) / 0.8)));
  return (
    <g transform={`translate(540 515) scale(${z}) translate(${-fx} ${-fy})`}>
      {/* bins: ten walls on a floor */}
      {Array.from({ length: ROWS + 2 }, (_, i) => 72 + 104 * i).map(x =>
        <line key={x} x1={x} y1={WALL_TOP} x2={x} y2={FLOOR} stroke={P.axis} strokeWidth={4} strokeLinecap="round" />)}
      <line x1={72} y1={FLOOR + 2} x2={1008} y2={FLOOR + 2} stroke={P.axis} strokeWidth={4} strokeLinecap="round" />
      {/* pegs */}
      {Array.from({ length: ROWS }, (_, r) => Array.from({ length: r + 1 }, (_, j) =>
        <circle key={`${r}-${j}`} cx={pegX(r, j)} cy={pegY(r)} r={PEG_R} fill={tint(P.ink, 0.45)} />))}
      {/* the trap: every bin equal */}
      {flatA > 0 && <line x1={72} y1={flatY} x2={72 + 936 * prog(t, FLAT.t, FLAT.dur)} y2={flatY} stroke={P.muted} strokeWidth={4}
        strokeDasharray="14 10" opacity={flatA} />}
      {/* the balls */}
      <g opacity={ballA} style={{ filter: flash > 0 ? `drop-shadow(0 0 ${10 * flash}px ${tint(COLORS.ball, 0.6 * flash)})` : undefined }}>
        {BALLS.map((b, i) => { const p = ballAt(b, t); return p && <circle key={i} cx={p.x} cy={p.y} r={BALL_R} fill={COLORS.ball} />; })}
      </g>
      {/* the expected piles: ⁸Cₖ balls each */}
      {drop > 0 && EXPECTED_AT.map((n, k) => {
        const h = pileHeight(n) + 4;
        return <rect key={k} x={binX(k) - 49} y={FLOOR - h - 120 * (1 - drop)} width={98} height={h} rx={10} fill="none"
          stroke={COLORS.web} strokeWidth={4} strokeDasharray="12 8" opacity={drop} />;
      })}
      {/* one path to the edge; the web of 70 into the middle */}
      {t >= EDGE.t && pathsA > 0 && (() => {
        const e = partial(pathPoints(EDGE_PATH), prog(t, EDGE.t, EDGE.dur));
        return <g opacity={pathsA}>
          {MIDDLE_PATHS.map((s, i) => { const p = webPathAt(i, t); if (p <= 0) return null; const w = partial(pathPoints(s), p);
            return <g key={i}><path d={w.d} fill="none" stroke={COLORS.web} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.16} />
              {p < 1 && <circle cx={w.head.x} cy={w.head.y} r={7} fill={COLORS.web} />}</g>; })}
          <path d={e.d} fill="none" stroke={COLORS.edge} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </g>;
      })()}
      {/* the coin path */}
      {t >= COIN.t && (() => {
        const c = partial(pathPoints(COIN_PATH), prog(t, COIN.t, COIN.dur));
        return <g opacity={1 - prog(t, END_AT - 0.3, 0.3)}>
          <path d={c.d} fill="none" stroke={COLORS.edge} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={c.head.x} cy={c.head.y} r={9} fill={COLORS.edge} />
        </g>;
      })()}
      {/* white discs under the peg numbers */}
      {Array.from({ length: ROWS }, (_, r) => Array.from({ length: r + 1 }, (_, j) => {
        const a = numberAlpha(r, t) * (1 - prog(t, EXPECTED.t, 0.4));
        return a > 0.01 && <circle key={`d${r}-${j}`} cx={pegX(r, j)} cy={pegY(r)} r={DISC_R * (0.6 + 0.4 * a)} fill="#ffffff" opacity={a}
          style={{ filter: `drop-shadow(0 3px 6px ${tint(P.ink, 0.12)})` }} />;
      }))}
      {labels.filter(l => l.role === 'tag').map(l => { const b = labelBox(l);
        return <rect key="tagpill" x={b.x0 - 12} y={b.y0 - 6} width={b.x1 - b.x0 + 24} height={b.y1 - b.y0 + 12} rx={18} fill={tint(P.board, 0.92)} opacity={l.alpha} />; })}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor={l.anchor} opacity={l.alpha} style={{ ...hand(l.size), fontWeight: l.role === 'bin' || l.role === 'tag' ? 800 : 600 }}
          fill={l.role === 'count' ? P.muted : l.role === 'bin' ? COLORS.web : l.role === 'tag' ? P.muted : P.ink}>{l.text}</text>
      ))}
    </g>
  );
}

function Readout({ t }: { t: number }) {
  const l = labelsAt(t).find(x => x.role === 'readout')!;
  return <text x={l.x} y={l.y} textAnchor="start" fill={P.ink} style={hand(l.size)}>{l.text}</text>;
}

const END: EndLine[] = [
  { at: 0.3, size: 58, weight: 600, color: P.ink, text: 'Most paths,' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'most balls.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel025({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  PROBABILITY'} lines={['256 balls, 8 rows of pegs.', 'Which bin fills most?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={240} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.03 }) }}>
          <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
            <BoardLayer t={t} />
            <Readout t={t} />
          </svg>
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-025-galton-board-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
