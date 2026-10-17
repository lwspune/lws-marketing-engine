// Reel 005 in Remotion: the same question, timings, captions and colours as
// reels/nda-maths-005-area.render.html, drawn frame by frame. What Remotion adds is in the comments
// marked "upgrade": springs, a comet trail on the curve, pop-in numbers, dimmed wrong options.
import React from 'react';
import { AbsoluteFill, Html5Audio, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint, TEXT_FONT, SOFT_UI, UI } from './lib/palette.ts';
import { clamp01, prog, captionAt } from './lib/motion.ts';
import {
  GX0, GX1, GY, CLIP_Y0, CLIP_Y1, ANSWER_AT, END_AT, CAPTIONS, view, px, py, f, foldAt, curveEnd, curvePaths, fillPath,
  humpAlpha, humpsShown, slices, slicesAlpha, type View,
} from './lib/reel005.ts';
import { Board, Card, Caption, MathRow, Int, Limits, C, hand, useFonts } from './board.tsx';

const PI = Math.PI;
const COVER = { t: 9.6, text: 'Area over 8π?\nCount the humps.', y: 1440, size: 76 };

function Axes({ t, V }: { t: number; V: View }) {
  const dots: React.ReactNode[] = [];
  for (let k = 1; (k * PI) / 4 <= V.xmax + 1e-6; k++)
    for (const y of [-1, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1, 1.25]) dots.push(<circle key={`${k}:${y}`} cx={px(V, (k * PI) / 4)} cy={py(V, y)} r={2.6} fill={P.grid} />);
  const ticks: React.ReactNode[] = [];
  for (let k = 0; k <= 8 && k * PI <= V.xmax * 1.001; k++) {
    const x = px(V, k * PI);
    ticks.push(<g key={k}>
      <text x={x + (k === 0 ? -18 : 0)} y={GY + 46} textAnchor="middle" fill={P.muted} style={hand(32)}>{k === 0 ? '0' : k === 1 ? 'π' : `${k}π`}</text>
      <line x1={x} y1={GY - 8} x2={x} y2={GY + 8} stroke={P.axis} strokeWidth={2.5} />
    </g>);
  }
  return (
    <g>
      {dots}
      <g stroke={P.axis} strokeWidth={2.5}>
        <line x1={GX0 - 20} y1={GY} x2={GX1 + 30} y2={GY} /><line x1={GX0} y1={GY + 230} x2={GX0} y2={GY - 330} />
      </g>
      <g fill={P.axis}>
        <polygon points={`${GX1 + 42},${GY} ${GX1 + 24},${GY - 9} ${GX1 + 24},${GY + 9}`} />
        <polygon points={`${GX0},${GY - 342} ${GX0 - 9},${GY - 324} ${GX0 + 9},${GY - 324}`} />
        <text x={GX1 + 32} y={GY - 22} textAnchor="middle" style={hand(36)}>x</text>
        <text x={GX0 - 30} y={GY - 320} textAnchor="middle" style={hand(36)}>y</text>
      </g>
      <g opacity={prog(t, 8.8, 0.5)}>{ticks}</g>
    </g>
  );
}

