// Sound Mind scene stories (framework S19): one frame per carousel slide, 1080×1350, rendered to JPEGs by
// soundmind/render.mjs. Layout and rules: lib/sceneStory.ts (and soundmind/cards.js). The art is its own flat, warm style
// (founder, 2026-10-22: "it doesn't have to be ME"): an Indian home at Diwali, drawn with the same hand-drawn wobble as
// the reels, the words on Sound Mind's carousel paper (framework S8).
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Filters, useSoundMindFonts } from './MeStory.tsx';
import {
  W, H, PANEL, TEXT_BOX, CLIFF_BOX, PAPER, INK, CLIFF_INK, STAND, BUBBLE, slideLayout, type ScenePost, type SceneSlide, type TextLayout,
  type BubbleLayout,
} from './lib/sceneStory.ts';

export const C = {
  wall: '#FCE6C4', tile: '#F6D7A6', tileLine: '#E5BE86', top: '#8A5A3B', cabinet: '#C8834F', cabinetLine: '#9C6034',
  floor: '#E9BC8D', glow: '#FFE3A1', room: '#FFD58A', day: '#BFE6F5', dusk: '#F6A880', night: '#2E3A66',
  skin: '#B97A56', skinMil: '#A56B4A', skinKid: '#C78C63', hair: '#2B1D16', grey: '#BDB6AE',
  kurta: '#E4572E', dupatta: '#F2B134', saree: '#2F8F6B', border: '#E9C46A', frock: '#7B61FF',
  steel: '#9AA3AB', kadhai: '#33302D', puri: '#E8A73C', flame: '#FFB000', flameCore: '#FF6A00', clay: '#B5562D',
  leaf: '#4E9F3D', marigold: '#F39C12', mat: '#C0392B', matStripe: '#F2B134', white: '#FFFFFF', bulb: ['#FF4D6D', '#FFD23F', '#2EC4B6', '#7B61FF'],
};
export const S = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ---------- people ----------

export type Mood = 'neutral' | 'tired' | 'sad' | 'surprised' | 'smile' | 'content';   // content: eyes closed, smiling (reel sm011)
export function Face({ x, y, r, mood, skin, glasses = false }: { x: number; y: number; r: number; mood: Mood; skin: string; glasses?: boolean }) {
  const k = r / 50, ey = y - 4 * k;
  const eyes = mood === 'tired' || mood === 'sad' || mood === 'content'
    ? <path d={`M${x - 26 * k} ${ey} q8 ${6 * k} ${16 * k} 0 M${x + 10 * k} ${ey} q8 ${6 * k} ${16 * k} 0`} fill="none" {...S} strokeWidth={4 * k} />
    : <><circle cx={x - 18 * k} cy={ey} r={5 * k} fill={INK} /><circle cx={x + 18 * k} cy={ey} r={5 * k} fill={INK} /></>;
  const brow = mood === 'sad' ? `M${x - 30 * k} ${ey - 14 * k} l${18 * k} ${-6 * k} M${x + 30 * k} ${ey - 14 * k} l${-18 * k} ${-6 * k}`
    : mood === 'surprised' ? `M${x - 30 * k} ${ey - 20 * k} q12 ${-8 * k} ${22 * k} 0 M${x + 8 * k} ${ey - 20 * k} q12 ${-8 * k} ${22 * k} 0`
    : `M${x - 30 * k} ${ey - 14 * k} q12 ${-6 * k} ${22 * k} 0 M${x + 8 * k} ${ey - 14 * k} q12 ${-6 * k} ${22 * k} 0`;
  const my = y + 22 * k;
  const mouth = mood === 'smile' || mood === 'content' ? <path d={`M${x - 16 * k} ${my - 2} Q${x} ${my + 14 * k} ${x + 16 * k} ${my - 2}`} fill="none" {...S} strokeWidth={4 * k} />
    : mood === 'surprised' ? <ellipse cx={x} cy={my + 2} rx={6 * k} ry={8 * k} fill={INK} />
    : mood === 'sad' ? <path d={`M${x - 12 * k} ${my + 6 * k} Q${x} ${my - 2 * k} ${x + 12 * k} ${my + 6 * k}`} fill="none" {...S} strokeWidth={4 * k} />
    : <path d={`M${x - 10 * k} ${my} H${x + 10 * k}`} fill="none" {...S} strokeWidth={4 * k} />;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={skin} {...S} strokeWidth={5 * k} />
      {eyes}
      <path d={brow} fill="none" {...S} strokeWidth={3.5 * k} />
      {mouth}
      {glasses && <g fill="none" {...S} strokeWidth={3 * k}><circle cx={x - 18 * k} cy={ey} r={13 * k} /><circle cx={x + 18 * k} cy={ey} r={13 * k} /><path d={`M${x - 5 * k} ${ey} H${x + 5 * k}`} /></g>}
      <circle cx={x - 30 * k} cy={y + 12 * k} r={7 * k} fill="#E8826B" opacity={mood === 'smile' || mood === 'content' ? 0.7 : 0.35} />
      <circle cx={x + 30 * k} cy={y + 12 * k} r={7 * k} fill="#E8826B" opacity={mood === 'smile' || mood === 'content' ? 0.7 : 0.35} />
    </g>
  );
}

