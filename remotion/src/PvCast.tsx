// @pyqvault_ character cast, first sketch: one sheet, a row per character, three poses each. Rules and colours:
// lib/pvCast.ts. Painted, not outlined: gradients from each shape's light side to its shadow side, edges in a darker shade
// of the same colour, soft floor shadows, a rim of light. Our own designs (a battery cell, a spark, a resistor).
import { AbsoluteFill } from 'remotion';
import { CAST, PAINT, BOARD, TEXT, SUBTEXT } from './lib/pvCast.ts';
import { useFonts } from './board.tsx';
import { SOFT_UI as SOFT_UI_FONT } from './lib/palette.ts';

const P = PAINT;
const CELL_W = 360, ROW_H = 400, TOP = 165;                 // each row's label sits above its characters

const Grad = ({ id, p, angle = 25, radial = false }: { id: string; p: { light: string; fill: string; shade: string }; angle?: number; radial?: boolean }) => {
  if (radial) return <radialGradient id={id} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor={p.light} /><stop offset="0.5" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} /></radialGradient>;
  const a = (angle * Math.PI) / 180, x = Math.cos(a) / 2, y = Math.sin(a) / 2;
  return <linearGradient id={id} x1={0.5 - x} y1={0.5 - y} x2={0.5 + x} y2={0.5 + y}><stop offset="0" stopColor={p.light} /><stop offset="0.45" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} /></linearGradient>;
};
const g = (k: keyof typeof PAINT) => `url(#c_${k})`;
const e = (k: keyof typeof PAINT, w = 3) => ({ stroke: P[k].edge, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

export function Defs() {
  return (
    <defs>
      {Object.entries(P).map(([k, p]) => <Grad key={k} id={`c_${k}`} p={p} />)}
      <Grad id="c_sparkR" p={P.spark} radial />
      <Grad id="c_heat" p={P.heat} />
      <radialGradient id="c_glow"><stop offset="0" stopColor="#FFE79A" stopOpacity="0.9" /><stop offset="0.35" stopColor="#FFC93F" stopOpacity="0.35" /><stop offset="1" stopColor="#FFC93F" stopOpacity="0" /></radialGradient>
      <radialGradient id="c_cyan"><stop offset="0" stopColor="#9FF0FF" stopOpacity="0.7" /><stop offset="1" stopColor="#4FD2FF" stopOpacity="0" /></radialGradient>
      <radialGradient id="c_hot"><stop offset="0" stopColor="#FF9D7A" stopOpacity="0.75" /><stop offset="1" stopColor="#FF6A3D" stopOpacity="0" /></radialGradient>
      <radialGradient id="c_spot" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#2A3456" /><stop offset="1" stopColor={BOARD} /></radialGradient>
      <filter id="c_blur"><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
  );
}

/** Eyes: `mood` sets the lids and brows; (x, y) is the point between the eyes. */
function Eyes({ x, y, s = 1, mood, look = 0 }: { x: number; y: number; s?: number; mood: 'calm' | 'set' | 'worried' | 'joy' | 'stern' | 'strain'; look?: number }) {
  const dx = 22 * s, r = 15 * s, pupil = 7 * s, brow = '#2B2438';
  const lid = mood === 'stern' ? 0.45 : mood === 'set' || mood === 'strain' ? 0.25 : 0;
  return (
    <g>
      {[-1, 1].map((k) => (
        <g key={k}>
          {mood === 'joy' ? (
            <path d={`M${x + k * dx - r} ${y + 2 * s} q${r} ${-16 * s} ${2 * r} 0`} fill="none" stroke={brow} strokeWidth={4 * s} strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={x + k * dx} cy={y} rx={r} ry={r * 1.1} fill={g('eyeWhite')} {...e('eyeWhite', 2 * s)} />
              <circle cx={x + k * dx + look * 5 * s} cy={y + 2 * s} r={pupil} fill="#1E2236" />
              <circle cx={x + k * dx + look * 5 * s + 2.5 * s} cy={y - 1.5 * s} r={2.4 * s} fill="#FFFFFF" />
              {lid > 0 && <path d={`M${x + k * dx - r - 1} ${y - r * 1.1} h${2 * r + 2} v${2 * r * 1.1 * lid} h${-2 * r - 2} Z`} fill="currentColor" />}
            </>
          )}
          {/* brows: in for "set" and "stern", up and out for "worried" */}
          {mood !== 'joy' && mood !== 'calm' && (
            <path d={mood === 'worried'
              ? `M${x + k * dx - k * 14 * s} ${y - 24 * s} L${x + k * dx + k * 12 * s} ${y - 30 * s}`
              : `M${x + k * dx - k * 14 * s} ${y - 30 * s} L${x + k * dx + k * 12 * s} ${y - 22 * s}`}
              stroke={brow} strokeWidth={5 * s} strokeLinecap="round" />
          )}
        </g>
      ))}
    </g>
  );
}

const Shadow = ({ x, y, w }: { x: number; y: number; w: number }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.14} fill="#000000" opacity="0.35" filter="url(#c_blur)" />;

/** Volt, the battery cell: blue body, copper cap and terminal, a + on the chest. */
export function Volt({ x, y, pose }: { x: number; y: number; pose: string }) {
  const lean = pose === 'push' ? 14 : 0, w = 140, h = 210, top = y - 60 - h;
  const arms = pose === 'push'
    ? [`M${x + 60} ${top + 110} Q${x + 110} ${top + 120} ${x + 140} ${top + 100}`, `M${x - 60} ${top + 120} Q${x + 30} ${top + 150} ${x + 140} ${top + 130}`]
    : pose === 'charged'
      ? [`M${x + 66} ${top + 110} Q${x + 110} ${top + 70} ${x + 112} ${top + 30}`, `M${x - 66} ${top + 110} Q${x - 110} ${top + 70} ${x - 112} ${top + 30}`]
      : [`M${x + 68} ${top + 110} Q${x + 92} ${top + 160} ${x + 82} ${top + 196}`, `M${x - 68} ${top + 110} Q${x - 92} ${top + 160} ${x - 82} ${top + 196}`];
  return (
    <g>
      <Shadow x={x} y={y} w={90} />
      {pose === 'charged' && <circle cx={x} cy={top + 100} r="160" fill="url(#c_cyan)" />}
      <g transform={`rotate(${lean} ${x} ${y - 20})`} style={{ color: P.cell.fill }}>
        {[-30, 30].map((k) => <path key={k} d={`M${x + k} ${y - 70} V${y - 12}`} stroke={P.cell.edge} strokeWidth="26" strokeLinecap="round" />)}
        {[-30, 30].map((k) => <path key={`f${k}`} d={`M${x + k} ${y - 70} V${y - 12}`} stroke={P.cell.shade} strokeWidth="19" strokeLinecap="round" />)}
        {arms.map((d, i) => <g key={i}><path d={d} fill="none" stroke={P.cell.edge} strokeWidth="24" strokeLinecap="round" /><path d={d} fill="none" stroke={i ? P.cell.shade : P.cell.fill} strokeWidth="17" strokeLinecap="round" /></g>)}
        <rect x={x - w / 2} y={top} width={w} height={h} rx="48" fill={g('cell')} {...e('cell')} />
        <path d={`M${x - w / 2 + 14} ${top + 40} V${top + h - 40}`} stroke={P.cell.light} strokeWidth="8" strokeLinecap="round" opacity="0.6" />
        <path d={`M${x - w / 2} ${top + 46} Q${x - w / 2} ${top} ${x - w / 2 + 48} ${top} H${x + w / 2 - 48} Q${x + w / 2} ${top} ${x + w / 2} ${top + 46} V${top + 52} H${x - w / 2} Z`} fill={g('copper')} {...e('copper')} />
        <rect x={x - 22} y={top - 20} width="44" height="24" rx="8" fill={g('copper')} {...e('copper', 2.5)} />
        <path d={`M${x} ${top + 138} v40 M${x - 20} ${top + 158} h40`} stroke="#D7E8FF" strokeWidth="9" strokeLinecap="round" />
        <Eyes x={x} y={top + 94} mood={pose === 'ready' ? 'calm' : pose === 'push' ? 'set' : 'joy'} look={pose === 'push' ? 1 : 0} />
        <path d={pose === 'push' ? `M${x - 14} ${top + 122} h28` : `M${x - 16} ${top + 118} q16 14 32 0`} fill="none" stroke="#1E2236" strokeWidth="4.5" strokeLinecap="round" />
      </g>
      {pose === 'charged' && [[-120, -170], [120, -190], [-100, -60], [110, -80]].map(([dx, dy], i) => (
        <path key={i} d={`M${x + dx} ${y + dy} l12 -18 l-8 0 l12 -20`} fill="none" stroke="#9FF0FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {pose === 'push' && [0, 1, 2].map((i) => <path key={i} d={`M${x - 120} ${y - 200 + i * 40} h${-30 - 10 * i}`} stroke={SUBTEXT} strokeWidth="5" strokeLinecap="round" opacity="0.5" />)}
    </g>
  );
}

/** Amp, the current: a glowing spark with a comet tail of dots. */
export function Amp({ x, y, pose }: { x: number; y: number; pose: string }) {
  const cy = y - 130, sx = pose === 'squeezed' ? 1.35 : pose === 'race' ? 1.2 : 1, sy = pose === 'squeezed' ? 0.62 : pose === 'race' ? 0.88 : 1;
  return (
    <g>
      <Shadow x={x} y={y} w={60} />
      <circle cx={x} cy={cy} r="140" fill="url(#c_glow)" />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={x - 70 - i * 22} cy={cy + 8 + (i % 2) * 6} r={14 - i * 1.6} fill={g('spark')} opacity={0.85 - i * 0.1} />)}
      {pose === 'race' && [0, 1, 2].map((i) => <path key={i} d={`M${x - 100} ${cy - 40 + i * 40} h-70`} stroke="#FFE79A" strokeWidth="5" strokeLinecap="round" opacity="0.7" />)}
      <g transform={`translate(${x} ${cy}) scale(${sx} ${sy}) translate(${-x} ${-cy})`}>
        {[-18, 18].map((k) => <path key={k} d={`M${x + k} ${cy + 50} l${pose === 'race' ? k * 0.8 : 0} 34`} stroke={P.spark.edge} strokeWidth="9" strokeLinecap="round" />)}
        <path d={`M${x} ${cy - 78} C ${x + 52} ${cy - 40} ${x + 66} ${cy + 10} ${x + 54} ${cy + 36} C ${x + 40} ${cy + 66} ${x - 40} ${cy + 66} ${x - 54} ${cy + 36} C ${x - 66} ${cy + 10} ${x - 52} ${cy - 40} ${x} ${cy - 78} Z`} fill="url(#c_sparkR)" {...e('spark')} />
        <ellipse cx={x - 20} cy={cy - 20} rx="12" ry="22" fill="#FFFFFF" opacity="0.55" />
        <g style={{ color: P.spark.fill }}><Eyes x={x + 4} y={cy + 6} s={0.8} mood={pose === 'squeezed' ? 'worried' : pose === 'race' ? 'set' : 'calm'} look={1} /></g>
        <path d={pose === 'squeezed' ? `M${x - 6} ${cy + 34} q10 -8 20 0` : `M${x - 8} ${cy + 28} q12 14 24 0`} fill={pose === 'squeezed' ? 'none' : '#7A3A12'} stroke="#7A3A12" strokeWidth="4" strokeLinecap="round" />
      </g>
      {pose === 'squeezed' && <path d={`M${x + 70} ${cy - 40} q6 12 0 18 q-6 -6 0 -18 Z`} fill="#BFE6FF" />}
    </g>
  );
}

/** Ohm, the resistor: a beige body striped with its colour bands, metal leads for arms and legs. */
export function Ohm({ x, y, pose }: { x: number; y: number; pose: string }) {
  const w = 170, h = 220, top = y - 66 - h, hot = pose === 'hot';
  const bands: (keyof typeof PAINT)[] = ['bandBrown', 'bandViolet', 'bandRed', 'bandGold'];
  const arm = (k: number) => pose === 'block'
    ? `M${x + k * w / 2} ${top + 110} H${x + k * (w / 2 + 70)} V${top + 60}`
    : pose === 'arms'
      ? `M${x + k * w / 2} ${top + 120} Q${x + k * (w / 2 + 20)} ${top + 150} ${x - k * 30} ${top + 150}`
      : `M${x + k * w / 2} ${top + 120} Q${x + k * (w / 2 + 40)} ${top + 160} ${x + k * (w / 2 + 30)} ${top + 200}`;
  return (
    <g>
      <Shadow x={x} y={y} w={100} />
      {hot && <circle cx={x} cy={top + 110} r="170" fill="url(#c_hot)" />}
      {[-36, 36].map((k) => <path key={k} d={`M${x + k} ${y - 70} V${y - 12} h${k > 0 ? 16 : -16}`} fill="none" stroke={P.lead.edge} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />)}
      {[-36, 36].map((k) => <path key={`f${k}`} d={`M${x + k} ${y - 70} V${y - 12} h${k > 0 ? 16 : -16}`} fill="none" stroke={P.lead.fill} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />)}
      {pose !== 'arms' && [-1, 1].map((k) => <g key={k}><path d={arm(k)} fill="none" stroke={P.lead.edge} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" /><path d={arm(k)} fill="none" stroke={P.lead.fill} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></g>)}
      <rect x={x - w / 2} y={top} width={w} height={h} rx="70" fill={hot ? 'url(#c_heat)' : g('ceramic')} {...e(hot ? 'heat' : 'ceramic')} />
      <path d={`M${x - w / 2 + 18} ${top + 50} V${top + h - 50}`} stroke={hot ? P.heat.light : P.ceramic.light} strokeWidth="9" strokeLinecap="round" opacity="0.7" />
      {bands.map((b, i) => <rect key={b} x={x - w / 2 + 6} y={top + 128 + i * 20} width={w - 12} height="12" rx="4" fill={g(b)} opacity={hot ? 0.85 : 1} />)}
      {pose === 'arms' && [-1, 1].map((k) => <g key={k}><path d={arm(k)} fill="none" stroke={P.lead.edge} strokeWidth="13" strokeLinecap="round" /><path d={arm(k)} fill="none" stroke={P.lead.fill} strokeWidth="7" strokeLinecap="round" /></g>)}
      <g style={{ color: hot ? P.heat.fill : P.ceramic.fill }}><Eyes x={x} y={top + 74} mood={hot ? 'strain' : 'stern'} /></g>
      <path d={hot ? `M${x - 18} ${top + 108} q18 -10 36 0` : `M${x - 18} ${top + 104} h36`} fill="none" stroke="#3A2C22" strokeWidth="5" strokeLinecap="round" />
      {hot && [[-110, -250], [104, -230], [-96, -150]].map(([dx, dy], i) => <path key={i} d={`M${x + dx} ${y + dy} q-10 -18 0 -36 q10 -18 0 -36`} fill="none" stroke="#FF9D7A" strokeWidth="5" strokeLinecap="round" opacity="0.8" />)}
      {hot && <path d={`M${x + 70} ${top + 40} q7 14 0 21 q-7 -7 0 -21 Z`} fill="#BFE6FF" />}
    </g>
  );
}

export function PvCast() {
  useFonts();
  return (
    <AbsoluteFill style={{ background: BOARD }}>
      <svg width="1080" height="1350" viewBox="0 0 1080 1350" style={{ position: 'absolute', inset: 0 }}>
        <Defs />
        <rect width="1080" height="1350" fill="url(#c_spot)" />
        {CAST.map((c, row) => c.poses.map((p, col) => {
          const x = CELL_W * col + CELL_W / 2, y = TOP + ROW_H * row + ROW_H - 70;
          const Body = c.id === 'volt' ? Volt : c.id === 'amp' ? Amp : Ohm;
          return (
            <g key={`${c.id}-${p.id}`}>
              <Body x={x} y={y} pose={p.id} />
              <text x={x} y={y + 44} textAnchor="middle" fontFamily={SOFT_UI_FONT} fontSize="26" fill={SUBTEXT}>{p.label}</text>
            </g>
          );
        }))}
      </svg>
      <div style={{ position: 'absolute', top: 40, width: '100%', textAlign: 'center', color: TEXT, font: `700 46px ${SOFT_UI_FONT}` }}>The cast of Ohm&rsquo;s law</div>
      {CAST.map((c, row) => (
        <div key={c.id} style={{ position: 'absolute', left: 36, top: TOP + ROW_H * row - 30, color: TEXT, font: `700 34px ${SOFT_UI_FONT}` }}>
          {c.name} <span style={{ font: `400 26px ${SOFT_UI_FONT}`, color: SUBTEXT }}>{c.role}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
}