function Area({ t, V, fps }: { t: number; V: View; fps: number }) {
  const humps: React.ReactNode[] = [];
  for (let k = 1; k <= 8; k++) {
    const a = humpAlpha(t, k); if (a <= 0 || (k - 1) * PI > V.xmax) continue;
    // "2" inside each hump: big while zoomed, small when all eight are on screen.
    // upgrade: it pops in on a spring instead of fading.
    const shownAt = k === 1 ? 14.6 : 17.2 + (k - 2) * 0.45, la = k === 1 ? prog(t, 14.6, 0.4) : a;
    const pop = spring({ frame: (t - shownAt) * fps, fps, config: { damping: 10, stiffness: 170 } });
    const cx = px(V, (k - 0.5) * PI), cy = py(V, 0.4);
    humps.push(<g key={k}>
      <path d={fillPath(V, (k - 1) * PI, k * PI, 1)} fill={P.fill} opacity={a} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={P.green} opacity={la}
        transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * pop}) translate(${-cx} ${-cy})`}
        style={{ font: `800 ${Math.round(40 + 56 * V.z)}px ${UI}` }}>2</text>
    </g>);
  }
  return (
    <g>
      <g opacity={slicesAlpha(t)} fill={P.fill} stroke={P.green} strokeWidth={1.5}>
        {slices(t, V).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />)}
      </g>
      {humps}
    </g>
  );
}

function Curve({ t, V }: { t: number; V: View }) {
  const c = curvePaths(t, V), fold = foldAt(t), end = curveEnd(t, V);
  // upgrade: a soft comet tail behind the leading dot (the last stretch of curve, wide and faint).
  let tail = '';
  if (c.head) for (let i = 0; i <= 24; i++) { const x = Math.max(0, end - 1.1 + (1.1 * i) / 24); tail += `${i ? 'L' : 'M'}${px(V, x)} ${py(V, f(x, fold))}`; }
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={c.above} stroke={P.blue} strokeWidth={6} filter="url(#soft)" />
      <path d={c.below} stroke={P.blue} strokeWidth={6} filter="url(#soft)" opacity={c.belowAlpha} />
      {c.head && <>
        <path d={tail} stroke="url(#tail)" strokeWidth={18} opacity={0.35} />
        <circle cx={c.head.x} cy={c.head.y} r={9} fill={P.blue} filter="url(#glow)" />
      </>}
      {/* y = sin x  →  y = |sin x|, swapped (out, then in) so they never overlap mid-fold. */}
      <g fill={P.blue} stroke="none" style={hand(46)} textAnchor="end">
        <text x={GX1} y={940} opacity={prog(t, 1.0, 0.5) * (1 - clamp01(fold * 2))}>y = sin x</text>
        <text x={GX1} y={940} opacity={clamp01(fold * 2 - 1)}>y = |sin x|</text>
      </g>
    </g>
  );
}

// Trap (c): the period of |sin x| is π, not 2π. A brace under the first hump says so.
function Period({ t, V }: { t: number; V: View }) {
  const p = prog(t, 25.2, 0.6); if (p <= 0) return null;
  const x0 = px(V, 0) + 4, x1 = px(V, PI) - 4, xm = (x0 + x1) / 2, y = GY + 74;
  const pts = [[x0, y - 14], [x0 + 8, y], [xm - 10, y], [xm, y + 14], [xm + 10, y], [x1 - 8, y], [x1, y - 14]];
  return (
    <g>
      <polyline points={pts.map(q => q.join(',')).join(' ')} fill="none" stroke={P.amber} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <text x={GX0 - 10} y={y + 62} fill={P.amber} opacity={p} style={hand(40)}>repeats every π</text>
    </g>
  );
}

// The question on a floating card: source line, the integral, and the options as chips.
function QuestionCard({ t }: { t: number }) {
  const on = prog(t, ANSWER_AT, 0.6), pulse = Math.sin(PI * clamp01((t - ANSWER_AT) / 0.7));
  const dim = 1 - 0.55 * prog(t, ANSWER_AT + 0.3, 0.5); // upgrade: wrong options step back once the answer is in
  const labels = ['(a) 2', '(b) 4', '(c) 8', '(d) 16'], w = 180, h = 72, gap = 20, x0 = 540 - (4 * w + 3 * gap) / 2;
  return (
    <>
      <Card x={110} y={460} w={860} h={380} />
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 525 - 28, textAlign: 'center', font: `600 34px ${SOFT_UI}`, color: P.muted, whiteSpace: 'pre' }}>
        NDA 2023 (II)  ·  Maths  ·  Q67
      </div>
      <MathRow y={655} size={80}><Int lo="0" hi="8π" size={80} color={P.blue} /><C color={P.blue}> |sin x|</C> dx  =  ?</MathRow>
      {labels.map((label, i) => {
        const hit = i === 3 && on > 0, s = hit ? 1 + 0.07 * pulse : 1;
        return (
          <div key={label} style={{
            position: 'absolute', left: x0 + i * (w + gap), top: 735, width: w, height: h, borderRadius: h / 2, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`,
            border: `${hit ? 2 + on : 2}px solid ${hit ? tint(P.amber, 0.25 + 0.6 * on) : tint(P.ink, 0.14)}`,
            background: hit ? tint(P.amber, 0.12 * on) : 'transparent',
            boxShadow: hit ? `0 6px 22px ${tint(P.amber, 0.25 * on)}` : 'none',
            opacity: i === 3 ? 1 : dim, color: hit && on > 0.5 ? P.amber : P.ink, ...hand(44), paddingTop: 2,
          }}>{label}</div>
        );
      })}
    </>
  );
}