/** Her head: hair parted in the middle, a bun behind, a bindi and small gold earrings. */
export function HerHead({ x, y, r, mood }: { x: number; y: number; r: number; mood: Mood }) {
  const k = r / 50;
  return (
    <g>
      <circle cx={x + 34 * k} cy={y - 26 * k} r={24 * k} fill={C.hair} {...S} strokeWidth={4 * k} />
      <Face x={x} y={y} r={r} mood={mood} skin={C.skin} />
      <path d={`M${x - r - 2} ${y + 4 * k} Q${x - r} ${y - r - 6 * k} ${x} ${y - r - 2 * k} Q${x + r} ${y - r - 6 * k} ${x + r + 2} ${y + 4 * k} Q${x + 30 * k} ${y - 30 * k} ${x} ${y - 34 * k} Q${x - 30 * k} ${y - 30 * k} ${x - r - 2} ${y + 4 * k} Z`}
        fill={C.hair} {...S} strokeWidth={4 * k} />
      <circle cx={x} cy={y - 22 * k} r={4.5 * k} fill="#D62828" />
      <circle cx={x - r + 2} cy={y + 20 * k} r={5 * k} fill={C.dupatta} stroke={INK} strokeWidth={2 * k} />
      <circle cx={x + r - 2} cy={y + 20 * k} r={5 * k} fill={C.dupatta} stroke={INK} strokeWidth={2 * k} />
    </g>
  );
}

type Arm = { from: [number, number]; to: [number, number] };
/** A kurta sleeve to the elbow, then a bare forearm with two bangles. */
export function KurtaArm({ from, to, sleeve = C.kurta, skin = C.skin }: Arm & { sleeve?: string; skin?: string }) {
  const [x0, y0] = from, [x1, y1] = to, ex = x0 + (x1 - x0) * 0.5, ey = y0 + (y1 - y0) * 0.5 + 10;
  return (
    <g>
      <path d={`M${x0} ${y0} Q${ex - 10} ${ey - 10} ${ex} ${ey} T${x1} ${y1}`} fill="none" stroke={INK} strokeWidth="26" strokeLinecap="round" />
      <path d={`M${x0} ${y0} Q${ex - 10} ${ey - 10} ${ex} ${ey} T${x1} ${y1}`} fill="none" stroke={skin} strokeWidth="17" strokeLinecap="round" />
      <path d={`M${x0} ${y0} Q${ex - 10} ${ey - 10} ${ex} ${ey}`} fill="none" stroke={INK} strokeWidth="34" strokeLinecap="round" />
      <path d={`M${x0} ${y0} Q${ex - 10} ${ey - 10} ${ex} ${ey}`} fill="none" stroke={sleeve} strokeWidth="25" strokeLinecap="round" />
      {[0.78, 0.84].map((u) => <circle key={u} cx={ex + (x1 - ex) * u} cy={ey + (y1 - ey) * u} r="11" fill="none" stroke={u < 0.8 ? '#D62828' : C.dupatta} strokeWidth="4" />)}
      <circle cx={x1} cy={y1} r="13" fill={skin} {...S} strokeWidth={4} />
    </g>
  );
}

