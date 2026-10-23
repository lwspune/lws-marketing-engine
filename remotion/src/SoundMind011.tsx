// @soundmindwithshivani reel #11, the first "pause" reel (framework S20). Timeline and rules: lib/sm011.ts. One flat,
// warm drawing filmed in four shots: layers at their own depth (parallax), soft focus behind the close-ups, dissolves
// between shots. She is in her early 20s (founder, 2026-10-23): loose hair, an oversized sweatshirt, on a floor cushion
// with her knees drawn up. Her face comes from the scene stories (SceneStory.tsx).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  W, H, DURATION, HOOK, LINE2, SCENE, AWNING_Y, LIGHTS_Y, RAIL_Y, RAIL_H, FLOOR_Y, FIG, fromWorld, HER, SEAT_Y, KNEE_Y,
  STOOL, TULSI, LEAVES, LEAF_HITS, RAIN_N, SHOTS, LAYERS, shotAt, cameraAt, cameraTransform, layerCam, dissolveAt,
  focusBlur, cupAt, leanAt, eyesClosed, headTiltAt, breezeAt, steamAt, rainStreak, DRIPS, dripAt, leafBob, hitDropAt,
  railDripAt, type Cam,
} from './lib/sm011.ts';
import { VIVID } from './lib/smPalette.ts';
import { Filters, Grain, Words, useSoundMindFonts } from './MeStory.tsx';
import { C as SC, S, Face } from './SceneStory.tsx';

const COVER_T = 1.9;                                     // the glass at her lips, eyes closed, the message up
const INK = SCENE.ink;
const K = {
  awning: '#F2E6D3', beam: '#C8834F', wire: '#3B3B3B', hills: ['#9CC7B4', '#7DB89C'], mist: '#EEF3F4',
  towers: ['#E8DCCB', '#D9C3A8', '#F1E3CF', '#CDB9A2', '#E4D2BB'], windowOff: '#B7C3CB', windowOn: '#FFD27A',
  trees: ['#3FA34D', '#6CC58A', '#2E8B57'], trunk: '#7A5236', rain: '#FFFFFF', drop: '#8FD3F5', puddle: '#BFD8E6',
  ledge: '#E7DCCB', bar: '#4A4F55', wood: '#B7773F', phone: '#2B2D42', biscuit: '#E8B04A',
  pot: '#E2724A', potRim: '#C85A35', stem: '#5C7F3A', leaf: ['#3FA34D', '#58B85E'], manjari: '#8E5BA8',
  glass: '#F4F1EA', chai: '#C67B3C',
  // her (founder, 2026-10-23: early 20s, not a middle-aged woman; a lighter, warm skin tone)
  skin: '#E2AE88', hair: '#2B1D16', top: '#FF6B5B', topDark: '#E2574A', pants: '#7FA7E0', pantsLine: '#5F88C4',
  cushion: '#2EC4B6', trim: '#FFD23F',
};
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const layer = (cam: Cam, depth: number) => cameraTransform(layerCam(cam, depth));

/** A falling drop: a teardrop with its point up, (x, y) at its round bottom. */
const Drop = ({ x, y, r, opacity = 1 }: { x: number; y: number; r: number; opacity?: number }) => (
  <path d={`M${x} ${y - 3.2 * r} Q${x + 1.2 * r} ${y - 1.2 * r} ${x + r} ${y - 0.4 * r} A${r} ${r} 0 1 1 ${x - r} ${y - 0.4 * r} Q${x - 1.2 * r} ${y - 1.2 * r} ${x} ${y - 3.2 * r} Z`}
    fill={K.drop} stroke={INK} strokeWidth="2.5" opacity={opacity} />
);

// ---- far away: hills, the town, trees, rain ----------------------------------------------------------------------------
const TOWERS = [
  { x: -20, w: 200, top: 620 }, { x: 170, w: 150, top: 700 }, { x: 330, w: 210, top: 560 }, { x: 560, w: 170, top: 660 },
  { x: 740, w: 220, top: 590 }, { x: 950, w: 160, top: 680 },
];
const LATE_WINDOWS: Record<string, number> = { '2-3-1': 2.2, '4-2-2': 12.4, '0-4-0': 6.0 };   // switched on as the town comes home

