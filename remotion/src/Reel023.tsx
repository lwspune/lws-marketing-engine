// @lws.pune · reel 023 (predict-first): differentiate sin x four times; you get…? An NDA maths concept, white look.
// From frame 0 the blue wave slides a quarter turn left per derivative (sin → cos → −sin → −cos → sin) over its pale
// dashed shadow, while a dial's orange pointer turns 90° and the pill counts y′, y″, y‴, y⁗. Then the second derivative
// draws itself as the orange mirror wave (y″ = −y, tagged as trap B), and the faster wave sin 2x turns twice, doubling
// each time: −4 sin 2x, so y″ + 4y = 0. Only the wave panel zooms. Timeline and checks: lib/reel023.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog, tween } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, CAMERA, SQUEEZE, MIRROR, DIAL, phaseAt, waveAt, mirrorEndAt, pillAt,
  panelX, panelAt, labelsAt,
} from './lib/reel023.ts';
import { Board, Caption, EndCard, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'sin, −sin or cos?', y: 1590, size: 62 };
const BAND = { top: 470, height: 1030 };

function Panel({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), p = panelAt(t), r = prog(t, SQUEEZE.t, SQUEEZE.dur);
  const py = (y: number) => p.cy - y * p.amp, k = 1 + r;
  const trace = (g: (x: number) => number, a = -Math.PI, b = 2 * Math.PI) => b <= a ? '' :
    Array.from({ length: 241 }, (_, i) => { const x = a + ((b - a) * i) / 240; return `${i ? 'L' : 'M'}${panelX(x).toFixed(1)},${py(g(x)).toFixed(1)}`; }).join(' ');
  const flash = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - ANSWER_AT) / 0.8)));
  const mirror = t >= MIRROR.t ? 1 - prog(t, SQUEEZE.t - 0.2, 0.3) : 0, axisH = (1.3 + 3 * r) * p.amp;
  const marks = labelsAt(t).filter(l => l.zoomed && l.alpha > 0.01);
  return (
    <g transform={`translate(540 515) scale(${z}) translate(${-fx} ${-fy})`}>
      <line x1={panelX(-Math.PI)} y1={p.cy} x2={panelX(2 * Math.PI)} y2={p.cy} stroke={P.axis} strokeWidth={2.5} />
      <line x1={panelX(0)} y1={p.cy - axisH} x2={panelX(0)} y2={p.cy + axisH} stroke={P.axis} strokeWidth={2.5} />
      {r > 0 && [1, 4, -1, -4].map(v => <line key={v} x1={panelX(0) - 8} y1={py(v)} x2={panelX(0) + 8} y2={py(v)} stroke={P.axis} strokeWidth={2.5} opacity={r} />)}
      {/* the shadow: where the wave started (sin x, then sin 2x) */}
      <path d={trace(x => Math.sin(k * x))} fill="none" stroke={tint(COLORS.wave, 0.4)} strokeWidth={4} strokeDasharray="12 10" />
      {mirror > 0 && <path d={trace(x => -Math.sin(x), -Math.PI, mirrorEndAt(t))} fill="none" stroke={COLORS.mirror} strokeWidth={7} strokeLinecap="round" opacity={mirror} />}
      <path d={trace(waveAt(t))} fill="none" stroke={COLORS.wave} strokeWidth={8} strokeLinecap="round"
        style={{ filter: flash > 0 ? `drop-shadow(0 0 ${14 * flash}px ${tint(COLORS.wave, 0.8 * flash)})` : undefined }} />
      {marks.map(l => <text key={l.text} x={l.x} y={l.y} textAnchor={l.anchor} fill={P.muted} opacity={l.alpha} style={hand(l.size)}>{l.text}</text>)}
    </g>
  );
}

// The dial and the trap tag: held still (only the wave zooms).
function Dial({ t }: { t: number }) {
  const a = 1 - prog(t, SQUEEZE.t, 0.5), phase = phaseAt(t), { cx, cy, r } = DIAL;
  const tipX = cx + Math.sin(phase) * (r - 18), tipY = cy - Math.cos(phase) * (r - 18), current = Math.round(phase / (Math.PI / 2)) % 4;
  const labels = labelsAt(t).filter(l => !l.zoomed && l.alpha > 0.01);
  return (
    <>
      {a > 0 && <g opacity={a}>
        <circle cx={cx} cy={cy} r={r} fill={tint(P.board, 0.6)} stroke={tint(P.ink, 0.25)} strokeWidth={3} />
        {[0, 1, 2, 3].map(i => <circle key={i} cx={cx + Math.sin((i * Math.PI) / 2) * r} cy={cy - Math.cos((i * Math.PI) / 2) * r} r={7} fill={i === current ? COLORS.mirror : tint(P.ink, 0.3)} />)}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke={COLORS.mirror} strokeWidth={9} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={11} fill={COLORS.mirror} />
      </g>}
      {labels.map(l => {
        const slot = ['sin x', 'cos x', '−sin x', '−cos x'].indexOf(l.text), isDial = slot >= 0, on = slot === current;
        return <text key={l.text} x={l.x} y={l.y} textAnchor={l.anchor} opacity={l.alpha}
          fill={isDial ? (on ? P.ink : P.muted) : COLORS.mirror} style={{ ...hand(l.size), fontWeight: on ? 800 : 600 }}>{l.text}</text>;
      })}
    </>
  );
}

function Pill({ t }: { t: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: BAND.top + 22, textAlign: 'center' }}>
      <span style={{ display: 'inline-block', padding: '8px 34px', borderRadius: 40, background: tint(P.board, 0.92), boxShadow: `0 6px 24px ${tint(P.ink, 0.1)}`,
        border: `3px solid ${tint(COLORS.wave, 0.5)}`, color: COLORS.wave, ...hand(52) }}>{pillAt(t)}</span>
    </div>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 50, weight: 400, color: P.muted, text: 'Each derivative:' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'a quarter turn.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel023({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  DIFFERENTIATION'} lines={['Differentiate sin x four times.', 'You get…?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: 1080, height: BAND.height, overflow: 'hidden', ...softEdges({ top: 0.05, bottom: 0.06 }) }}>
          <svg width={1080} height={BAND.height} style={{ position: 'absolute', left: 0, top: 0 }}>
            <Panel t={t} />
            <Dial t={t} />
          </svg>
        </div>
        <Pill t={t} />
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-023-derivative-cycle-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