/** Her, standing behind the counter (seen from the waist up), with her arms placed by `arms`. */
function HerStanding({ x, mood, arms }: { x: number; mood: Mood; arms: Arm[] }) {
  const y = STAND.y;
  return (
    <g>
      <path d={`M${x - 14} ${y + 40} V${y + 76} H${x + 14} V${y + 40} Z`} fill={C.skin} {...S} />
      <path d={`M${x - 82} ${y + 92} Q${x} ${y + 66} ${x + 82} ${y + 92} L${x + 98} 900 H${x - 98} Z`} fill={C.kurta} {...S} />
      <path d={`M${x - 16} ${y + 76} L${x} ${y + 104} L${x + 16} ${y + 76}`} fill="none" {...S} strokeWidth={4} />
      <path d={`M${x - 70} ${y + 88} L${x + 92} 880 L${x + 60} 900 L${x - 86} ${y + 120} Z`} fill={C.dupatta} {...S} />
      {arms.map((a, i) => <KurtaArm key={i} {...a} />)}
      <HerHead x={x} y={y} r={STAND.r} mood={mood} />
    </g>
  );
}

function HerSitting({ x, headY, mood }: { x: number; headY: number; mood: Mood }) {
  const seat = headY + 240;
  return (
    <g>
      <path d={`M${x - 70} ${seat + 8} H${x + 70} M${x - 56} ${seat + 8} L${x - 66} 1120 M${x + 56} ${seat + 8} L${x + 66} 1120 M${x - 62} ${seat + 80} H${x + 62}`} {...S} strokeWidth={9} stroke={C.cabinetLine} />
      <path d={`M${x - 76} ${seat} H${x + 76}`} {...S} strokeWidth={16} stroke={C.top} />
      <path d={`M${x - 40} ${seat - 4} L${x + 110} ${seat - 4} L${x + 120} 1110 H${x + 80} L${x + 72} ${seat + 40} H${x - 30} Z`} fill="#F7E7C6" {...S} />
      <path d={`M${x + 74} 1110 h60 v16 h-64 Z`} fill={C.skin} {...S} strokeWidth={4} />
      <path d={`M${x - 76} ${headY + 92} Q${x} ${headY + 66} ${x + 76} ${headY + 92} L${x + 84} ${seat + 6} H${x - 84} Z`} fill={C.kurta} {...S} />
      <path d={`M${x - 64} ${headY + 88} L${x + 80} ${seat - 6} L${x + 50} ${seat + 6} L${x - 80} ${headY + 120} Z`} fill={C.dupatta} {...S} />
      <KurtaArm from={[x - 70, headY + 104]} to={[x + 10, seat - 24]} />
      <KurtaArm from={[x + 70, headY + 104]} to={[x + 96, seat - 20]} />
      <HerHead x={x} y={headY} r={50} mood={mood} />
    </g>
  );
}

function MotherInLaw({ x, y, mood, hand }: { x: number; y: number; mood: Mood; hand: [number, number] }) {
  return (
    <g>
      <path d={`M${x - 14} ${y + 40} V${y + 76} H${x + 14} V${y + 40} Z`} fill={C.skinMil} {...S} />
      <path d={`M${x - 84} ${y + 92} Q${x} ${y + 66} ${x + 84} ${y + 92} L${x + 98} 900 H${x - 98} Z`} fill={C.saree} {...S} />
      <path d={`M${x + 70} ${y + 86} L${x - 60} 900 L${x - 98} 900 L${x - 96} ${y + 200} L${x + 40} ${y + 80} Z`} fill={C.saree} {...S} />
      <path d={`M${x + 52} ${y + 82} L${x - 72} 900`} stroke={C.border} strokeWidth="12" />
      <KurtaArm from={[x + 66, y + 104]} to={hand} sleeve={C.saree} skin={C.skinMil} />
      <circle cx={x - 30} cy={y - 30} r={24} fill={C.grey} {...S} strokeWidth={4} />
      <Face x={x} y={y} r={50} mood={mood} skin={C.skinMil} glasses />
      <path d={`M${x - 52} ${y + 4} Q${x - 50} ${y - 56} ${x} ${y - 52} Q${x + 50} ${y - 56} ${x + 52} ${y + 4} Q${x + 30} ${y - 30} ${x} ${y - 34} Q${x - 30} ${y - 30} ${x - 52} ${y + 4} Z`} fill={C.grey} {...S} strokeWidth={4} />
      <circle cx={x} cy={y - 20} r={5} fill="#8E1B1B" />
    </g>
  );
}

