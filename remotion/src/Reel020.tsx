// @lws.pune · reel 020 (predict-first): this matrix reshapes the grid; the square's area becomes…? An NDA maths concept,
// white look. From frame 0 the plane's grid bends as [[2, 1], [1, 3]] takes over: î (red) lands on (2, 1), ĵ (blue) on
// (1, 3), the yellow unit square becomes a parallelogram and its live area counts 1 → 5 (B 5 = det). Two neighbour squares
// light up, ×5 each. Then [[2, 1], [4, 2]] squashes the plane onto a line: area 0, no inverse. Drawn in screen space from
// the maths. Timeline and checks: lib/reel020.ts.
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import { END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COLORS, COVER_T, BAND, CELLS, SQUASH, M, apply, matAt, areaAt, cam, toScreen, type Cam, type Mat } from './lib/reel020.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: '6, 5 or 7?', y: 1590, size: 62 };
const W = 1080, H = BAND.height;
const pts = (list: [number, number][], m: Mat, c: Cam) => list.map(p => toScreen(apply(m, p), c).map(v => v.toFixed(1)).join(',')).join(' ');
const cell = (i: number, j: number): [number, number][] => [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];

function Arrow({ m, to, color, label, c }: { m: Mat; to: [number, number]; color: string; label: string; c: Cam }) {
  const [x0, y0] = toScreen([0, 0], c), [x1, y1] = toScreen(apply(m, to), c);
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / len, uy = (y1 - y0) / len, head = Math.min(30, len * 0.4);
  const bx = x1 - ux * head, by = y1 - uy * head;
  return (
    <g>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <polygon points={`${x1},${y1} ${bx - uy * head * 0.55},${by + ux * head * 0.55} ${bx + uy * head * 0.55},${by - ux * head * 0.55}`} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={4} />
      <text x={x1 + ux * 30 + 6} y={y1 + uy * 30 + 14} textAnchor="middle" fill={color} style={hand(44)}>{label}</text>
    </g>
  );
}

function Plane({ t }: { t: number }) {
  const c = cam(t), m = matAt(t), out: React.ReactElement[] = [];
  // the plane before the matrix, faint, and after it, in cyan; the axes' images darker
  for (let k = -9; k <= 9; k++) {
    const [a, b] = [toScreen([k, -12], c), toScreen([k, 12], c)], [d, e] = [toScreen([-12, k], c), toScreen([12, k], c)];
    out.push(<line key={`gx${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={P.grid} strokeWidth={1.5} />);
    out.push(<line key={`gy${k}`} x1={d[0]} y1={d[1]} x2={e[0]} y2={e[1]} stroke={P.grid} strokeWidth={1.5} />);
  }
  for (let k = -9; k <= 9; k++) {
    const axis = k === 0, stroke = axis ? tint(P.ink, 0.55) : tint(COLORS.grid, 0.42), w = axis ? 3 : 2.5;
    const [a, b] = [toScreen(apply(m, [k, -12]), c), toScreen(apply(m, [k, 12]), c)], [d, e] = [toScreen(apply(m, [-12, k]), c), toScreen(apply(m, [12, k]), c)];
    out.push(<line key={`mx${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={w} />);
    out.push(<line key={`my${k}`} x1={d[0]} y1={d[1]} x2={e[0]} y2={e[1]} stroke={stroke} strokeWidth={w} />);
  }
  const fade = 1 - prog(t, SQUASH.t - 0.4, 0.4);
  const mid = (i: number, j: number) => toScreen(apply(m, [i + 0.5, j + 0.5]), c);
  const [sx, sy] = mid(0, 0), times = prog(t, ANSWER_AT, 0.4) * fade;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {out}
      {CELLS.map(cl => {
        const a = prog(t, cl.t, 0.4) * fade, [cx, cy] = mid(cl.i, cl.j);
        return a > 0 && <g key={cl.i} opacity={a}>
          <polygon points={pts(cell(cl.i, cl.j), m, c)} fill={tint(COLORS.square, 0.22)} stroke={tint(COLORS.square, 0.8)} strokeWidth={3} strokeLinejoin="round" />
          <text x={cx} y={cy + 18} textAnchor="middle" fill={COLORS.square} style={hand(52)}>5</text>
        </g>;
      })}
      <polygon points={pts(cell(0, 0), m, c)} fill={tint(COLORS.square, 0.34)} stroke={COLORS.square} strokeWidth={5} strokeLinejoin="round" />
      {times > 0 && <text x={sx} y={sy + 22} textAnchor="middle" fill={COLORS.square} opacity={times} style={hand(64)}>×5</text>}
      <Arrow m={m} to={[1, 0]} color={COLORS.i} label="î" c={c} />
      <Arrow m={m} to={[0, 1]} color={COLORS.j} label="ĵ" c={c} />
      <circle cx={toScreen([0, 0], c)[0]} cy={toScreen([0, 0], c)[1]} r={9} fill={P.ink} />
    </svg>
  );
}

// The matrix (the target from frame 0, live only while it squashes), its columns in î's and ĵ's colours (where they land),
// and the live area: both held still.
function Overlay({ t }: { t: number }) {
  const m = t < SQUASH.t ? M : matAt(t), a = areaAt(t);
  const num = (v: number) => (Math.abs(v - Math.round(v)) < 0.005 ? String(Math.round(v)) : v.toFixed(1));
  const area = t >= SQUASH.t + SQUASH.dur ? 'area = 0' : t >= ANSWER_AT && t < SQUASH.t ? 'area = 5 = det' : `area = ${a.toFixed(2)}`;
  const cellStyle = (color: string): React.CSSProperties => ({ width: 88, textAlign: 'center', color, ...hand(46) });
  return (
    <>
      <div style={{ position: 'absolute', left: 40, top: BAND.top + 18, padding: '6px 14px', borderRadius: 22, background: tint(P.board, 0.9),
        boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`, display: 'flex', alignItems: 'stretch', gap: 6 }}>
        <div style={{ width: 10, borderLeft: `4px solid ${P.ink}`, borderTop: `4px solid ${P.ink}`, borderBottom: `4px solid ${P.ink}`, borderRadius: '6px 0 0 6px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '88px 88px', columnGap: 6, rowGap: 2 }}>
          <div style={cellStyle(COLORS.i)}>{num(m[0][0])}</div><div style={cellStyle(COLORS.j)}>{num(m[0][1])}</div>
          <div style={cellStyle(COLORS.i)}>{num(m[1][0])}</div><div style={cellStyle(COLORS.j)}>{num(m[1][1])}</div>
        </div>
        <div style={{ width: 10, borderRight: `4px solid ${P.ink}`, borderTop: `4px solid ${P.ink}`, borderBottom: `4px solid ${P.ink}`, borderRadius: '0 6px 6px 0' }} />
      </div>
      <div style={{ position: 'absolute', left: 300, width: 740, top: BAND.top + 30, textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '8px 30px', borderRadius: 40, background: tint(P.board, 0.92), boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`,
          border: `3px solid ${tint(COLORS.square, 0.5)}`, color: COLORS.square, ...hand(52) }}>{area}</span>
      </div>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Determinant =' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'how much area scales.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel020({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  DETERMINANTS'} lines={['This matrix reshapes the grid.', 'The square’s area becomes…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: W, height: H, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Plane t={t} />
        </div>
        <Overlay t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-020-matrix-grid-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