const Hills = () => (
  <g>
    <path d="M-200 640 Q180 560 360 610 T720 590 T1280 600 V1300 H-200 Z" fill={K.hills[0]} />
    <path d="M-200 700 Q240 640 480 690 T1280 670 V1300 H-200 Z" fill={K.hills[1]} />
  </g>
);

function Town({ t }: { t: number }) {
  return (
    <g>
      {TOWERS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.top} width={b.w} height={RAIL_Y + 60 - b.top} fill={K.towers[i % K.towers.length]} {...S} strokeWidth={4} />
          {Array.from({ length: Math.floor((RAIL_Y - b.top - 40) / 70) }, (_, r) => Array.from({ length: Math.floor((b.w - 30) / 50) }, (_, c) => {
            const key = `${i}-${r}-${c}`, late = LATE_WINDOWS[key];
            const on = late !== undefined ? t >= late : rnd(i * 31 + r * 7 + c, 9) < 0.35;
            return <rect key={key} x={b.x + 22 + c * 50} y={b.top + 30 + r * 70} width="24" height="34" rx="3" fill={on ? K.windowOn : K.windowOff} />;
          }))}
        </g>
      ))}
      <defs>
        <linearGradient id="sm11mist" x1="0" y1="560" x2="0" y2={RAIL_Y} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={K.mist} stopOpacity="0.55" /><stop offset="1" stopColor={K.mist} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="-100" y="560" width={W + 200} height={RAIL_Y + 60 - 560} fill="url(#sm11mist)" />
    </g>
  );
}

// A tree's crown sways in the breeze around the top of its trunk.
const Tree = ({ x, y, r, shade, t }: { x: number; y: number; r: number; shade: number; t: number }) => (
  <g>
    <path d={`M${x - 16} ${RAIL_Y + 60} L${x - 10} ${y + r * 0.4} H${x + 10} L${x + 16} ${RAIL_Y + 60} Z`} fill={K.trunk} {...S} strokeWidth={4} />
    <g transform={`rotate(${1.4 * breezeAt(t, shade * 2.1)} ${x} ${y + r * 0.6})`}>
      {[[-0.6, 0.15, 0.62], [0.55, 0.1, 0.66], [0, -0.35, 0.75], [0, 0.25, 0.7]].map(([dx, dy, k], j) => (
        <circle key={j} cx={x + dx * r} cy={y + dy * r} r={k * r} fill={K.trees[(shade + j) % K.trees.length]} {...S} strokeWidth={4} />
      ))}
    </g>
  </g>
);

/** Rain streaks: `near` ones are thicker, longer and quicker than the far curtain. */
function Rain({ t, near }: { t: number; near: boolean }) {
  const n = near ? 70 : RAIN_N, off = near ? 1000 : 0, speed = near ? 1.25 : 0.8;
  return (
    <g stroke={K.rain} strokeWidth={near ? 5 : 2.5} strokeLinecap="round" opacity={near ? 0.75 : 0.6}>
      {Array.from({ length: n }, (_, i) => {
        const r = rainStreak(i + off, t * speed), len = r.len * (near ? 1.8 : 1);
        return <path key={i} d={`M${r.x} ${r.y} l${-0.2 * len} ${-len}`} />;
      })}
    </g>
  );
}

// ---- the balcony: awning + fairy lights, the ledge and grill, the floor and a puddle -----------------------------------
function Awning({ t }: { t: number }) {
  const n = 22, sag = (x: number) => LIGHTS_Y - 14 + 26 * Math.sin((Math.PI * ((x % 360) + 360)) / 360) + 5 * breezeAt(t, x / 200);
  const wire = Array.from({ length: 61 }, (_, i) => { const x = (i * W) / 60; return `${i ? 'L' : 'M'}${x} ${sag(x)}`; }).join(' ');
  return (
    <g>
      <rect x="0" y="0" width={W} height={AWNING_Y} fill={K.awning} />
      <rect x="0" y={AWNING_Y - 22} width={W} height="22" fill={K.beam} {...S} strokeWidth={4} />
      <path d={wire} fill="none" stroke={K.wire} strokeWidth="3" />
      {Array.from({ length: n }, (_, i) => {
        const x = 25 + (i * (W - 50)) / (n - 1), y = sag(x) + 12, tw = 0.6 + 0.4 * Math.sin(t * 2.3 + i * 1.7), c = SC.bulb[i % SC.bulb.length];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="22" fill={c} opacity={0.32 * tw} />
            <ellipse cx={x} cy={y} rx="8" ry="11" fill={c} stroke={INK} strokeWidth="2.5" opacity={0.55 + 0.45 * tw} />
          </g>
        );
      })}
      {DRIPS.map((d, i) => { const p = dripAt(d, t); return p.y < RAIL_Y ? <Drop key={i} x={p.x} y={p.y} r={8} opacity={p.alpha} /> : null; })}
    </g>
  );
}