function Daughter({ x, y, mood, hand }: { x: number; y: number; mood: Mood; hand: [number, number] }) {
  const r = 40;
  return (
    <g>
      <path d={`M${x - 18} ${y + 140} V${y + 260} M${x + 18} ${y + 140} V${y + 260}`} stroke={INK} strokeWidth="20" strokeLinecap="round" />
      <path d={`M${x - 18} ${y + 140} V${y + 260} M${x + 18} ${y + 140} V${y + 260}`} stroke={C.skinKid} strokeWidth="12" strokeLinecap="round" />
      <path d={`M${x - 30} ${y + 42} H${x + 30} L${x + 62} ${y + 160} H${x - 62} Z`} fill={C.frock} {...S} />
      <KurtaArm from={[x + 24, y + 56]} to={hand} sleeve={C.frock} skin={C.skinKid} />
      {[-1, 1].map((s) => <g key={s}><circle cx={x + s * 44} cy={y - 6} r={14} fill={C.hair} {...S} strokeWidth={3} /><circle cx={x + s * 44} cy={y + 12} r={7} fill="#FF4D6D" {...S} strokeWidth={2} /></g>)}
      <Face x={x} y={y} r={r} mood={mood} skin={C.skinKid} />
      <path d={`M${x - r} ${y} Q${x - r} ${y - r - 6} ${x} ${y - r - 2} Q${x + r} ${y - r - 6} ${x + r} ${y} Q${x + 20} ${y - 26} ${x} ${y - 28} Q${x - 20} ${y - 26} ${x - r} ${y} Z`} fill={C.hair} {...S} strokeWidth={3.5} />
    </g>
  );
}

/** A simple seated relative on the floor: head, shoulders and a plate in front. */
function Seated({ x, y, r, cloth, mood = 'smile', skin = C.skin, grey = false }: { x: number; y: number; r: number; cloth: string; mood?: Mood; skin?: string; grey?: boolean }) {
  return (
    <g>
      <path d={`M${x - r * 1.8} ${y + r * 3.2} Q${x - r * 1.7} ${y + r * 1.2} ${x} ${y + r * 1.1} Q${x + r * 1.7} ${y + r * 1.2} ${x + r * 1.8} ${y + r * 3.2} Z`} fill={cloth} {...S} strokeWidth={4} />
      <Face x={x} y={y} r={r} mood={mood} skin={skin} />
      <path d={`M${x - r} ${y} Q${x - r} ${y - r - 6} ${x} ${y - r - 2} Q${x + r} ${y - r - 6} ${x + r} ${y} Q${x + r * 0.6} ${y - r * 0.6} ${x} ${y - r * 0.7} Q${x - r * 0.6} ${y - r * 0.6} ${x - r} ${y} Z`} fill={grey ? C.grey : C.hair} {...S} strokeWidth={3.5} />
    </g>
  );
}

// ---------- things ----------

function Diya({ x, y, s = 1, glow = true }: { x: number; y: number; s?: number; glow?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow && <circle cx="0" cy="-36" r="70" fill={C.flame} opacity="0.22" />}
      <path d="M-46 0 Q0 34 46 0 Q30 -14 0 -12 Q-30 -14 -46 0 Z" fill={C.clay} {...S} />
      <path d="M0 -14 C-16 -34 -6 -56 0 -72 C6 -56 16 -34 0 -14 Z" fill={C.flame} {...S} strokeWidth={3} />
      <path d="M0 -20 C-6 -30 -3 -42 0 -50 C3 -42 6 -30 0 -20 Z" fill={C.flameCore} />
    </g>
  );
}

function Rangoli({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  const rings = ['#E4572E', '#F2B134', '#2EC4B6', '#7B61FF', '#FF4D6D'];
  return (
    <g>
      {rings.map((c, i) => <ellipse key={c} cx={x} cy={y} rx={rx * (1 - i * 0.18)} ry={ry * (1 - i * 0.18)} fill={c} stroke={INK} strokeWidth="3" />)}
      {Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5; return <circle key={i} cx={x + rx * 0.9 * Math.cos(a)} cy={y + ry * 0.9 * Math.sin(a)} r="7" fill={C.white} stroke={INK} strokeWidth="2" />; })}
    </g>
  );
}

function Toran({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const n = Math.round((x1 - x0) / 34);
  return (
    <g>
      <path d={`M${x0} ${y} H${x1}`} {...S} strokeWidth={4} />
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + 17 + i * ((x1 - x0 - 34) / (n - 1));
        return i % 2 ? <circle key={i} cx={x} cy={y + 16} r="11" fill={C.marigold} {...S} strokeWidth={3} />
          : <path key={i} d={`M${x} ${y} q-12 22 0 44 q12 -22 0 -44 Z`} fill={C.leaf} {...S} strokeWidth={3} />;
      })}
    </g>
  );
}

