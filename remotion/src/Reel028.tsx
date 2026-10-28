// @lws.pune · reel 028 in the studied reel's own look (founder, 2026-10-28): a dark starfield, a glowing cyan circle,
// flat neon lines drawn as the narration names them, one coloured title per step, their ripple, glow and glitch; cot and
// cosec drawn correctly. Flat SVG, no 3D. Timeline, geometry and words: lib/reel028.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SOFT_UI } from './lib/palette.ts';
import { prog } from './lib/motion.ts';
import {
  CENTRE, R, COLORS, DURATION, COVER_T, THETA_DEG, TITLE_Y, TITLE_SIZE, SUBTITLE_Y, SUBTITLE_SIZE, DRAW, figure, toScreen,
  segmentsAt, labelsAt, titleAt, subtitleAt, rippleAt, glowAt, glitchAt, cutFlashAt, arrowAt, angleAt, circleDrawn, zoomAt,
} from './lib/reel028.ts';
import { useFonts } from './board.tsx';

const W = 1080, H = 1920;
// a seeded starfield (the same every render)
const STARS = (() => {
  let s = 28; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 150 }, () => ({ x: rnd() * W, y: rnd() * H, r: 0.8 + rnd() * 1.8, a: 0.15 + rnd() * 0.5, ph: rnd() * 6.28 }));
})();

function Stars({ t, glow }: { t: number; glow: number }) {
  return <svg width={W} height={H} style={{ position: 'absolute' }}>
    <defs><radialGradient id="wash" cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.35 + 0.45 * glow} /><stop offset="100%" stopColor={COLORS.bg} stopOpacity={0} /></radialGradient></defs>
    <rect width={W} height={H} fill={COLORS.bg} />
    <rect width={W} height={H} fill="url(#wash)" />
    {STARS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#cbd5e1" opacity={p.a * (0.7 + 0.3 * Math.sin(t * 1.3 + p.ph))} />)}
  </svg>;
}

