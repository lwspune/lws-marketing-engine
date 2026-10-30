// @pyqvault_ · Maths, visualised #5: where the derivative comes from, in the studied reel's look (black board, green
// curve, gold h, white chord → tangent, the formula above, word-by-word captions). Flat SVG. Timeline and maths:
// lib/pm005.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SOFT_UI } from './lib/palette.ts';
import {
  COLORS, COVER_T, DURATION, END, F, GRAPH, LAYOUT, X0, captionAt, chordEnds, counterAt, endAlphaAt, figureAlphaAt, formulaAt,
  sceneAt, toScreen,
} from './lib/pm005.ts';
import { useFonts } from './board.tsx';

const W = 1080, H = 1920;
const MATH = `'Cambria Math', Cambria, serif`;

/** Maths text: letters in italic, h in gold, everything else upright. */
function M({ s, size, color = COLORS.text }: { s: string; size: number; color?: string }) {
  return <span style={{ font: `400 ${size}px ${MATH}`, color, whiteSpace: 'pre' }}>
    {[...s].map((ch, i) => /[a-z]/.test(ch)
      ? <i key={i} style={{ color: ch === 'h' ? COLORS.gold : color, marginRight: ch === 'f' ? '0.12em' : 0 }}>{ch}</i>
      : <span key={i}>{ch}</span>)}
  </span>;
}

function Frac({ top, size }: { top: string; size: number }) {
  return <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 6px' }}>
    <M s={top} size={size} />
    <span style={{ alignSelf: 'stretch', height: 3, background: COLORS.text, margin: '4px 0' }} />
    <M s="h" size={size} />
  </span>;
}

function Lim({ size }: { size: number }) {
  return <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', marginRight: 10 }}>
    <span style={{ font: `400 ${size}px ${MATH}`, color: COLORS.text }}>lim</span>
    <M s="h → 0" size={size * 0.5} />
  </span>;
}

function Formula({ t }: { t: number }) {
  const f = formulaAt(t);
  if (!f) return null;
  const size = 80;
  const body = f.stage === 'neq' ? <><M s="f(x + h)" size={size} /><M s="  ≠  " size={size} color={COLORS.gold} /><M s="f(x) + h" size={size} /></>
    : f.stage === 'climb' ? <M s="f(x + h) − f(x)" size={size} />
    : <>{f.stage === 'derivative' && <M s="f′(x) = " size={size} />}{f.stage !== 'quotient' && <Lim size={size} />}<Frac top="f(x + h) − f(x)" size={size} /></>;
  return <div style={{ position: 'absolute', left: 0, width: W, top: LAYOUT.formulaY - 70, height: 180, display: 'flex', alignItems: 'center',
    justifyContent: 'center', opacity: f.alpha }}>{body}</div>;
}