function Lights({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const n = Math.round((x1 - x0) / 46);
  return (
    <g>
      <path d={`M${x0} ${y} ${Array.from({ length: n }, (_, i) => `Q${x0 + (i + 0.5) * ((x1 - x0) / n)} ${y + 30} ${x0 + (i + 1) * ((x1 - x0) / n)} ${y}`).join(' ')}`} fill="none" {...S} strokeWidth={3} />
      {Array.from({ length: n }, (_, i) => { const x = x0 + (i + 0.5) * ((x1 - x0) / n); return <g key={i}><circle cx={x} cy={y + 24} r="16" fill={C.bulb[i % 4]} opacity="0.3" /><circle cx={x} cy={y + 24} r="8" fill={C.bulb[i % 4]} {...S} strokeWidth={2.5} /></g>; })}
    </g>
  );
}

function Kadhai({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 90} ${y - 6} Q${x} ${y + 60} ${x + 90} ${y - 6} Z`} fill={C.kadhai} {...S} />
      <path d={`M${x - 104} ${y - 10} q-14 -6 -6 -18 M${x + 104} ${y - 10} q14 -6 6 -18`} fill="none" {...S} strokeWidth={6} />
      <ellipse cx={x} cy={y - 6} rx="90" ry="12" fill="#C98A2B" {...S} strokeWidth={4} />
      {[-40, 0, 40].map((d) => <ellipse key={d} cx={x + d} cy={y - 12} rx="24" ry="9" fill={C.puri} {...S} strokeWidth={3} />)}
    </g>
  );
}

function ChaiTray({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 120} ${y} H${x + 120} L${x + 108} ${y + 14} H${x - 108} Z`} fill={C.steel} {...S} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => {
        const cx = x - 100 + (i % 6) * 40, cy = y - (i < 6 ? 6 : 26), back = i < 6 ? 0 : 1;
        return <path key={i} d={`M${cx - 13} ${cy - 30} H${cx + 13} L${cx + 10} ${cy} H${cx - 10} Z`} fill={back ? '#E7C79A' : '#D29A5C'} stroke={INK} strokeWidth="3" />;
      })}
    </g>
  );
}