const PUDDLE = { x: 830, y: 1650, rx: 140, ry: 30 };
function Balcony({ t }: { t: number }) {
  const bars = Array.from({ length: 19 }, (_, i) => 30 + i * 57);
  return (
    <g>
      {bars.map((x) => <path key={x} d={`M${x} ${RAIL_Y + RAIL_H} V${FLOOR_Y}`} stroke={K.bar} strokeWidth="9" />)}
      <path d={`M0 ${FLOOR_Y - 24} H${W}`} stroke={K.bar} strokeWidth="10" />
      <rect x="-10" y={RAIL_Y} width={W + 20} height={RAIL_H} fill={K.ledge} {...S} strokeWidth={5} />
      {Array.from({ length: 16 }, (_, i) => {                 // drops splashing up off the ledge
        const per = 0.7 + 0.5 * rnd(i, 11), u = (t / per + rnd(i, 12)) % 1, x = 30 + rnd(i, 13) * (W - 60);
        if (u > 0.3 || (x > 780 && x < 940)) return null;
        const k = u / 0.3;
        return (
          <g key={i} opacity={1 - k} fill={K.drop} stroke={INK} strokeWidth="1.5">
            {[-1, 0, 1].map((s) => <circle key={s} cx={x + s * 22 * k} cy={RAIL_Y - 4 - 26 * Math.sin(Math.PI * k) * (s === 0 ? 1.3 : 1)} r="4" />)}
          </g>
        );
      })}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
        <rect key={`${r}-${c}`} x={c * 120} y={FLOOR_Y + r * 120} width="120" height="120" fill={SCENE.floor[(r + c) % 2]} />
      )))}
      <path d={`M0 ${FLOOR_Y} H${W}`} stroke={INK} strokeWidth="5" />
      <ellipse cx={PUDDLE.x} cy={PUDDLE.y} rx={PUDDLE.rx} ry={PUDDLE.ry} fill={K.puddle} stroke={INK} strokeWidth="3" opacity="0.9" />
      {[0, 1, 2, 3].map((i) => {                              // rain blown in: rings spread on the puddle
        const u = (t / 1.1 + i * 0.27 + 0.13 * i * i) % 1, cx = PUDDLE.x + (rnd(i, 21) - 0.5) * 120, cy = PUDDLE.y + (rnd(i, 22) - 0.5) * 16;
        return <ellipse key={i} cx={cx} cy={cy} rx={6 + 60 * u} ry={2 + 12 * u} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity={0.9 * (1 - u)} />;
      })}
    </g>
  );
}