function Figure({ t }: { t: number }) {
  const s = sceneAt(t), h = s.h, o = toScreen([0, 0]);
  const P = toScreen([X0, F(X0)]), Q = toScreen([X0 + h, F(X0 + h)]), corner = toScreen([X0 + h, F(X0)]);
  const top = toScreen([0, GRAPH.y1]), right = toScreen([GRAPH.x1, 0]);
  const pts = Array.from({ length: 121 }, (_, i) => toScreen([GRAPH.x0 + (i / 120) * (GRAPH.x1 - GRAPH.x0), F(GRAPH.x0 + (i / 120) * (GRAPH.x1 - GRAPH.x0))]));
  const [ca, cb] = chordEnds(h).map(p => toScreen(p));
  const cm = [ca[0] + (cb[0] - ca[0]) * s.chord, ca[1] + (cb[1] - ca[1]) * s.chord];
  const dash = { stroke: COLORS.guide, strokeWidth: 3, strokeDasharray: '7 9', opacity: 0.7 };
  const label = (x: number, y: number, text: string, a: number, anchor: 'start' | 'middle' | 'end') => a > 0.01 &&
    <div style={{ position: 'absolute', top: y - 36, opacity: a, ...(anchor === 'end' ? { right: W - x } : anchor === 'start' ? { left: x } : { left: x - 150, width: 300, textAlign: 'center' }) }}>
      <M s={text} size={56} color={COLORS.text} /></div>;
  return <div style={{ position: 'absolute', inset: 0, opacity: figureAlphaAt(t) }}>
    <svg width={W} height={H} style={{ position: 'absolute' }}>
      <defs><filter id="glow" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><feGaussianBlur stdDeviation="6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {/* axes */}
      <line x1={o[0]} y1={o[1]} x2={o[0]} y2={o[1] - (o[1] - top[1]) * s.axes} stroke={COLORS.axis} strokeWidth={4} />
      <line x1={o[0]} y1={o[1]} x2={o[0] + (right[0] - o[0]) * s.axes} y2={o[1]} stroke={COLORS.axis} strokeWidth={4} />
      {/* the curve, drawn from the left */}
      <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={COLORS.curve} strokeWidth={14} strokeLinecap="round"
        pathLength={1} strokeDasharray={`${s.curve} 1`} />
      {/* guides at x and x + h */}
      {s.xLabel > 0 && <line x1={P[0]} y1={P[1]} x2={P[0]} y2={o[1]} {...dash} opacity={0.7 * s.xLabel} />}
      {s.fx > 0 && <line x1={o[0]} y1={P[1]} x2={P[0]} y2={P[1]} {...dash} opacity={0.7 * s.fx} />}
      {s.xhLabel > 0 && <line x1={Q[0]} y1={Q[1]} x2={Q[0]} y2={o[1]} {...dash} opacity={0.7 * s.xhLabel} />}
      {s.fxh > 0 && <line x1={o[0]} y1={Q[1]} x2={Q[0]} y2={Q[1]} {...dash} opacity={0.7 * s.fxh} />}
      {/* the chord (white), which becomes the tangent */}
      {s.chord > 0 && <line x1={ca[0]} y1={ca[1]} x2={cm[0]} y2={cm[1]} stroke={COLORS.chord} strokeWidth={9 + 4 * s.chordGlow} strokeLinecap="round"
        filter={s.chordGlow > 0.05 ? 'url(#glow)' : undefined} />}
      {/* the step h (gold) and the rise */}
      {s.step > 0 && <line x1={P[0]} y1={P[1]} x2={P[0] + (corner[0] - P[0]) * s.step} y2={P[1]} stroke={COLORS.gold} strokeWidth={11 + 4 * s.runGlow}
        strokeLinecap="round" filter={s.runGlow > 0.05 ? 'url(#glow)' : undefined} />}
      {s.rise > 0 && <line x1={corner[0]} y1={corner[1]} x2={corner[0]} y2={corner[1] + (Q[1] - corner[1]) * s.rise} stroke={COLORS.gold}
        strokeWidth={11 + 4 * s.riseGlow} strokeLinecap="round" filter={s.riseGlow > 0.05 ? 'url(#glow)' : undefined} />}
      {/* the points */}
      {s.q > 0 && <circle cx={Q[0]} cy={Q[1]} r={15 * s.q} fill={COLORS.gold} />}
      {s.p > 0 && <circle cx={P[0]} cy={P[1]} r={15 * s.p} fill="#ffffff" />}
    </svg>
    {label(P[0], o[1] + LAYOUT.labelGap, 'x', s.xLabel, 'middle')}
    {label(Q[0], o[1] + LAYOUT.labelGap, 'x + h', s.xhLabel, 'middle')}
    {label(o[0] - 18, P[1], 'f(x)', s.fx, 'end')}
    {label(o[0] - 18, Q[1], 'f(x + h)', s.fxh, 'end')}
    {label((P[0] + corner[0]) / 2, P[1] + 52, 'h', s.hLabel, 'middle')}
  </div>;
}

function Counter({ t }: { t: number }) {
  const c = counterAt(t);
  if (!c) return null;
  const [x, y] = toScreen([0, GRAPH.y1]);
  return <div style={{ position: 'absolute', left: x + 40, top: y + 10, opacity: c.alpha * figureAlphaAt(t) }}>
    <span style={{ font: `400 60px ${MATH}`, color: COLORS.gold }}><i>h</i> = {c.text.slice(4)}</span>
  </div>;
}

function Caption({ t }: { t: number }) {
  const c = captionAt(t);
  if (!c) return null;
  return <div style={{ position: 'absolute', left: 0, width: W, top: LAYOUT.captionY - 45, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: COLORS.pill, borderRadius: 14, padding: '18px 36px', font: `700 66px ${SOFT_UI}`, whiteSpace: 'pre' }}>
      {c.words.map((w, i) => <span key={i} style={{ color: i === c.active ? COLORS.gold : '#ffffff' }}>{i ? ' ' : ''}{w}</span>)}
    </div>
  </div>;
}

function EndCard({ t }: { t: number }) {
  const a = endAlphaAt(t);
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', left: 0, width: W, top: 760, textAlign: 'center', opacity: a }}>
    <div style={{ font: `700 104px ${SOFT_UI}`, color: '#ffffff' }}>{END.title}</div>
    <div style={{ font: `700 36px ${SOFT_UI}`, color: COLORS.curve, letterSpacing: 4, marginTop: 18 }}>{END.series}</div>
    <div style={{ font: `600 40px ${SOFT_UI}`, color: COLORS.guide, marginTop: 40 }}>{END.site}</div>
  </div>;
}

/** Cover: the chord and its slope, the question above. */
function CoverTitle() {
  return <div style={{ position: 'absolute', left: 60, width: W - 120, top: 250, textAlign: 'center', font: `800 70px ${SOFT_UI}`, color: '#ffffff', lineHeight: 1.15 }}>
    Where do derivatives <span style={{ color: COLORS.gold }}>really</span> come from?</div>;
}

export function PvMaths005({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : Math.min(frame / fps, DURATION);
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Figure t={t} />
      {cover ? <CoverTitle /> : <Formula t={t} />}
      {!cover && <Counter t={t} />}
      {!cover && <Caption t={t} />}
      {!cover && <EndCard t={t} />}
      {!cover && <Html5Audio src={staticFile('pv-maths-005-first-principles-voice-mix.wav')} />}
    </AbsoluteFill>
  );
}