/** The kitchen: wall, window (sky by time of day), shelf, tiles, counter and stove, the doorway to the living room. */
function Kitchen({ sky, doorX = [90, 300], counterX = 320, stoveX = STAND.x }: { sky: string; doorX?: [number, number]; counterX?: number; stoveX?: number }) {
  const [d0, d1] = doorX;
  return (
    <g>
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill={C.wall} />
      <rect x="820" y="380" width="160" height="170" rx="8" fill={sky} {...S} />
      <path d="M900 380 V550 M820 465 H980" {...S} strokeWidth={4} />
      {sky === C.night && <><circle cx="945" cy="410" r="16" fill="#FFF3C4" /><circle cx="860" cy="420" r="3" fill="#FFF3C4" /><circle cx="880" cy="500" r="3" fill="#FFF3C4" /></>}
      <path d={`M${counterX + 160} 470 H${counterX + 420}`} {...S} strokeWidth={8} stroke={C.cabinetLine} />
      {[0, 1, 2].map((i) => <rect key={i} x={counterX + 180 + i * 80} y="418" width="44" height="52" rx="8" fill={['#F2B134', '#E4572E', '#2EC4B6'][i]} {...S} strokeWidth={4} />)}
      <rect x={counterX} y="760" width={PANEL.x + PANEL.w - counterX} height="112" fill={C.tile} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${counterX + i * 60} 760 V872`} stroke={C.tileLine} strokeWidth="3" />)}
      <path d={`M${counterX} 816 H${PANEL.x + PANEL.w}`} stroke={C.tileLine} strokeWidth="3" />
      <rect x={PANEL.x} y="1060" width={PANEL.w} height="90" fill={C.floor} />
      <rect x={d0} y="420" width={d1 - d0} height="640" fill={C.glow} {...S} />
      <path d={`M${d0} 420 V1060 M${d1} 420 V1060`} stroke={C.cabinetLine} strokeWidth="14" />
      <Toran x0={d0 - 6} x1={d1 + 6} y={424} />
      <StoveCounter counterX={counterX} stoveX={stoveX} />
    </g>
  );
}
function StoveCounter({ counterX, stoveX }: { counterX: number; stoveX: number }) {
  const x1 = PANEL.x + PANEL.w;
  return (
    <g>
      <rect x={stoveX - 130} y="852" width="260" height="22" rx="6" fill="#3B3B3B" {...S} strokeWidth={4} />
      <Kadhai x={stoveX} y={850} />
      <rect x={counterX} y="872" width={x1 - counterX} height="26" fill={C.top} {...S} />
      <rect x={counterX} y="898" width={x1 - counterX} height="162" fill={C.cabinet} {...S} />
      {Array.from({ length: Math.floor((x1 - counterX) / 175) }, (_, i) => (
        <g key={i}><rect x={counterX + 14 + i * 175} y="914" width="150" height="130" rx="8" fill="none" stroke={C.cabinetLine} strokeWidth="5" />
          <circle cx={counterX + 140 + i * 175} cy="980" r="6" fill={C.cabinetLine} /></g>
      ))}
    </g>
  );
}

/** The living room through a wide doorway: lights, a floor mat and the family eating (dinner) or all together (table). */
function LivingRoom({ x0, x1 }: { x0: number; x1: number }) {
  return (
    <g>
      <rect x={x0} y={PANEL.y} width={x1 - x0} height={PANEL.h} fill={C.room} />
      <Lights x0={x0 + 10} x1={x1 - 10} y={400} />
      <rect x={x0} y="880" width={x1 - x0} height="270" fill={C.mat} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${x0} ${910 + i * 70} H${x1}`} stroke={C.matStripe} strokeWidth="10" />)}
    </g>
  );
}
function Thali({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="56" ry="18" fill={C.steel} {...S} strokeWidth={4} />
      <ellipse cx={x - 16} cy={y - 4} rx="18" ry="7" fill={C.puri} stroke={INK} strokeWidth="2.5" />
      <ellipse cx={x + 18} cy={y - 2} rx="12" ry="6" fill="#E4572E" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

// ---------- the scenes ----------

const stir = (x: number): Arm[] => [{ from: [x - 72, STAND.y + 104], to: [x - 30, 830] }, { from: [x + 72, STAND.y + 104], to: [x + 96, 868] }];
const Ladle = ({ x0, y0, x1, y1 }: { x0: number; y0: number; x1: number; y1: number }) => (
  <g><path d={`M${x0} ${y0} L${x1} ${y1}`} {...S} strokeWidth={10} stroke={C.steel} /><path d={`M${x0} ${y0} L${x1} ${y1}`} fill="none" {...S} strokeWidth={3} />
    <ellipse cx={x1} cy={y1 + 6} rx="22" ry="12" fill={C.steel} {...S} strokeWidth={4} /></g>
);

function SceneArt({ scene }: { scene: string }) {
  switch (scene) {
    case 'stove':
      return <><Kitchen sky={C.dusk} /><Diya x={470} y={868} /><HerStanding x={STAND.x} mood="tired" arms={stir(STAND.x)} /><Ladle x0={STAND.x - 34} y0={826} x1={STAND.x - 4} y1={846} /><StoveFront /></>;
    case 'morning':
      return <><Kitchen sky={C.day} /><Rangoli x={195} y={1104} rx={110} ry={34} /><ChaiTray x={470} y={866} /><HerStanding x={STAND.x} mood="neutral" arms={stir(STAND.x)} /><Ladle x0={STAND.x - 34} y0={826} x1={STAND.x - 4} y1={846} /><StoveFront /></>;
    case 'calls':
      return <><Kitchen sky={C.day} /><ChaiTray x={470} y={866} /><HerStanding x={STAND.x} mood="neutral" arms={stir(STAND.x)} /><Ladle x0={STAND.x - 34} y0={826} x1={STAND.x - 4} y1={846} /><StoveFront /></>;
    case 'stool':
      return <><Kitchen sky={C.day} /><HerSitting x={560} headY={720} mood="tired" /></>;
    case 'thought':
      return (
        <>
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill={C.wall} />
          <rect x="90" y="420" width="210" height="730" fill={C.glow} {...S} /><Toran x0={84} x1={306} y={424} />
          <path d="M260 1150 Q270 1050 400 1030 H680 Q810 1050 820 1150 Z" fill={C.kurta} {...S} />
          <path d="M360 1034 L700 1150 H620 L340 1060 Z" fill={C.dupatta} {...S} />
          <HerHead x={540} y={840} r={190} mood="sad" />
        </>
      );
    case 'dinner':
      return (
        <>
          <Kitchen sky={C.night} doorX={[480, 500]} counterX={500} stoveX={780} />
          <LivingRoom x0={PANEL.x} x1={486} />
          {[[170, 790, C.saree, C.skinMil, true], [250, 780, '#3A6EA5', C.skin, false], [330, 790, '#7B61FF', C.skinKid, false], [410, 785, '#E4572E', C.skinMil, false]].map(([x, y, cloth, skin, grey], i) =>
            <g key={i}><Seated x={x as number} y={y as number} r={i === 3 ? 24 : 28} cloth={cloth as string} skin={skin as string} grey={grey as boolean} /><Thali x={x as number} y={920} /></g>)}
          <HerStanding x={780} mood="tired" arms={stir(780)} /><Ladle x0={746} y0={826} x1={776} y1={846} /><StoveFront x={780} />
        </>
      );
    case 'daughter':
      return <><Kitchen sky={C.night} stoveX={720} /><HerStanding x={720} mood="sad" arms={[{ from: [648, STAND.y + 104], to: [578, 876] }, { from: [792, STAND.y + 104], to: [816, 868] }]} /><StoveFront x={720} /><Daughter x={470} y={800} mood="sad" hand={[560, 884]} /></>;
    case 'ladle':
      return (
        <>
          <Kitchen sky={C.night} doorX={[90, 230]} stoveX={740} />
          <MotherInLaw x={380} y={600} mood="neutral" hand={[540, 800]} />
          <HerStanding x={740} mood="surprised" arms={[{ from: [668, STAND.y + 124], to: [600, 806] }, { from: [812, STAND.y + 104], to: [836, 868] }]} />
          <Ladle x0={548} y0={798} x1={600} y1={846} />
          <StoveFront x={740} />
        </>
      );
    case 'table':
      return (
        <>
          <LivingRoom x0={PANEL.x} x1={PANEL.x + PANEL.w} />
          <Toran x0={300} x1={780} y={350} />
          <Seated x={230} y={760} r={42} cloth="#3A6EA5" />
          <Seated x={380} y={740} r={44} cloth={C.saree} skin={C.skinMil} grey />
          <Seated x={850} y={760} r={42} cloth="#E4572E" skin={C.skinMil} />
          <path d="M440 1010 Q440 860 540 846 Q640 860 640 1010 Z" fill={C.kurta} {...S} />
          <path d="M466 856 L630 1010 H590 L446 880 Z" fill={C.dupatta} {...S} />
          <HerHead x={540} y={760} r={50} mood="smile" />
          <path d="M520 990 Q500 900 560 896 Q620 900 600 990 Z" fill={C.frock} {...S} />
          <Daughter x={560} y={860} mood="smile" hand={[610, 930]} />
          {[230, 380, 540, 700, 850].map((x) => <Thali key={x} x={x} y={1040} />)}
          {[150, 930].map((x) => <Diya key={x} x={x} y={1120} s={0.8} />)}
        </>
      );
    case 'diya':
      return (
        <>
          <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} fill="#3A2A4A" />
          <Lights x0={90} x1={990} y={380} />
          <Rangoli x={540} y={960} rx={330} ry={110} />
          <Diya x={540} y={940} s={2.2} />
          {[260, 820].map((x) => <Diya key={x} x={x} y={1100} s={1} />)}
        </>
      );
    default:
      return null;
  }
}
// The front lip of the counter over her waist, so she stands behind it.
const StoveFront = ({ x = STAND.x }: { x?: number }) => <rect x={x - 110} y="872" width="220" height="26" fill={C.top} {...S} />;

// ---------- words ----------

/** Text lines with *marked* words in the deep coral; a mark can run across lines. */
function Lines({ layout, x, y, anchor = 'middle', colour = INK }: { layout: TextLayout; x: number; y: number; anchor?: 'start' | 'middle'; colour?: string }) {
  let marked = false;
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={layout.font} fontWeight={layout.font === 'Kalam' ? 700 : 400} fontSize={layout.size} fill={colour}>
      {layout.lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : layout.lineHeight}>
          {l.text.split('*').map((part, k) => { if (k > 0) marked = !marked; return part ? <tspan key={k} fill={marked ? CLIFF_INK : colour}>{part}</tspan> : null; })}
        </tspan>
      ))}
    </text>
  );
}