function Working({ t, fps }: { t: number; fps: number }) {
  const a = prog(t, 12.2, 0.5) * (1 - prog(t, 16.0, 0.4)), c = prog(t, 16.8, 0.4), n = humpsShown(t);
  // upgrade: the running total rolls up to its new value each time a hump fills.
  const last = n === 1 ? 16.8 : 17.2 + (n - 2) * 0.45 + 0.15, roll = spring({ frame: (t - last) * fps, fps, config: { damping: 14 } });
  return (
    <>
      <MathRow y={1525} size={54} opacity={a}>
        <Int lo="0" hi="π" size={54} color={P.blue} /><C color={P.blue}> sin x dx</C> = [−cos x]<Limits lo="0" hi="π" size={54} /> = 1 + 1 = <C color={P.green}>2</C>
      </MathRow>
      <MathRow y={1525} size={64} opacity={c}>
        {`${n} hump${n > 1 ? 's' : ''}  ×  2  =  `}
        <span style={{ display: 'inline-block', color: P.green, transform: `translateY(${(1 - roll) * 30}px)`, opacity: 0.3 + 0.7 * roll }}>{2 * n}</span>
      </MathRow>
    </>
  );
}

const END = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Graph keeps repeating?' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'Find one hump. Multiply.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];
function EndCard({ t, fps }: { t: number; fps: number }) {
  const p = clamp01((t - END_AT) / 0.5); if (p <= 0) return null;
  let y = 820;
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <Board watermark={false} />
      {END.map(l => {
        const a = clamp01((t - END_AT - l.at) / 0.35), s = spring({ frame: (t - END_AT - l.at) * fps, fps, config: { damping: 16 } });
        const top = y; y += l.size * (l.size > 70 ? 2.0 : 1.75);
        return <div key={l.text} style={{ position: 'absolute', left: 0, width: 1080, top: top - l.size * 0.6, textAlign: 'center', opacity: a,
          font: `${l.weight} ${l.size}px/${l.size * 1.2}px ${SOFT_UI}`, color: l.color, transform: `translateY(${(1 - s) * 22}px)` }}>{l.text}</div>;
      })}
    </AbsoluteFill>
  );
}

export function Reel005({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, V = view(t), cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <AbsoluteFill style={{ fontFamily: TEXT_FONT }}>
      <Board />
      <QuestionCard t={t} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="band"><rect x={0} y={CLIP_Y0} width={1080} height={CLIP_Y1 - CLIP_Y0} /></clipPath>
          <filter id="soft" filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}><feDropShadow dx={0} dy={4} stdDeviation={7} floodColor={P.blue} floodOpacity={0.28} /></filter>
          <filter id="glow" filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}><feDropShadow dx={0} dy={0} stdDeviation={9} floodColor={P.blue} floodOpacity={1} /></filter>
          <linearGradient id="tail" gradientUnits="userSpaceOnUse" x1={px(V, Math.max(0, curveEnd(t, V) - 1.1))} x2={px(V, curveEnd(t, V))} y1={0} y2={0}>
            <stop offset={0} stopColor={P.blue} stopOpacity={0} /><stop offset={1} stopColor={P.blue} stopOpacity={1} />
          </linearGradient>
        </defs>
        <g clipPath="url(#band)">
          <Axes t={t} V={V} />
          <Area t={t} V={V} fps={fps} />
          <Curve t={t} V={V} />
          <Period t={t} V={V} />
        </g>
      </svg>
      <Working t={t} fps={fps} />
      {cover
        ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
        : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size} y={cap.caption.y} rise={cap.caption.t0 > 0} />}
      {!cover && <EndCard t={t} fps={fps} />}
      {/* The engine's soundtrack starts 0.15 s late (its record lead; beats measured at +0.16 s), so skip 5 frames. */}
      {!cover && <Html5Audio src={staticFile('nda-maths-005-area.aac')} trimBefore={5} />}
    </AbsoluteFill>
  );
}
