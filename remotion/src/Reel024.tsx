// @lws.pune · reel 024 (predict-first): f(x) = x² from set X to set Y; what is the range of f? An NDA maths concept, white
// look. From frame 0 five cyan balls fly from X's numbers to their squares in Y, each drawing its arrow; the outputs light
// green and a list grows 4, 1, 0, 1, 4, then merges into the pill "Range = {0, 1, 4}" while 2 and 3 go dashed. Then X is
// named the domain (option C), Y the codomain (option B); −2 and 2 sharing 4 gets a ✓, a ghost arrow giving 1 two
// outputs gets a ✗. Only the ovals and arrows zoom. Timeline and checks: lib/reel024.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog, tween } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, CAMERA, X, Y, f, FLIGHTS, GHOST, OVAL, DOT_R, NEVER_HIT,
  NEVER_AT, MERGE, PILL_AT, DOMAIN_AT, CODOMAIN_AT, MANY_AT, CHECK_AT, SUMMARY_AT, dot, arrowEnds, ballAt, landedAt, outputsAt,
  labelsAt, labelBox, type Label,
} from './lib/reel024.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'What\'s the range?', y: 1590, size: 62 };
const BAND = { top: 470, height: 1030 };
const pulse = (t: number, at: number, dur = 0.6) => Math.sin(Math.PI * Math.min(1, Math.max(0, (t - at) / dur)));

function Arrow({ x0, y0, x1, y1, p, color, width, dash, opacity = 1 }:
  { x0: number; y0: number; x1: number; y1: number; p: number; color: string; width: number; dash?: string; opacity?: number }) {
  if (p <= 0) return null;
  const ex = x0 + (x1 - x0) * p, ey = y0 + (y1 - y0) * p, a = Math.atan2(y1 - y0, x1 - x0), h = 18;
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y0} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      {p >= 1 && <path d={`M${x1},${y1} L${x1 - h * Math.cos(a - 0.45)},${y1 - h * Math.sin(a - 0.45)} L${x1 - h * Math.cos(a + 0.45)},${y1 - h * Math.sin(a + 0.45)} Z`} fill={color} />}
    </g>
  );
}