function BubbleShape({ b }: { b: BubbleLayout }) {
  const { x0, y0, x1, y1 } = b.box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // Where the tail leaves the bubble: its edge, on the way to the speaker.
  const dx = b.tail.x - cx, dy = b.tail.y - cy, t = Math.min((x1 - x0) / 2 / Math.abs(dx || 1e-6), (y1 - y0) / 2 / Math.abs(dy || 1e-6));
  const ex = cx + dx * t * 0.92, ey = cy + dy * t * 0.92, nx = -dy / Math.hypot(dx, dy), ny = dx / Math.hypot(dx, dy);
  const text = { font: 'Kalam' as const, size: BUBBLE.size, lineHeight: b.lineHeight, lines: b.lines };
  const top = cy - ((b.lines.length - 1) * b.lineHeight) / 2 + 12;
  return (
    <g>
      {b.kind === 'say'
        ? <path d={`M${ex + nx * 22} ${ey + ny * 22} L${b.tail.x} ${b.tail.y} L${ex - nx * 22} ${ey - ny * 22} Z`} fill={C.white} {...S} />
        : [0.35, 0.65, 0.9].map((u, i) => <circle key={i} cx={ex + (b.tail.x - ex) * u} cy={ey + (b.tail.y - ey) * u} r={14 - i * 4} fill={C.white} {...S} strokeWidth={4} />)}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={b.kind === 'say' ? 30 : (y1 - y0) / 2} fill={C.white} {...S} />
      {b.kind === 'say' && <path d={`M${ex + nx * 18} ${ey + ny * 18} L${ex - nx * 18} ${ey - ny * 18}`} stroke={C.white} strokeWidth="9" />}
      <Lines layout={text} x={cx} y={top} />
    </g>
  );
}