/** The figure: axes, circle, the lines as far as they are drawn, the angle mark, the point on the circle. */
function Figure({ t }: { t: number }) {
  const f = figure(THETA_DEG), O = CENTRE, P = toScreen(figure(Math.max(angleAt(t), 0.0001)).P), c = circleDrawn(t);
  const ripple = rippleAt(t), glow = glowAt(t), cut = cutFlashAt(t), deg = angleAt(t), circ = 2 * Math.PI * R;
  const arc = (r: number, a0: number, a1: number) => {
    const p = (a: number) => [O[0] + r * Math.cos(a), O[1] - r * Math.sin(a)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1} ${y1}`;
  };
  const B = toScreen(f.B), arrow = arrowAt(t);
  return <svg width={W} height={H} style={{ position: 'absolute' }}>
    <defs>
      {/* in frame units: a straight vertical or horizontal line has a zero-width box, which would hide it */}
      <filter id="glow" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="halo" filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><feGaussianBlur stdDeviation="12" /></filter>
      <marker id="head" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={COLORS.arrow} /></marker>
    </defs>
    {/* dashed axes */}
    <line x1={60} y1={O[1]} x2={1020} y2={O[1]} stroke={COLORS.axis} strokeWidth={2} strokeDasharray="8 10" opacity={0.55} />
    <line x1={O[0]} y1={O[1] - 450} x2={O[0]} y2={O[1] + 450} stroke={COLORS.axis} strokeWidth={2} strokeDasharray="8 10" opacity={0.55} />
    {/* the circle, drawn round from (1, 0); its ripple */}
    <circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={COLORS.circle} strokeWidth={14} opacity={(0.25 + 0.5 * glow) * c} filter="url(#halo)" />
    <circle cx={O[0]} cy={O[1]} r={R} fill="none" stroke={COLORS.circle} strokeWidth={6} filter="url(#glow)"
      strokeDasharray={`${circ * c} ${circ}`} transform={`rotate(0 ${O[0]} ${O[1]}) scale(1 -1) translate(0 ${-2 * O[1]})`} />
    {ripple > 0 && <circle cx={O[0]} cy={O[1]} r={R * (1 + 0.55 * ripple)} fill="none" stroke={COLORS.circle} strokeWidth={4} opacity={0.5 * (1 - ripple)} />}
    {/* the lines */}
    {segmentsAt(t).filter(s => s.alpha > 0.01).map(s => {
      const e = [s.a[0] + (s.b[0] - s.a[0]) * s.drawn, s.a[1] + (s.b[1] - s.a[1]) * s.drawn];
      return <g key={s.id} opacity={s.alpha}>
        {s.glow > 0.01 && <line x1={s.a[0]} y1={s.a[1]} x2={e[0]} y2={e[1]} stroke={s.color} strokeWidth={s.width * 3} strokeLinecap="round" opacity={s.glow} filter="url(#halo)" />}
        <line x1={s.a[0]} y1={s.a[1]} x2={e[0]} y2={e[1]} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" filter="url(#glow)" />
      </g>;
    })}
    {/* the angle */}
    {deg > 0.5 && <path d={arc(56, 0, (deg * Math.PI) / 180)} fill="none" stroke={COLORS.cos} strokeWidth={3} />}
    {/* the point on the circle, and a ring of sparks where a slant cuts through */}
    {t >= DRAW.angle && <circle cx={P[0]} cy={P[1]} r={7 + 5 * cut} fill="#ffffff" filter="url(#glow)" />}
    {cut > 0.02 && Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * 2 * Math.PI, rr = 18 + 26 * cut;
      return <circle key={i} cx={P[0] + rr * Math.cos(a)} cy={P[1] + rr * Math.sin(a)} r={3} fill={COLORS.cos} opacity={cut} />;
    })}
    {/* their curved arrow down to the top of the circle */}
    {arrow > 0.01 && <path d={`M ${B[0] - 230} ${B[1] - 190} Q ${B[0] - 90} ${B[1] - 170} ${B[0] - 22} ${B[1] - 30}`} fill="none" stroke={COLORS.arrow}
      strokeWidth={6} strokeLinecap="round" markerEnd="url(#head)" opacity={arrow} strokeDasharray="600" strokeDashoffset={600 * (1 - arrow)} />}
  </svg>;
}

function Labels({ t }: { t: number }) {
  return <>{labelsAt(t).filter(l => l.alpha > 0.01).map((l, i) => (
    <div key={i} style={{ position: 'absolute', top: l.y - l.size * 0.8, height: l.size * 1.2, display: 'flex', alignItems: 'center', opacity: l.alpha,
      font: `600 ${l.size}px ${SOFT_UI}`, color: l.color, whiteSpace: 'pre', textShadow: '0 0 10px rgba(0,0,0,0.9)',
      ...(l.anchor === 'start' ? { left: l.x } : l.anchor === 'end' ? { right: W - l.x } : { left: l.x - 300, width: 600, justifyContent: 'center' }) }}>{l.text}</div>
  ))}</>;
}

function Words({ t, cover }: { t: number; cover: boolean }) {
  const title = titleAt(t), sub = subtitleAt(t);
  const a = title ? (cover ? 1 : prog(t, title.t, 0.35)) : 0, rise = title && !cover ? 14 * (1 - prog(t, title.t, 0.35)) : 0;
  return <>
    {title && <div style={{ position: 'absolute', left: 0, width: W, top: (cover ? 330 : TITLE_Y) - TITLE_SIZE * 0.6 + rise, textAlign: 'center', opacity: a,
      font: `700 ${TITLE_SIZE}px ${SOFT_UI}`, color: title.color, textShadow: `0 0 18px ${title.color}88` }}>{title.text}</div>}
    {sub && !cover && <div style={{ position: 'absolute', left: 0, width: W, top: SUBTITLE_Y - SUBTITLE_SIZE * 0.6, textAlign: 'center',
      opacity: prog(t, sub.t, 0.3) * (1 - prog(t, sub.t1 - 0.3, 0.3)), font: `600 ${SUBTITLE_SIZE}px ${SOFT_UI}`, color: sub.color }}>{sub.text}</div>}
  </>;
}

/** Their glitch: for a few frames the picture splits into shifted slices with a red / cyan fringe. */
function Glitch({ t, children }: { t: number; children: React.ReactNode }) {
  const g = glitchAt(t);
  if (!g) return <>{children}</>;
  const shift = (k: number) => (((g * 7919 + k * 104729) % 97) / 97 - 0.5) * 70;
  const bands = [0, 18, 31, 47, 58, 72, 86, 100];
  return <>
    {bands.slice(0, -1).map((y0, k) => (
      <div key={k} style={{ position: 'absolute', inset: 0, clipPath: `inset(${y0}% 0 ${100 - bands[k + 1]}% 0)`, transform: `translateX(${shift(k)}px)` }}>{children}</div>
    ))}
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${shift(9) * 0.3}px)`, mixBlendMode: 'screen', opacity: 0.35, filter: 'hue-rotate(150deg)' }}>{children}</div>
  </>;
}

export function Reel028({ cover = false, voice = true }: { cover?: boolean; voice?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : Math.min(frame / fps, DURATION);
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Stars t={t} glow={glowAt(t)} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoomAt(t)})`, transformOrigin: `${CENTRE[0]}px ${CENTRE[1]}px` }}>
        <Glitch t={t}><Figure t={t} /><Labels t={t} /></Glitch>
      </div>
      <Words t={t} cover={cover} />
      {!cover && <Html5Audio src={staticFile(voice ? 'nda-maths-028-trig-lines-voice-mix.wav' : 'nda-maths-028-trig-lines-mix.wav')} />}
    </AbsoluteFill>
  );
}