// ---- the tulsi on the ledge, with the drops that hit it -----------------------------------------------------------------
function Tulsi({ t }: { t: number }) {
  const { x, y } = TULSI, top = y - 86, sway = 1.5 * breezeAt(t, 0.8);
  return (
    <g>
      {LEAVES.map((l, i) => <path key={`s${i}`} d={`M${x} ${top + 4} Q${(x + l.x) / 2} ${l.y + 40} ${l.x} ${l.y}`} fill="none" stroke={K.stem} strokeWidth="5" strokeLinecap="round" />)}
      {[[-14, 812], [0, 798], [14, 812]].map(([dx, yy], i) => (
        <g key={`m${i}`} transform={`rotate(${sway} ${x} 830)`}>
          <path d={`M${x + dx * 0.4} ${830} L${x + dx} ${yy}`} stroke={K.stem} strokeWidth="4" />
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + dx} cy={yy - k * 9} r="4.5" fill={K.manjari} stroke={INK} strokeWidth="1.5" />)}
        </g>
      ))}
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.ang + leafBob(i, t) + sway})`}>
          <ellipse cx={22 * l.s} cy="0" rx={24 * l.s} ry={12 * l.s} fill={K.leaf[i % 2]} {...S} strokeWidth={3.5} />
          <path d={`M${2 * l.s} 0 H${40 * l.s}`} stroke={INK} strokeWidth="2" opacity="0.6" />
        </g>
      ))}
      <path d={`M${x - 62} ${top} H${x + 62} L${x + 46} ${y} H${x - 46} Z`} fill={K.pot} {...S} />
      <rect x={x - 68} y={top - 4} width="136" height="20" rx="6" fill={K.potRim} {...S} strokeWidth={4} />
      {[-24, 0, 24].map((dx) => <circle key={dx} cx={x + dx} cy={top + 46} r="5" fill="#FFFFFF" />)}
      {LEAF_HITS.map((h, i) => {
        const d = hitDropAt(h, t);
        return (
          <g key={`h${i}`}>
            {d.falling && <Drop x={d.x} y={d.y} r={7} />}
            {d.splash > 0 && [-60, -20, 20, 60].map((a) => {
              const rad = ((a - 90) * Math.PI) / 180, r = 8 + 26 * d.splash;
              return <circle key={a} cx={d.x + r * Math.cos(rad)} cy={d.y + r * Math.sin(rad)} r={4 * (1 - d.splash) + 1} fill={K.drop} stroke={INK} strokeWidth="1.5" opacity={1 - d.splash} />;
            })}
          </g>
        );
      })}
    </g>
  );
}

// ---- her: early 20s, on a floor cushion, knees up, the glass in both hands ---------------------------------------------
function Glass({ t }: { t: number }) {
  const c = cupAt(t), p = fromWorld(c);
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${c.tilt * 1.4}) scale(${1.3 / FIG.s})`}>
      <path d="M-25 -34 H25 L19 34 H-19 Z" fill={K.glass} {...S} strokeWidth={4} />
      <path d={`M-22 ${-14 + 8 * (c.tilt / 22)} H22 L19 32 H-19 Z`} fill={K.chai} />
      {[-12, 0, 12].map((x) => <path key={x} d={`M${x} -30 L${x * 0.8} 30`} stroke="#FFFFFF" strokeWidth="3" opacity="0.55" />)}
      <path d="M-25 -34 H25 L19 34 H-19 Z" fill="none" {...S} strokeWidth={4} />
    </g>
  );
}

function Steam({ t }: { t: number }) {
  const c = cupAt(t);
  return (
    <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
      {[0, 1, 2, 3].map((i) => {
        const s = steamAt(i, t), x = c.x - 18 + 12 * i + s.sway, y = c.y - 44 - s.rise, w = 4 + 6 * (s.rise / 170);
        return <path key={i} d={`M${x} ${y + 44} q-18 -11 0 -22 q18 -11 0 -22`} strokeWidth={w} opacity={0.8 * s.alpha} />;
      })}
    </g>
  );
}

/** A sweatshirt sleeve from the shoulder, bending at the elbow, to a hand at `to`. */
function Sleeve({ from, elbow, to }: { from: [number, number]; elbow: [number, number]; to: [number, number] }) {
  const d = `M${from[0]} ${from[1]} Q${elbow[0]} ${elbow[1]} ${to[0]} ${to[1]}`;
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth="40" strokeLinecap="round" />
      <path d={d} fill="none" stroke={K.top} strokeWidth="31" strokeLinecap="round" />
      <circle cx={to[0]} cy={to[1]} r="15" fill={K.skin} {...S} strokeWidth={4} />
    </g>
  );
}

/** Her head: a face from the scene stories, loose shoulder-length hair with a middle part, the ends moving in the breeze. */
function YoungHead({ x, y, r, t, closed }: { x: number; y: number; r: number; t: number; closed: boolean }) {
  const b = 5 * breezeAt(t, 1.3), b2 = 5 * breezeAt(t, 2.4);
  const cap = `M${x - r - 4} ${y + 10} Q${x - r - 2} ${y - r - 10} ${x} ${y - r - 6} Q${x + r + 2} ${y - r - 10} ${x + r + 4} ${y + 10} Q${x + r - 6} ${y - 34} ${x + 3} ${y - r + 12} L${x} ${y - r + 6} L${x - 3} ${y - r + 12} Q${x - r + 6} ${y - 34} ${x - r - 4} ${y + 10} Z`;
  const lock = (s: number, sw: number) =>
    `M${x + s * (r + 4)} ${y - 6} Q${x + s * (r + 14)} ${y + 60} ${x + s * (r + 6) + sw} ${y + r + 74} L${x + s * (r - 14) + sw} ${y + r + 66} Q${x + s * (r - 4)} ${y + 50} ${x + s * (r - 8)} ${y + 6} Z`;
  return (
    <g>
      <Face x={x} y={y} r={r} mood={closed ? 'content' : 'smile'} skin={K.skin} />
      <path d={cap} fill={K.hair} {...S} strokeWidth={4} />
      <path d={lock(-1, b)} fill={K.hair} {...S} strokeWidth={4} />
      <path d={lock(1, b2)} fill={K.hair} {...S} strokeWidth={4} />
      <circle cx={x - r + 4} cy={y + 22} r="4" fill="#FFFFFF" stroke={INK} strokeWidth="1.5" />
    </g>
  );
}

