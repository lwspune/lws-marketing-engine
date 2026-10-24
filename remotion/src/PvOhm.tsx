// @pyqvault_ pilot reel with the new cast, in Painted 2D. Timeline and physics: lib/pvOhm.ts. The cast (Volt, Amp, Ohm)
// comes from PvCast.tsx. A copper circuit loop: Volt on the left wire, Ohm on the right, small Amp sparks racing round;
// a second battery stacks on Volt, the sparks double their speed, Ohm glows red-hot; "Now double Ohm?": a second resistor
// stacks on Ohm and the flow falls back; the extras slide away and it loops into frame 0.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAB, SOFT_UI } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import { PAINT } from './lib/pvCast.ts';
import {
  HEADER, OPTIONS, ANSWER, ANSWER_AT, BRAND, COVER_T, CAPTIONS, LOOP, BOARD, METER, T_EQ, voltsAt, heatAt,
  extraVoltAt, extraOhmAt, ampsAt, pointOnLoop,
} from './lib/pvOhm.ts';
import { Caption, PredictHeader, Theme, useFonts } from './board.tsx';
import { Defs, Volt, Ohm } from './PvCast.tsx';

const S = 0.9;                                          // the cast at reel size
const FEET = 1260, VOLT_X = LOOP.x0, OHM_X = LOOP.x1;
const VOLT_H = 270 * S, OHM_H = 286 * S;                // standing heights at this scale (feet to top)
const scaled = (x: number, y: number) => `translate(${x} ${y}) scale(${S}) translate(${-x} ${-y})`;

function Wire() {
  const { x0, x1, y0, y1, r } = LOOP;
  const d = `M${x0 + r} ${y0} H${x1 - r} A${r} ${r} 0 0 1 ${x1} ${y0 + r} V${y1 - r} A${r} ${r} 0 0 1 ${x1 - r} ${y1} H${x0 + r} A${r} ${r} 0 0 1 ${x0} ${y1 - r} V${y0 + r} A${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`;
  return (
    <g fill="none" strokeLinejoin="round">
      <path d={d} stroke="#000000" strokeWidth="30" opacity="0.25" transform="translate(0 10)" filter="url(#c_blur)" />
      <path d={d} stroke={PAINT.copper.edge} strokeWidth="22" />
      <path d={d} stroke={PAINT.copper.fill} strokeWidth="15" />
      <path d={d} stroke={PAINT.copper.light} strokeWidth="4" opacity="0.7" transform="translate(-2 -3)" />
    </g>
  );
}

/** The current: a ring of small Amp sparks (the cast's spark, small: a glow, a bright core, two eyes). */
function Sparks({ t }: { t: number }) {
  return (
    <g>
      {ampsAt(t).map((a, i) => {
        const p = pointOnLoop(a.s);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="48" fill="url(#c_glow)" />
            <circle cx={p.x} cy={p.y} r="21" fill="url(#c_sparkR)" stroke={PAINT.spark.edge} strokeWidth="2.5" />
            {[-7, 7].map((dx) => <circle key={dx} cx={p.x + dx} cy={p.y - 3} r="3.4" fill="#1E2236" />)}
          </g>
        );
      })}
    </g>
  );
}

function Cast({ t }: { t: number }) {
  const v2 = extraVoltAt(t), o2 = extraOhmAt(t), hot = heatAt(t) > 1.5;
  const voltPose = voltsAt(t) > 1 ? 'push' : 'ready';
  return (
    <g>
      <g transform={scaled(VOLT_X, FEET)}><Volt x={VOLT_X} y={FEET} pose={voltPose} /></g>
      {v2 > 0.001 && (
        <g transform={`translate(${-320 * (1 - v2)} 0)`} opacity={Math.min(1, v2 * 1.5)}>
          <g transform={scaled(VOLT_X, FEET - VOLT_H)}><Volt x={VOLT_X} y={FEET - VOLT_H} pose={voltPose} /></g>
        </g>
      )}
      <g transform={scaled(OHM_X, FEET)}><Ohm x={OHM_X} y={FEET} pose={hot ? 'hot' : 'arms'} /></g>
      {o2 > 0.001 && (
        <g transform={`translate(${320 * (1 - o2)} 0)`} opacity={Math.min(1, o2 * 1.5)}>
          <g transform={scaled(OHM_X, FEET - OHM_H)}><Ohm x={OHM_X} y={FEET - OHM_H} pose="arms" /></g>
        </g>
      )}
    </g>
  );
}

/** Names under the cast for the first seconds, then the live meter and the equation card. */
function Labels({ t }: { t: number }) {
  const names = 1 - prog(t, 3.0, 0.4), eq = prog(t, T_EQ[0], 0.35) * (1 - prog(t, T_EQ[1], 0.35));
  const label = (x: number, y: number, text: string) => (
    <div style={{ position: 'absolute', left: x - 100, width: 200, top: y, textAlign: 'center', font: `700 30px ${SOFT_UI}`, color: '#C9D2EA', opacity: names }}>{text}</div>
  );
  return (
    <>
      {names > 0 && <>{label(VOLT_X + 40, FEET + 20, 'Volt')}{label(OHM_X - 40, FEET + 20, 'Ohm')}{label(540, LOOP.y0 + 30, 'Amps')}</>}
      <div style={{ position: 'absolute', left: METER.x - 210, width: 420, top: METER.y - 60, height: 120, borderRadius: 60, background: 'rgba(33,42,72,0.9)',
        border: `3px solid ${PAINT.spark.shade}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 54px ${SOFT_UI}`, color: METER.color,
        fontVariantNumeric: 'tabular-nums', fontSize: 72 }}>{METER.text(t)}</div>
      {eq > 0.01 && (
        <div style={{ position: 'absolute', left: 300, width: 480, top: 1110, height: 140, borderRadius: 36, background: 'rgba(20,26,46,0.92)', border: '3px solid #5A8FDB',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: eq, transform: `scale(${0.9 + 0.1 * eq})`, font: `800 84px ${SOFT_UI}` }}>
          <span style={{ color: '#7FB0FF' }}>V</span><span style={{ color: '#FFFFFF' }}>=</span><span style={{ color: '#FFD86B' }}>I</span>
          <span style={{ color: '#FFFFFF' }}>×</span><span style={{ color: '#F4E4C2' }}>R</span>
        </div>
      )}
    </>
  );
}

export function PvOhm({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={LAB}>
      <AbsoluteFill style={{ background: BOARD }}>
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Defs />
          <radialGradient id="o_spot" cx="0.5" cy="0.55" r="0.65"><stop offset="0" stopColor="#2A3456" /><stop offset="1" stopColor={BOARD} /></radialGradient>
          <rect width="1080" height="1920" fill="url(#o_spot)" />
          <Wire />
          <Sparks t={t} />
          <Cast t={t} />
        </svg>
        <PredictHeader t={t} label={'PHYSICS, VISUALISED  #14'} lines={HEADER} options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={56} chipW={260} brand={BRAND} />
        <Labels t={t} />
        {cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 52} y={cap.caption.y ?? 1600} />}
        {!cover && <Html5Audio src={staticFile('pv-physics-014-ohm-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}