function Picture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys);
  const glowX = Math.max(prog(t, DOMAIN_AT, 0.4) * (1 - prog(t, CODOMAIN_AT, 0.4)), prog(t, SUMMARY_AT, 0.4));
  const glowY = Math.max(prog(t, CODOMAIN_AT, 0.4) * (1 - prog(t, MANY_AT, 0.4)), prog(t, SUMMARY_AT, 0.4));
  const many = prog(t, MANY_AT, 0.4) * (1 - prog(t, GHOST.t, 0.4)), never = prog(t, NEVER_AT, 0.4);
  const ghostA = 1 - prog(t, GHOST.out, 0.4), g = arrowEnds(GHOST.from, GHOST.to);
  const oval = (side: 'X' | 'Y', color: string, glow: number) => (
    <ellipse cx={OVAL[side].cx} cy={OVAL[side].cy} rx={OVAL.rx} ry={OVAL.ry} fill={tint(color, 0.05 + 0.07 * glow)} stroke={color} strokeWidth={4 + 3 * glow}
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${18 * glow}px ${tint(color, 0.7 * glow)})` : undefined }} />
  );
  return (
    <g transform={`translate(540 515) scale(${z}) translate(${-fx} ${-fy})`}>
      {oval('X', COLORS.domain, glowX)}
      {oval('Y', COLORS.codomain, glowY)}
      {FLIGHTS.map((fl, i) => {
        const e = arrowEnds(fl.x, f(fl.x)), p = landedAt(t, i) ? 1 : ballAt(t, i)?.p ?? 0, twin = f(fl.x) === 4;
        return <Arrow key={i} {...e} p={p} color={COLORS.domain} width={5 + (twin ? 4 * many : 0)} />;
      })}
      {t >= GHOST.t && ghostA > 0 && <Arrow {...g} p={prog(t, GHOST.t, GHOST.dur)} color={P.muted} width={5} dash="14 12" opacity={ghostA} />}
      {X.map((x, i) => {
        const d = dot('X', i), s = 1 + 0.18 * pulse(t, DOMAIN_AT + 0.15 * i, 0.5) + 0.15 * pulse(t, FLIGHTS[i].t, 0.4);
        return (
          <g key={x} transform={`translate(${d.x} ${d.y}) scale(${s})`}>
            <circle r={DOT_R} fill={P.board} stroke={COLORS.domain} strokeWidth={4} />
            <text y={15} textAnchor="middle" fill={P.ink} style={hand(44)}>{x < 0 ? `−${-x}` : x}</text>
          </g>
        );
      })}
      {Y.map((y, i) => {
        const d = dot('Y', i), landing = FLIGHTS.map((fl, k) => ({ fl, k })).filter(({ fl }) => f(fl.x) === y);
        const hitAt = landing.length ? landing[0].fl.t + landing[0].fl.dur : Infinity, hit = t >= hitAt;
        const pop = landing.reduce((m, { fl }) => Math.max(m, pulse(t, fl.t + fl.dur, 0.35)), 0);
        const s = 1 + 0.22 * pop + 0.15 * pulse(t, CODOMAIN_AT + 0.12 * i, 0.5), dashed = NEVER_HIT.includes(y) && never > 0;
        return (
          <g key={y} transform={`translate(${d.x} ${d.y}) scale(${s})`}>
            <circle r={DOT_R} fill={hit ? tint(COLORS.range, 0.16) : P.board} stroke={hit ? COLORS.range : dashed ? P.muted : COLORS.codomain}
              strokeWidth={hit ? 5 : 4} strokeDasharray={dashed ? '9 7' : undefined} />
            <text y={15} textAnchor="middle" fill={hit ? COLORS.range : dashed ? P.muted : P.ink} style={{ ...hand(44), fontWeight: hit ? 800 : 600 }}>{y}</text>
          </g>
        );
      })}
      {FLIGHTS.map((_, i) => {
        const b = ballAt(t, i);
        return b && <circle key={i} cx={b.x} cy={b.y} r={14} fill={COLORS.domain} style={{ filter: `drop-shadow(0 3px 6px ${tint(P.ink, 0.25)})` }} />;
      })}
    </g>
  );
}

// The readout: the outputs list (its repeats fade as it merges), then the green range pill.
function Readout({ l, t }: { l: Label; t: number }) {
  if (t < PILL_AT) {
    const out = outputsAt(t), fade = 1 - prog(t, MERGE.t, PILL_AT - MERGE.t), seen = new Set<number>();
    return (
      <text x={l.x} y={l.y} textAnchor="middle" fill={P.ink} style={hand(l.size)}>
        <tspan fill={P.muted}>Outputs:</tspan>
        {out.map((v, i) => { const dup = seen.has(v); seen.add(v); return <tspan key={i} opacity={dup ? fade : 1} fill={COLORS.range}>{`${i ? ',' : ''} ${v}`}</tspan>; })}
      </text>
    );
  }
  const b = labelBox(l), s = 1 + 0.08 * pulse(t, PILL_AT, 0.5) + 0.06 * pulse(t, ANSWER_AT, 0.7);
  const w = b.x1 - b.x0 + 60, h = l.size * 1.5, glow = prog(t, SUMMARY_AT, 0.4);
  return (
    <g transform={`translate(${l.x} ${l.y - l.size * 0.32}) scale(${s})`} opacity={prog(t, PILL_AT, 0.25)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={tint(COLORS.range, 0.1 + 0.06 * glow)} stroke={COLORS.range} strokeWidth={4} />
      <text y={l.size * 0.32} textAnchor="middle" fill={COLORS.range} style={{ ...hand(l.size), fontWeight: 700 }}>{l.text}</text>
    </g>
  );
}

function Labels({ t }: { t: number }) {
  return <>{labelsAt(t).filter(l => l.alpha > 0.01).map(l => {
    if (l.role === 'readout') return <Readout key="readout" l={l} t={t} />;
    const color = l.role === 'set' ? (l.text.startsWith('X') ? COLORS.domain : COLORS.codomain) : l.text === '✓' ? COLORS.range : P.muted;
    const named = l.role === 'set' && l.text.includes('·');
    if (l.role === 'mark') {
      // Drawn as thick round strokes (the Cambria glyphs come out thin), centred where the label box is.
      const cx = l.x, cy = l.y - 0.3 * l.size, r = 0.3 * l.size, w = 0.13 * l.size, pop = 1 + 0.25 * pulse(t, l.text === '✓' ? CHECK_AT : GHOST.t + GHOST.dur, 0.35);
      return (
        <g key={l.text} opacity={l.alpha} transform={`translate(${cx} ${cy}) scale(${pop})`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {l.text === '✗'
            ? <><circle r={r * 1.6} fill={P.board} stroke="none" /><path d={`M${-r},${-r} L${r},${r} M${r},${-r} L${-r},${r}`} /></>
            : <path d={`M${-r},${0.05 * r} L${-0.3 * r},${0.7 * r} L${r},${-0.8 * r}`} />}
        </g>
      );
    }
    return (
      <g key={l.role + l.text.slice(0, 1)} opacity={l.alpha}>
        <text x={l.x} y={l.y} textAnchor={l.anchor} fill={color} style={{ ...hand(l.size), fontWeight: named ? 800 : 700 }}>{l.text}</text>
      </g>
    );
  })}</>;
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Range =' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the outputs you hit.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel024({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  FUNCTIONS'} lines={['f(x) = x², from set X to set Y.', 'What is the range of f?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={300} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.03, bottom: 0.04 }) }}>
          <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
            <Picture t={t} />
            <Labels t={t} />
          </svg>
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-024-function-range-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