function Her({ t }: { t: number }) {
  const { x, headY, r } = HER, seat = SEAT_Y, foot = FIG.y - 8, lean = leanAt(t), breathe = 1 + 0.015 * Math.sin(t * 2.2);
  const c = fromWorld(cupAt(t)), tilt = headTiltAt(t) - 10 * lean, b = 6 * breezeAt(t, 0.5);
  const hand = (s: number): [number, number] => [c.x + s * 24, c.y + 10];
  const shoulder = (s: number): [number, number] => [x + s * 78, headY + 112];
  const elbow = (s: number): [number, number] => [x + s * 128, (headY + 112 + c.y) / 2 + 70];
  return (
    <g>
      {/* hair behind her shoulders */}
      <g transform={`rotate(${tilt} ${x} ${headY + 60})`}>
        <path d={`M${x - r - 8} ${headY} Q${x - r - 24} ${headY + 120} ${x - r + b} ${headY + 150} H${x + r + b} Q${x + r + 24} ${headY + 120} ${x + r + 8} ${headY} Z`} fill={K.hair} {...S} strokeWidth={4} />
      </g>
      {/* the floor cushion */}
      <rect x={x - 165} y={seat - 12} width="330" height={FIG.y + 8 - seat} rx="30" fill={K.cushion} {...S} />
      <path d={`M${x - 150} ${seat + 26} H${x + 150}`} stroke={K.trim} strokeWidth="8" strokeDasharray="22 14" />
      {[-1, 1].map((s) => <path key={s} d={`M${x + s * 160} ${FIG.y} l${s * 14} 16 M${x + s * 160} ${FIG.y} l${s * 4} 20`} stroke={K.trim} strokeWidth="5" strokeLinecap="round" />)}
      {/* body (leans back a little at the end, breathing) */}
      <g transform={`rotate(${-3 * lean} ${x} ${seat}) translate(${x} ${seat}) scale(1 ${breathe}) translate(${-x} ${-seat})`}>
        <path d={`M${x - 14} ${headY + 40} V${headY + 92} H${x + 14} V${headY + 40} Z`} fill={K.skin} {...S} />
        <path d={`M${x - 84} ${headY + 104} Q${x} ${headY + 80} ${x + 84} ${headY + 104} Q${x + 112} ${headY + 220} ${x + 104} ${seat} H${x - 104} Q${x - 112} ${headY + 220} ${x - 84} ${headY + 104} Z`} fill={K.top} {...S} />
        <path d={`M${x - 26} ${headY + 90} Q${x} ${headY + 110} ${x + 26} ${headY + 90}`} fill="none" stroke={K.topDark} strokeWidth="9" strokeLinecap="round" />
      </g>
      {/* knees drawn up in front of her: two pyjama legs, bare feet on the cushion */}
      {[-1, 1].map((s) => {
        const cx = x + s * 38;
        return (
          <g key={s}>
            <path d={`M${cx - 32} ${foot} L${cx - 33} ${KNEE_Y + 32} A33 32 0 0 1 ${cx + 33} ${KNEE_Y + 32} L${cx + 30} ${foot} Z`} fill={K.pants} {...S} />
            <path d={`M${cx - 16} ${KNEE_Y + 30} Q${cx} ${KNEE_Y + 42} ${cx + 16} ${KNEE_Y + 30}`} fill="none" stroke={K.pantsLine} strokeWidth="4" strokeLinecap="round" />
            <path d={`M${cx - 30} ${foot - 26} H${cx + 30}`} stroke={K.pantsLine} strokeWidth="5" />
            <ellipse cx={cx + s * 6} cy={foot + 6} rx="30" ry="12" fill={K.skin} {...S} strokeWidth={4} />
          </g>
        );
      })}
      {/* head, then the glass and her arms around her knees */}
      <g transform={`rotate(${-3 * lean} ${x} ${seat})`}>
        <g transform={`rotate(${tilt} ${x} ${headY + 60})`}>
          <YoungHead x={x} y={headY} r={r} t={t} closed={eyesClosed(t)} />
        </g>
        <Glass t={t} />
        <Sleeve from={shoulder(-1)} elbow={elbow(-1)} to={hand(-1)} />
        <Sleeve from={shoulder(1)} elbow={elbow(1)} to={hand(1)} />
      </g>
    </g>
  );
}