function Arrow({ x, y, colour }: { x: number; y: number; colour: string }) {
  return <path d={`M${x} ${y} H${x + 46} M${x + 30} ${y - 16} L${x + 48} ${y} L${x + 30} ${y + 16}`} fill="none" stroke={colour} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />;
}

export function SceneSlideView({ slide, index, count }: { slide: SceneSlide; index: number; count: number }) {
  const l = slideLayout(slide, index, count);
  const textTop = TEXT_BOX.y + (TEXT_BOX.h - l.text.lines.length * l.text.lineHeight) / 2 + l.text.lineHeight * 0.78;
  const sharing = slide.type === 'share';
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <defs><clipPath id="panel"><rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="36" /></clipPath></defs>
        {slide.scene && (
          <>
            <g clipPath="url(#panel)"><g filter="url(#rough)"><SceneArt scene={slide.scene} /></g></g>
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="36" fill="none" stroke={INK} strokeWidth="6" />
            {l.bubbles.map((b, i) => <BubbleShape key={i} b={b} />)}
          </>
        )}
        <Lines layout={l.text} x={W / 2} y={sharing && !slide.scene ? 640 : textTop} />
        {l.cliff && (
          <g>
            <text x={W / 2 - 35} y={CLIFF_BOX.y + CLIFF_BOX.h / 2 + l.cliff.size * 0.35} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize={l.cliff.size} fill={CLIFF_INK}>{l.cliff.text}</text>
            <Arrow x={W / 2 + l.cliff.width / 2 - 56} y={CLIFF_BOX.y + CLIFF_BOX.h / 2} colour={CLIFF_INK} />
          </g>
        )}
        {index === 0 && <g><text x={W / 2 - 30} y={CLIFF_BOX.y + CLIFF_BOX.h / 2 + 14} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="40" fill={CLIFF_INK}>Swipe</text><Arrow x={W / 2 + 34} y={CLIFF_BOX.y + CLIFF_BOX.h / 2} colour={CLIFF_INK} /></g>}
        <text x={W - 60} y="58" textAnchor="end" fontFamily="Lora" fontSize="26" fill={INK} opacity="0.75">{l.page}</text>
        <text x={W / 2} y={H - 40} textAnchor="middle" fontFamily="Lora" fontSize="28" fill={INK} opacity="0.8">@soundmindwithshivani</text>
      </svg>
    </AbsoluteFill>
  );
}

/** The composition: frame i is slide i of `post` (passed with --props at render time). */
export function SceneStory({ post }: { post: ScenePost | null }) {
  useSoundMindFonts();
  const frame = useCurrentFrame();
  if (!post) return <AbsoluteFill style={{ background: PAPER }} />;
  return <SceneSlideView slide={post.slides[frame]} index={frame} count={post.slides.length} />;
}
export const sceneStoryFrames = (post: ScenePost | null) => (post ? post.slides.length : 1);
