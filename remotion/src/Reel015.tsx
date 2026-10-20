// @lws.pune · reel 015 (predict-first): at the top of the hill, the slope graph is…? An NDA maths concept, white look.
// A tangent slides along f(x) = x³ − 3x from frame 0; its slope draws itself below as f′(x) = 3x² − 3, green where f
// rises, amber where it falls, the area filled in colour. At the peak and the valley the tangent goes flat and f′ = 0.
// Made with the @pyqvault_ framework v1.4 (flat 2D: zooms over the graphs); @lws.pune end card (no link, "Follow for more").
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { prog, captionAt, tween } from './lib/motion.ts';
import { END_AT, CAPTIONS, OPTIONS, ANSWER, ANSWER_AT, T_VALLEY, CAMERA, f, df, xAt, px, X0, SX, FY0, FSY, DY0, DSY } from './lib/reel015.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { t: 2.0, text: 'Top, zero or lowest?', y: 1590, size: 62 };   // tangent still climbing: no spoiler
const BAND = { top: 470, height: 1030 };
const fy = (x: number) => FY0 - f(x) * FSY, dy = (x: number) => DY0 - df(x) * DSY;
const slopeColor = (m: number) => (Math.abs(m) < 0.2 ? P.blue : m > 0 ? P.green : P.amber);

// Points of a function from a to b (a < b), as an SVG path.
const trace = (g: (x: number) => number, a: number, b: number, n = 80) =>
  b <= a ? '' : Array.from({ length: n + 1 }, (_, i) => { const x = a + ((b - a) * i) / n; return `${i ? 'L' : 'M'}${px(x).toFixed(1)},${g(x).toFixed(1)}`; }).join(' ');
// The traced part split where f′ changes sign (x = ±1), so each piece takes its own colour.
const pieces = (b: number) => ([[-2, -1, P.green], [-1, 1, P.amber], [1, 2, P.green]] as const)
  .filter(([lo]) => b > lo).map(([lo, hi, c]) => ({ lo, hi: Math.min(hi, b), c }));

function Graphs({ t }: { t: number }) {
  const x0 = xAt(t), m = df(x0), [z, fx, fyFocus] = tween(t, CAMERA.start, CAMERA.keys);   // on screen from frame 0 (F5)
  const dx = 160 / Math.hypot(1, (m * FSY) / SX), tx = px(x0), ty = fy(x0);
  const zeros = [[-1, ANSWER_AT], [1, T_VALLEY]] as const;
  const axis = (y: number) => <line x1={px(-2.15)} y1={y} x2={px(2.15)} y2={y} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />;
  const lab = (x: number, y: number, s: string, color: string = P.muted, size = 30, anchor: 'start' | 'middle' | 'end' = 'start') =>
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ ...hand(size) }}>{s}</text>;
  return (
    <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <clipPath id="above"><rect x={0} y={0} width={1080} height={DY0} /></clipPath>
        <clipPath id="below"><rect x={0} y={DY0} width={1080} height={BAND.height} /></clipPath>
      </defs>
      <g transform={`translate(540 500) scale(${z}) translate(${-fx} ${-fyFocus})`}>
        {/* f(x), above */}
        {axis(FY0)}<line x1={X0} y1={FY0 - 2.6 * FSY} x2={X0} y2={FY0 + 2.6 * FSY} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        {lab(px(-2.1), FY0 - 2.2 * FSY, 'f(x)', P.ink, 36)}
        <path d={trace(fy, -2, 2)} fill="none" stroke={tint(P.ink, 0.18)} strokeWidth={4} strokeLinecap="round" />
        {pieces(x0).map(p => <path key={p.lo} d={trace(fy, p.lo, p.hi)} fill="none" stroke={p.c} strokeWidth={7} strokeLinecap="round" />)}
        {/* f′(x), below: the slope, filled green above zero and amber below */}
        {axis(DY0)}<line x1={X0} y1={DY0 - 9.4 * DSY} x2={X0} y2={DY0 + 3.6 * DSY} stroke={P.axis} strokeWidth={2.5} strokeLinecap="round" />
        {lab(px(0.1), DY0 - 6.5 * DSY, 'f′(x) = slope', P.ink, 36)}
        {x0 > -2 && <>
          <path d={`${trace(dy, -2, x0)} L${px(x0)},${DY0} L${px(-2)},${DY0} Z`} fill={tint(P.green, 0.22)} clipPath="url(#above)" />
          <path d={`${trace(dy, -2, x0)} L${px(x0)},${DY0} L${px(-2)},${DY0} Z`} fill={tint(P.amber, 0.22)} clipPath="url(#below)" />
        </>}
        {pieces(x0).map(p => <path key={p.lo} d={trace(dy, p.lo, p.hi)} fill="none" stroke={p.c} strokeWidth={7} strokeLinecap="round" />)}
        {/* the zeros, once reached */}
        {zeros.map(([x, at]) => t >= at && <g key={x} opacity={prog(t, at, 0.4)}>
          <circle cx={px(x)} cy={DY0} r={16} fill={P.blue} style={{ filter: `drop-shadow(0 0 10px ${tint(P.blue, 0.8)})` }} />
          <circle cx={px(x)} cy={fy(x)} r={13} fill="none" stroke={P.blue} strokeWidth={5} />
          {lab(px(x), DY0 + 52, 'f′ = 0', P.blue, 32, 'middle')}
        </g>)}
        {/* the link from the tangent point down to its slope */}
        <line x1={tx} y1={ty} x2={tx} y2={dy(x0)} stroke={tint(P.ink, 0.25)} strokeWidth={2.5} strokeDasharray="8 10" />
        {/* the tangent and its point */}
        <line x1={tx - dx} y1={ty + (dx * m * FSY) / SX} x2={tx + dx} y2={ty - (dx * m * FSY) / SX} stroke={slopeColor(m)} strokeWidth={6} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={13} fill={slopeColor(m)} stroke={P.board} strokeWidth={4} />
        <circle cx={tx} cy={dy(x0)} r={12} fill={slopeColor(m)} stroke={P.board} strokeWidth={4} />
        {lab(x0 > 1.2 ? tx - 24 : tx + 24, ty - 26, `slope ${m >= 0 ? '+' : '−'}${Math.abs(m).toFixed(2)}`, slopeColor(m), 34, x0 > 1.2 ? 'end' : 'start')}
      </g>
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Every peak and valley:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the slope is 0.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel015({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  DERIVATIVES'} lines={['At the top of the hill,', 'the slope graph is…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Graphs t={t} />
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-015-slope-graph-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