function Stool() {
  const { x, top } = STOOL;
  return (
    <g>
      {[-40, 40].map((dx) => <path key={dx} d={`M${x + dx} ${top + 10} L${x + dx * 1.15} ${FIG.y + 4}`} stroke={K.wood} strokeWidth="13" strokeLinecap="round" />)}
      <rect x={x - 62} y={top} width="124" height="18" rx="6" fill={K.wood} {...S} strokeWidth={4} />
      <rect x={x - 48} y={top - 12} width="60" height="13" rx="5" fill={K.phone} {...S} strokeWidth={3} />
      <rect x={x + 18} y={top - 9} width="32" height="10" rx="2" fill={K.biscuit} {...S} strokeWidth={2.5} />
      <rect x={x + 22} y={top - 18} width="32" height="10" rx="2" fill={K.biscuit} {...S} strokeWidth={2.5} />
    </g>
  );
}

/** The whole picture through one camera: each layer at its own depth; behind a close-up, the far layers soften. */
function Scene({ t, cam, blur }: { t: number; cam: Cam; blur: number }) {
  const far = blur > 0 ? 'url(#sm11blurFar)' : undefined, mid = blur > 0 ? 'url(#sm11blurMid)' : undefined;
  return (
    <g>
      <rect width={W} height={H} fill="url(#sm11sky)" />
      <g transform={layer(cam, LAYERS.hills)} filter={far}><Hills /></g>
      <g transform={layer(cam, LAYERS.town)} filter={far}><Town t={t} /></g>
      <g transform={layer(cam, LAYERS.rainFar)} filter={far}><Rain t={t} near={false} /></g>
      <g transform={layer(cam, LAYERS.trees)} filter={mid}>
        <Tree x={130} y={820} r={150} shade={0} t={t} />
        <Tree x={980} y={760} r={170} shade={1} t={t} />
        <Tree x={600} y={900} r={110} shade={2} t={t} />
      </g>
      <g transform={layer(cam, LAYERS.rainNear)} filter={mid}><Rain t={t} near /></g>
      <g transform={layer(cam, LAYERS.balcony)}>
        <Awning t={t} />
        <g filter="url(#rough)"><Balcony t={t} /></g>
        {(() => { const d = railDripAt(t); return <Drop x={d.x} y={d.y + d.r} r={d.r} />; })()}
        <g filter="url(#rough)"><Tulsi t={t} /></g>
        <g filter="url(#rough)" transform={`translate(${FIG.x} ${FIG.y}) scale(${FIG.s}) translate(${-FIG.x} ${-FIG.y})`}>
          <Stool />
          <Her t={t} />
        </g>
        <Steam t={t} />
      </g>
    </g>
  );
}

export function SoundMind011({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, d = dissolveAt(t), s = shotAt(t), prev = SHOTS[SHOTS.indexOf(s) - 1];
  return (
    <AbsoluteFill style={{ background: SCENE.skyTop }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <defs>
          <linearGradient id="sm11sky" x1="0" y1={AWNING_Y} x2="0" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={SCENE.skyTop} /><stop offset="1" stopColor={SCENE.skyLow} />
          </linearGradient>
          <filter id="sm11blurFar" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="sm11blurMid" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        {d && <Scene t={t} cam={d.prev} blur={focusBlur(prev)} />}
        <g opacity={d ? d.k : 1}><Scene t={t} cam={cameraAt(t)} blur={focusBlur(s)} /></g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} ink={INK} p={VIVID} />
      {!cover && <Html5Audio src={staticFile('sm-r011-chai-mix.wav')} />}
    </AbsoluteFill>
  );
}
