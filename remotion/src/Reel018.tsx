// @lws.pune · reel 018 (predict-first): slide the two points together; the line's slope becomes…? An NDA maths concept,
// white look. A chord through P (1, 1) and Q on y = x² pivots as Q runs into P; its live slope counts 3.500 → 2.00x and
// the chord locks as the tangent (B 2). A deep zoom on P shows the curve turning straight, then the tangent slides to
// x = 2 (slope 4). Drawn in screen space, so every line keeps its width at ×48. Timeline and checks: lib/reel018.ts.
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint, SOFT_UI } from './lib/palette.ts';
import { clamp01, captionAt, prog } from './lib/motion.ts';
import { END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COLORS, COVER_T, BAND, f, hAt, xAt, chordSlope, cam, toScreen, type Cam } from './lib/reel018.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: '1, 2 or ∞?', y: 1590, size: 62 };
const W = 1080, H = BAND.height;

// The dot grid at every zoom: lines every 1, 0.1 and 0.01 units, each level fading in as its spacing opens up.
function Grid({ c }: { c: Cam }) {
  const out: React.ReactElement[] = [];
  for (const step of [1, 0.1, 0.01]) {
    const gx = step * BAND.sx * c.z, gy = step * BAND.sy * c.z, a = clamp01((Math.min(gx, gy) - 34) / 60);
    if (a <= 0) continue;
    const x0 = c.cx - 540 / (BAND.sx * c.z), x1 = c.cx + 540 / (BAND.sx * c.z);
    const y0 = c.cy - (H / 2) / (BAND.sy * c.z), y1 = c.cy + (H / 2) / (BAND.sy * c.z);
    for (let k = Math.ceil(x0 / step); k <= Math.floor(x1 / step); k++) {
      const [sx] = toScreen(k * step, 0, c);
      out.push(<line key={`x${step}${k}`} x1={sx} y1={0} x2={sx} y2={H} stroke={P.grid} strokeWidth={step === 1 ? 2 : 1.5} opacity={a} />);
    }
    for (let k = Math.ceil(y0 / step); k <= Math.floor(y1 / step); k++) {
      const [, sy] = toScreen(0, k * step, c);
      out.push(<line key={`y${step}${k}`} x1={0} y1={sy} x2={W} y2={sy} stroke={P.grid} strokeWidth={step === 1 ? 2 : 1.5} opacity={a} />);
    }
  }
  return <>{out}</>;
}

function Graph({ t }: { t: number }) {
  const c = cam(t), x0 = xAt(t), h = hAt(t), m = chordSlope(x0, h), locked = prog(t, ANSWER_AT, 0.3);
  const [ox, oy] = toScreen(0, 0, c), [px, py] = toScreen(x0, f(x0), c), [qx, qy] = toScreen(x0 + h, f(x0 + h), c);
  // The curve across the visible band, sampled in screen space.
  const xa = c.cx - 560 / (BAND.sx * c.z), xb = c.cx + 560 / (BAND.sx * c.z);
  const curve = Array.from({ length: 181 }, (_, i) => { const x = xa + ((xb - xa) * i) / 180, [sx, sy] = toScreen(x, f(x), c); return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`; }).join(' ');
  // The chord (or tangent) through P with slope m, drawn 900 px each way.
  const dx = 1, dy = m * (BAND.sy / BAND.sx), n = 900 / Math.hypot(dx, dy);
  const line = (color: string, opacity: number) =>
    <line x1={px - dx * n} y1={py + dy * n} x2={px + dx * n} y2={py - dy * n} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={opacity} />;
  const legs = clamp01((h - 0.08) / 0.25), qa = clamp01((Math.hypot(qx - px, qy - py) - 10) / 30) * (h > 0 ? 1 : 0);
  const near = 1 - clamp01((c.z - 2.2) / 1.5);                    // labels that only make sense at the whole-graph view
  const pulse = t >= ANSWER_AT ? Math.sin(Math.PI * clamp01((t - ANSWER_AT) / 0.8)) : 0;
  const [lx, ly] = toScreen(2.7, f(2.7), c);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Grid c={c} />
      <line x1={0} y1={oy} x2={W} y2={oy} stroke={P.axis} strokeWidth={2.5} />
      <line x1={ox} y1={0} x2={ox} y2={H} stroke={P.axis} strokeWidth={2.5} />
      <path d={curve} fill="none" stroke={COLORS.curve} strokeWidth={8} strokeLinecap="round" />
      <text x={lx - 24} y={ly + 30} textAnchor="end" fill={COLORS.curve} opacity={near} style={hand(40)}>y = x²</text>
      {/* rise over run, while the gap is still wide */}
      {legs > 0 && <g opacity={legs}>
        <line x1={px} y1={py} x2={qx} y2={py} stroke={tint(P.ink, 0.5)} strokeWidth={3} strokeDasharray="10 9" />
        <line x1={qx} y1={py} x2={qx} y2={qy} stroke={tint(P.ink, 0.5)} strokeWidth={3} strokeDasharray="10 9" />
        <text x={(px + qx) / 2} y={py + 44} textAnchor="middle" fill={P.muted} style={hand(34)}>h</text>
      </g>}
      {line(COLORS.chord, 1 - locked)}
      {locked > 0 && line(COLORS.tangent, locked)}
      {pulse > 0 && <circle cx={px} cy={py} r={20 + 40 * pulse} fill="none" stroke={tint(COLORS.tangent, 0.6 * (1 - pulse * 0.6))} strokeWidth={5} />}
      {qa > 0 && <circle cx={qx} cy={qy} r={14} fill={COLORS.chord} stroke={P.board} strokeWidth={4} opacity={qa} />}
      <circle cx={px} cy={py} r={14} fill={P.ink} stroke={P.board} strokeWidth={4} />
      {qa > 0 && <text x={qx + 26} y={qy + 12} fill={COLORS.chord} opacity={qa * near} style={hand(36)}>Q</text>}
      <text x={px - 26} y={py - 22} textAnchor="end" fill={P.ink} opacity={near} style={hand(36)}>{`P (${x0 === 1 ? 1 : x0.toFixed(1)}, ${x0 === 1 ? 1 : f(x0).toFixed(1)})`}</text>
    </svg>
  );
}

// The live slope, held still at the top of the picture (text never zooms).
function Readout({ t }: { t: number }) {
  const c = cam(t), x0 = xAt(t), h = hAt(t), m = chordSlope(x0, h), locked = prog(t, ANSWER_AT, 0.3);
  const color = locked > 0.5 ? COLORS.tangent : COLORS.chord, zoomA = clamp01((c.z - 1.6) / 0.6);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: W, top: BAND.top + 22, textAlign: 'center' }}>
        <span style={{ display: 'inline-block', padding: '8px 34px', borderRadius: 40, background: tint(P.board, 0.92), boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`,
          border: `3px solid ${tint(color, 0.5)}`, color, ...hand(54) }}>
          {`slope = ${t < ANSWER_AT ? m.toFixed(3) : m.toFixed(2)}`}
        </span>
      </div>
      {zoomA > 0 && <div style={{ position: 'absolute', right: 70, top: BAND.top + H - 70, opacity: zoomA, font: `600 34px ${SOFT_UI}`, color: P.muted }}>
        {`zoom ×${Math.round(c.z)}`}
      </div>}
    </>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'The derivative =' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'the slope as the gap → 0.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel018({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  DERIVATIVES'} lines={['Slide the two points together.', 'The line’s slope becomes…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: W, height: H, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <Graph t={t} />
        </div>
        <Readout t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-018-secant-tangent-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
