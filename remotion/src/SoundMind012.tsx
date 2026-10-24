// @soundmindwithshivani pause reel #2 (framework S20), "tapri at dusk": the richer 2D look. Timeline and rules:
// lib/sm012.ts. Painted, not outlined: every shape is a gradient from its light side to its shadow side, and its edge is
// a darker shade of its own colour (no black ink: that line is what reads as a child's drawing). Dusk light, a warm bulb,
// a wet street that mirrors the lights, rain at three depths, soft focus behind the close-ups, grain over all.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  W, H, DURATION, HOOK, LINE2, SCENE, PAINT, AWNING_EDGE, KETTLE, BULB, TAIL_LIGHT, PUDDLE, HER, HER_SCALE, FEET_Y, WATER_Y, LAYERS,
  shotAt, cameraAt, dissolveAt, focusBlur, cameraTransform, sipAt, leanAt, eyesClosed, breezeAt, steamAt, dripsAt, ripplesAt,
  bulbAt, rainStreak, reflect,
} from './lib/sm012.ts';
import { layerCam, type Cam } from './lib/sm011.ts';
import { VIVID } from './lib/smPalette.ts';
import { Filters, Grain, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 1.6;                                      // the kulhad at her lips, eyes closed, the message up
const P = PAINT;
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const layer = (cam: Cam, depth: number) => cameraTransform(layerCam(cam, depth));
const WARM = '#FFC56B', WARM_HOT = '#FFE7B0', RED_HOT = '#FF4B3E';

/** A painted fill: light side to shadow side along `angle` (degrees; 0 = light on the left). */
const Grad = ({ id, p, angle = 30 }: { id: string; p: { light: string; fill: string; shade: string }; angle?: number }) => {
  const a = (angle * Math.PI) / 180, x = Math.cos(a) / 2, y = Math.sin(a) / 2;
  return (
    <linearGradient id={id} x1={0.5 - x} y1={0.5 - y} x2={0.5 + x} y2={0.5 + y}>
      <stop offset="0" stopColor={p.light} /><stop offset="0.45" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} />
    </linearGradient>
  );
};
const fillOf = (id: string) => `url(#${id})`;
const edge = (name: keyof typeof PAINT, w = 3) => ({ stroke: P[name].edge, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

function Defs() {
  return (
    <defs>
      <linearGradient id="s12sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={SCENE.skyTop} /><stop offset="0.32" stopColor={SCENE.skyMid} />
        <stop offset="0.52" stopColor="#8A6A86" /><stop offset="0.6" stopColor={SCENE.skyLow} /><stop offset="1" stopColor="#E9A877" />
      </linearGradient>
      <linearGradient id="s12road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A3F55" /><stop offset="0.4" stopColor={SCENE.road} /><stop offset="1" stopColor="#1C2029" />
      </linearGradient>
      <linearGradient id="s12mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#B9A6C4" stopOpacity="0" /><stop offset="0.5" stopColor="#B9A6C4" stopOpacity="0.35" /><stop offset="1" stopColor="#B9A6C4" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="s12bulb"><stop offset="0" stopColor={WARM_HOT} stopOpacity="0.95" /><stop offset="0.25" stopColor={WARM} stopOpacity="0.45" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
      <radialGradient id="s12red"><stop offset="0" stopColor="#FFB3A8" stopOpacity="0.95" /><stop offset="0.3" stopColor={RED_HOT} stopOpacity="0.55" /><stop offset="1" stopColor={RED_HOT} stopOpacity="0" /></radialGradient>
      <radialGradient id="s12vignette" cx="0.5" cy="0.48" r="0.75"><stop offset="0.55" stopColor="#0B0F1E" stopOpacity="0" /><stop offset="1" stopColor="#0B0F1E" stopOpacity="0.55" /></radialGradient>
      <radialGradient id="s12puddle" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#5D6690" /><stop offset="0.7" stopColor="#3B4266" /><stop offset="1" stopColor="#2A2F45" /></radialGradient>
      {Object.entries(P).map(([k, p]) => <Grad key={k} id={`s12${k}`} p={p} />)}
      <Grad id="s12woodV" p={P.wood} angle={90} />
      <Grad id="s12tinV" p={P.tin} angle={100} />
      <filter id="s12bokeh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
      <filter id="s12glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
      <filter id="s12soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
      <filter id="s12far" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6" /></filter>
      <clipPath id="s12below"><rect x="-100" y={WATER_Y} width={W + 200} height={H} /></clipPath>
      <filter id="s12mid" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
      {/* a brushed, painterly wobble on the street layer's edges */}
      <filter id="s12paint"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
    </defs>
  );
}

// ---- far: the sky, a town at dusk, bokeh lights, mist ---------------------------------------------------------------------
const BUILDINGS = [
  { x: -40, w: 170, top: 760 }, { x: 120, w: 130, top: 840 }, { x: 240, w: 190, top: 700 }, { x: 420, w: 150, top: 800 },
  { x: 560, w: 200, top: 730 }, { x: 750, w: 140, top: 820 }, { x: 880, w: 240, top: 680 },
];
function Far({ t }: { t: number }) {
  return (
    <g>
      {[[180, 260, 210, 50], [760, 420, 260, 60], [420, 560, 300, 40]].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x + 6 * Math.sin(t * 0.3 + i)} cy={y} rx={rx} ry={ry} fill="#5A5E8A" opacity="0.35" filter="url(#s12bokeh)" />
      ))}
      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.top} width={b.w} height={1220 - b.top} fill={fillOf('s12building')} />
          <rect x={b.x + b.w - 26} y={b.top} width="26" height={1220 - b.top} fill={P.building.shade} opacity="0.6" />
          {Array.from({ length: Math.floor((1180 - b.top) / 62) }, (_, r) => Array.from({ length: Math.floor((b.w - 24) / 42) }, (_, c) => {
            const on = rnd(i * 41 + r * 9 + c, 2) < 0.42, warm = rnd(i * 13 + r + c * 5, 3) < 0.75;
            return <rect key={`${r}-${c}`} x={b.x + 16 + c * 42} y={b.top + 24 + r * 62} width="20" height="28" rx="3"
              fill={on ? (warm ? WARM : '#BFD7FF') : P.building.shade} opacity={on ? 0.85 : 0.7} />;
          }))}
        </g>
      ))}
      <rect x="-100" y="980" width={W + 200} height="260" fill="url(#s12mist)" />
      {/* street lights far down the road, out of focus */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 40 + i * 78 + 20 * rnd(i, 4), y = 1150 + 40 * rnd(i, 5), warm = rnd(i, 6) < 0.7;
        return <circle key={i} cx={x} cy={y} r={10 + 16 * rnd(i, 7)} fill={warm ? WARM : '#9EC8FF'} opacity={0.45 + 0.25 * Math.sin(t * 1.5 + i)} filter="url(#s12bokeh)" />;
      })}
    </g>
  );
}

/** The gulmohar over the street: a dark canopy, lit from the left, with red-orange blossoms; it sways in the breeze. */
function Tree({ t }: { t: number }) {
  const sway = 1.2 * breezeAt(t, 0.7);
  return (
    <g>
      <path d="M965 1240 C 958 1100 975 1000 940 900 L 975 895 C 1000 1000 990 1110 1000 1240 Z" fill={fillOf('s12wood')} opacity="0.85" />
      <g transform={`rotate(${sway} 960 980)`}>
        {[[860, 820, 150], [990, 760, 170], [1080, 880, 130], [930, 930, 120], [780, 900, 100]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={fillOf('s12tree')} />
        ))}
        {Array.from({ length: 60 }, (_, i) => {
          const a = rnd(i, 1) * Math.PI * 2, d = 40 + 170 * rnd(i, 2);
          return <circle key={`f${i}`} cx={930 + d * Math.cos(a)} cy={830 + 0.7 * d * Math.sin(a)} r={5 + 6 * rnd(i, 3)} fill={rnd(i, 4) < 0.5 ? '#E8553A' : '#F2884B'} opacity="0.9" />;
        })}
      </g>
    </g>
  );
}

function Rain({ t, near }: { t: number; near: number }) {
  const n = near > 0.6 ? 70 : 150;
  return (
    <g stroke="#DCE6FF" strokeWidth={1.5 + 3 * near} strokeLinecap="round" opacity={0.28 + 0.35 * near}>
      {Array.from({ length: n }, (_, i) => {
        const r = rainStreak(i + (near > 0.6 ? 500 : 0), t, near);
        return <path key={i} d={`M${r.x} ${r.y} l${-0.18 * r.len} ${-r.len}`} />;
      })}
    </g>
  );
}

// ---- the street: road and reflections, the tapri, the bench, the scooter, the puddle -------------------------------------
function Road({ t }: { t: number }) {
  const b = bulbAt(t), tail = reflect(TAIL_LIGHT), bulbR = reflect({ x: BULB.x, y: BULB.y + 330 });
  return (
    <g>
      <rect x="-50" y="1200" width={W + 100} height={H - 1150} fill="url(#s12road)" />
      {/* the far lights smeared down the wet road */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={50 + i * 85 + 15 * rnd(i, 4)} y={1250} width={10 + 8 * rnd(i, 7)} height={180 + 120 * rnd(i, 8)} rx="6"
          fill={rnd(i, 6) < 0.7 ? WARM : '#9EC8FF'} opacity={0.18 + 0.1 * Math.sin(t * 1.5 + i)} filter="url(#s12bokeh)" />
      ))}
      <ellipse cx={bulbR.x} cy={bulbR.y - 40} rx="60" ry="190" fill={WARM} opacity={0.22 * b} filter="url(#s12glow)" />
      <ellipse cx={PUDDLE.x} cy={PUDDLE.y} rx={PUDDLE.rx} ry={PUDDLE.ry} fill="url(#s12puddle)" />
      <ellipse cx={tail.x} cy={tail.y} rx="26" ry="70" fill="url(#s12red)" />
      {ripplesAt(t).map((r, i) => <ellipse key={i} cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill="none" stroke="#C9D6FF" strokeWidth="2.5" opacity={0.6 * r.alpha} />)}
      <path d={`M${PUDDLE.x - PUDDLE.rx} ${PUDDLE.y} A${PUDDLE.rx} ${PUDDLE.ry} 0 0 0 ${PUDDLE.x + PUDDLE.rx} ${PUDDLE.y}`} fill="none" stroke="#596288" strokeWidth="3" opacity="0.6" />
    </g>
  );
}

function Tapri({ t }: { t: number }) {
  const b = bulbAt(t);
  const planks = Array.from({ length: 9 }, (_, i) => 40 + i * 62);
  return (
    <g>
      {/* the stall's painted boards and the shelf behind the counter */}
      <rect x="30" y="880" width="580" height="580" fill={fillOf('s12stallBlue')} {...edge('stallBlue')} />
      {planks.map((x) => <path key={x} d={`M${x} 890 V1450`} stroke={P.stallBlue.shade} strokeWidth="3" opacity="0.7" />)}
      <rect x="60" y="960" width="500" height="16" rx="4" fill={fillOf('s12wood')} {...edge('wood', 2)} />
      {[[90, 'jar'], [150, 'jar'], [210, 'jar'], [440, 'cups'], [500, 'cups']].map(([x, kind], i) => kind === 'jar' ? (
        <g key={i}>
          <rect x={Number(x)} y="910" width="44" height="50" rx="8" fill="#CFE3EA" opacity="0.55" stroke="#9FB8C2" strokeWidth="2" />
          <rect x={Number(x) + 6} y="930" width="32" height="26" rx="4" fill={i % 2 ? '#E8B04A' : '#D98B3A'} opacity="0.9" />
        </g>
      ) : (
        <g key={i}>{[0, 1, 2].map((k) => <path key={k} d={`M${Number(x) + k * 8} ${952 - k * 14} h34 l-5 14 h-24 Z`} fill={fillOf('s12kulhad')} {...edge('kulhad', 2)} />)}</g>
      ))}
      {/* the counter */}
      <rect x="40" y="1120" width="440" height="330" fill={fillOf('s12woodV')} {...edge('wood')} />
      {[90, 160, 230, 300, 370, 440].map((x) => <path key={x} d={`M${x} 1130 V1440`} stroke={P.wood.shade} strokeWidth="3" opacity="0.6" />)}
      <rect x="28" y="1108" width="470" height="22" rx="5" fill={fillOf('s12wood')} {...edge('wood', 2)} />
      {/* the stove and the kettle */}
      <rect x={KETTLE.x - 52} y="1088" width="104" height="22" rx="6" fill={fillOf('s12steel')} {...edge('steel', 2)} />
      {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${KETTLE.x - 36 + k * 17} 1090 q4 -${10 + 4 * Math.sin(t * 9 + k)} 8 0`} fill="#7FB2FF" opacity="0.8" />)}
      <path d={`M${KETTLE.x - 46} ${KETTLE.y} Q${KETTLE.x - 50} ${KETTLE.y - 64} ${KETTLE.x} ${KETTLE.y - 70} Q${KETTLE.x + 50} ${KETTLE.y - 64} ${KETTLE.x + 46} ${KETTLE.y} Z`} fill={fillOf('s12steel')} {...edge('steel')} />
      <path d={`M${KETTLE.x + 40} ${KETTLE.y - 34} q34 -6 44 -40`} fill="none" stroke={P.steel.edge} strokeWidth="9" strokeLinecap="round" />
      <path d={`M${KETTLE.x + 40} ${KETTLE.y - 34} q34 -6 44 -40`} fill="none" stroke={P.steel.fill} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${KETTLE.x - 30} ${KETTLE.y - 66} Q${KETTLE.x} ${KETTLE.y - 110} ${KETTLE.x + 30} ${KETTLE.y - 66}`} fill="none" stroke={P.steel.shade} strokeWidth="6" />
      <rect x={KETTLE.x - 47} y={KETTLE.y - 12} width="94" height="12" rx="4" fill={P.steel.shade} />
      <circle cx={KETTLE.x} cy={KETTLE.y - 74} r="7" fill={P.steel.shade} />
      <ellipse cx={KETTLE.x - 18} cy={KETTLE.y - 40} rx="9" ry="18" fill="#FFFFFF" opacity="0.6" />
      {/* the bulb's warm light on the stall (it lifts everything near it) */}
      <circle cx={BULB.x} cy={BULB.y + 40} r="330" fill="url(#s12bulb)" opacity={0.55 * b} style={{ mixBlendMode: 'screen' }} />
    </g>
  );
}

function Awning({ t }: { t: number }) {
  const ribs = Array.from({ length: 16 }, (_, i) => -20 + i * 46);
  const b = bulbAt(t);
  return (
    <g>
      <path d={`M-30 760 L690 815 L${AWNING_EDGE.x1} ${AWNING_EDGE.y} L-30 880 Z`} fill={fillOf('s12tinV')} {...edge('tin')} />
      {ribs.map((x) => <path key={x} d={`M${x} ${762 + x * 0.075} L${x - 6} ${880 + (x + 30) * 0.035}`} stroke={P.tin.light} strokeWidth="6" opacity="0.55" />)}
      {ribs.map((x) => <path key={`s${x}`} d={`M${x + 18} ${764 + x * 0.075} L${x + 12} ${882 + (x + 30) * 0.035}`} stroke={P.tin.shade} strokeWidth="5" opacity="0.6" />)}
      <path d={`M-30 880 L${AWNING_EDGE.x1} ${AWNING_EDGE.y}`} stroke={P.tin.edge} strokeWidth="8" />
      {/* the post at the front corner and the bulb on its wire */}
      <rect x="628" y="880" width="24" height="590" rx="4" fill={fillOf('s12woodV')} {...edge('wood', 2)} />
      <path d={`M${BULB.x} 892 V${BULB.y - 22}`} stroke="#2A2A2A" strokeWidth="3" />
      <rect x={BULB.x - 9} y={BULB.y - 26} width="18" height="12" rx="3" fill={fillOf('s12steel')} />
      <circle cx={BULB.x} cy={BULB.y} r="17" fill={WARM_HOT} />
      <circle cx={BULB.x} cy={BULB.y} r="60" fill={WARM} opacity={0.7 * b} filter="url(#s12glow)" />
      {/* the curtain of drips off the tin edge, catching the light */}
      {dripsAt(t).map((d, i) => {
        const lit = Math.max(0, 1 - Math.abs(d.x - BULB.x) / 380);
        return <path key={i} d={`M${d.x} ${d.y} l-2 ${-d.len}`} stroke={lit > 0.2 ? WARM_HOT : '#E3ECFF'} strokeWidth="4" strokeLinecap="round" opacity={0.45 + 0.45 * lit} />;
      })}
      {dripsAt(t).filter(d => d.y > AWNING_EDGE.y + 520).map((d, i) => (
        <g key={`sp${i}`} opacity="0.7">{[-1, 1].map((s) => <circle key={s} cx={d.x + s * 9} cy={1462 - 6} r="3" fill="#E3ECFF" />)}</g>
      ))}
    </g>
  );
}

function Footpath() {
  return (
    <g>
      <rect x="-20" y="1440" width="740" height="70" fill={fillOf('s12steel')} opacity="0.55" />
      <path d="M-20 1440 H720" stroke={P.steel.light} strokeWidth="4" opacity="0.6" />
      <path d="M-20 1510 H720" stroke={P.steel.edge} strokeWidth="4" opacity="0.7" />
    </g>
  );
}

function Bench() {
  return (
    <g>
      {[430, 610].map((x) => <rect key={x} x={x} y="1350" width="16" height="100" rx="3" fill={fillOf('s12woodV')} {...edge('wood', 2)} />)}
      <rect x="405" y="1332" width="230" height="24" rx="6" fill={fillOf('s12wood')} {...edge('wood', 2)} />
    </g>
  );
}

/** The scooter, side on, facing left: a generic step-through of our own (no make, no badge). */
function Scooter({ t }: { t: number }) {
  const wheel = (x: number) => (
    <g>
      <circle cx={x} cy="1440" r="38" fill="#1E2128" />
      <circle cx={x} cy="1440" r="24" fill="#2B2F38" />
      <circle cx={x} cy="1440" r="15" fill={fillOf('s12steel')} />
      <circle cx={x} cy="1440" r="5" fill={P.steel.shade} />
    </g>
  );
  return (
    <g>
      {wheel(772)}{wheel(968)}
      {/* front mudguard over the front wheel */}
      <path d="M730 1438 Q734 1384 772 1380 Q810 1384 814 1430 L800 1430 Q796 1398 772 1396 Q748 1398 744 1438 Z" fill={fillOf('s12scooter')} {...edge('scooter', 2.5)} />
      {/* front shield: a tall curved panel from the floorboard up to the steering column */}
      <path d="M790 1408 Q770 1320 782 1236 L808 1232 Q806 1320 830 1400 Z" fill={fillOf('s12scooter')} {...edge('scooter', 2.5)} />
      {/* floorboard */}
      <path d="M800 1400 H890 Q896 1400 896 1408 V1414 H802 Z" fill={P.scooter.shade} stroke={P.scooter.edge} strokeWidth="2.5" />
      {/* the rounded rear body over the back wheel, with the seat on top */}
      <path d="M884 1414 C 880 1340 905 1306 958 1302 C 1010 1298 1030 1336 1024 1384 Q1018 1414 986 1414 Q968 1388 950 1390 Q930 1394 926 1414 Z" fill={fillOf('s12scooter')} {...edge('scooter', 2.5)} />
      <path d="M890 1306 Q950 1282 1012 1296 Q1018 1308 1006 1314 Q950 1302 898 1322 Z" fill="#4A3426" stroke="#33231A" strokeWidth="2.5" />
      {[[930, 1298], [962, 1294], [990, 1299], [948, 1304]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="3" fill="#DDE8FF" opacity={0.7 + 0.3 * Math.sin(t * 2 + i)} />)}
      {/* steering column, handlebar with grips and a mirror, round headlight */}
      <path d="M795 1236 L790 1166" stroke={P.scooter.edge} strokeWidth="14" strokeLinecap="round" />
      <path d="M795 1236 L790 1166" stroke={P.scooter.fill} strokeWidth="9" strokeLinecap="round" />
      <path d="M752 1162 H832" stroke={P.steel.edge} strokeWidth="8" strokeLinecap="round" />
      {[752, 832].map((x) => <path key={x} d={`M${x - 8} 1162 H${x + 8}`} stroke="#1E2128" strokeWidth="11" strokeLinecap="round" />)}
      <path d="M824 1160 L838 1118" stroke={P.steel.edge} strokeWidth="4" />
      <ellipse cx="840" cy="1112" rx="11" ry="8" fill={fillOf('s12steel')} {...edge('steel', 2)} />
      <circle cx="780" cy="1186" r="16" fill={fillOf('s12steel')} {...edge('steel', 2)} />
      <circle cx="776" cy="1186" r="10" fill={WARM_HOT} />
      <circle cx="770" cy="1186" r="36" fill={WARM} opacity="0.35" filter="url(#s12glow)" />
      {/* tail light at the back of the body */}
      <path d={`M${TAIL_LIGHT.x - 6} ${TAIL_LIGHT.y - 10} h14 v20 h-14 Z`} fill={RED_HOT} />
      <circle cx={TAIL_LIGHT.x} cy={TAIL_LIGHT.y} r="44" fill="url(#s12red)" />
    </g>
  );
}

// ---- her: early 20s, mustard rain jacket, jeans, a low ponytail, a kulhad of chai -------------------------------------------
function Face({ x, y, r, closed }: { x: number; y: number; r: number; closed: boolean }) {
  const ey = y - 2, k = r / 50;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 0.92} ry={r} fill={fillOf('s12skin')} stroke={P.skin.edge} strokeWidth="2.5" />
      <ellipse cx={x + 10 * k} cy={y + 34 * k} rx={22 * k} ry={9 * k} fill={P.skin.shade} opacity="0.35" />
      {closed ? (
        <g fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round">
          <path d={`M${x - 26 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} /><path d={`M${x + 8 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} />
        </g>
      ) : (
        <g>
          {[-17, 17].map((dx) => <g key={dx}>
            <ellipse cx={x + dx * k} cy={ey} rx={6.5 * k} ry={8 * k} fill="#2A1A12" />
            <circle cx={x + dx * k + 2 * k} cy={ey - 3 * k} r={2 * k} fill="#FFFFFF" />
          </g>)}
        </g>
      )}
      <path d={`M${x - 28 * k} ${ey - 15 * k} q10 ${-6 * k} ${20 * k} -1 M${x + 8 * k} ${ey - 16 * k} q10 ${-5 * k} ${20 * k} 1`} fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round" />
      <path d={`M${x + 2 * k} ${ey + 4 * k} q4 ${10 * k} -3 ${13 * k}`} fill="none" stroke={P.skin.edge} strokeWidth={2.5 * k} strokeLinecap="round" opacity="0.7" />
      <path d={`M${x - 11 * k} ${y + 25 * k} Q${x} ${y + 33 * k} ${x + 11 * k} ${y + 25 * k}`} fill="#C9665E" stroke="#A8514A" strokeWidth={1.5 * k} />
      {[-30, 30].map((dx) => <ellipse key={dx} cx={x + dx * k} cy={y + 14 * k} rx={9 * k} ry={6 * k} fill="#F08A8A" opacity="0.35" />)}
    </g>
  );
}

function Her({ t }: { t: number }) {
  const { x, headY, r } = HER, sip = sipAt(t), lean = leanAt(t), breath = Math.sin(t * 2.1);
  const cup = { x: x + 2, y: 1268 - 88 * sip }, tilt = -6 * sip + 9 * lean, sway = 4 * breezeAt(t, 0.4);
  const shoulderY = headY + 70;
  const arm = (s: number) => {
    const sx = x + s * 62, sy = shoulderY + 18, hx = cup.x + s * 20, hy = cup.y + 10, ex = x + s * 74, ey = (sy + hy) / 2 + 40;
    const d = `M${sx} ${sy} Q${ex} ${ey} ${hx} ${hy}`;
    return (
      <g key={s}>
        <path d={d} fill="none" stroke={P.jacket.edge} strokeWidth="34" strokeLinecap="round" />
        <path d={d} fill="none" stroke={s < 0 ? P.jacket.light : P.jacket.fill} strokeWidth="27" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r="12" fill={fillOf('s12skin')} stroke={P.skin.edge} strokeWidth="2" />
      </g>
    );
  };
  return (
    <g transform={`rotate(${4 * lean} ${x} 1330)`}>
      {/* legs: jeans down from the bench, white sneakers */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${x + s * 30 - 26} 1330 L${x + s * 34 - 22} 1440 H${x + s * 34 + 18} L${x + s * 30 + 22} 1330 Z`} fill={fillOf('s12jeans')} {...edge('jeans', 2.5)} />
          <path d={`M${x + s * 34 - 26} 1440 h44 q10 0 10 10 v6 h-58 v-6 q0 -10 4 -10 Z`} fill="#F4F2EE" stroke="#C9C4BB" strokeWidth="2.5" />
        </g>
      ))}
      <path d={`M${x - 64} 1300 Q${x} 1286 ${x + 64} 1300 L${x + 66} 1338 H${x - 66} Z`} fill={fillOf('s12jeans')} {...edge('jeans', 2.5)} />
      {/* ponytail behind, then the jacket */}
      <path d={`M${x + r * 0.5} ${headY - 10} Q${x + r + 30 + sway} ${headY + 60} ${x + r + 6 + sway} ${headY + 150} Q${x + r - 12} ${headY + 80} ${x + r * 0.3} ${headY + 20} Z`} fill={fillOf('s12hair')} {...edge('hair', 2)} />
      <g transform={`translate(0 ${-1.5 * breath})`}>
        <path d={`M${x - 70} ${shoulderY + 10} Q${x} ${shoulderY - 14} ${x + 70} ${shoulderY + 10} L${x + 76} 1312 Q${x} 1322 ${x - 76} 1312 Z`} fill={fillOf('s12jacket')} {...edge('jacket')} />
        <path d={`M${x - 40} ${shoulderY} Q${x} ${shoulderY + 34} ${x + 40} ${shoulderY}`} fill={P.jacket.shade} opacity="0.8" />
        <path d={`M${x} ${shoulderY + 20} V1312`} stroke={P.jacket.edge} strokeWidth="3" opacity="0.7" />
        {/* the kulhad in both hands, with a thread of steam */}
        <path d={`M${cup.x - 20} ${cup.y - 22} h40 l-6 40 h-28 Z`} fill={fillOf('s12kulhad')} {...edge('kulhad', 2.5)} transform={`rotate(${-14 * sip} ${cup.x} ${cup.y})`} />
        {[0, 1].map((i) => { const s = steamAt(i + 2, t); return <path key={i} d={`M${cup.x - 6 + 12 * i + 0.5 * s.sway} ${cup.y - 26 - 0.4 * s.rise} q-8 -8 0 -16 q8 -8 0 -16`} fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={0.55 * s.alpha * (1 - sip)} />; })}
        {arm(-1)}{arm(1)}
        <g transform={`rotate(${tilt} ${x} ${headY + 46})`}>
          <rect x={x - 12} y={headY + 34} width="24" height="30" fill={fillOf('s12skin')} />
          <Face x={x} y={headY} r={r} closed={eyesClosed(t)} />
          <path d={`M${x - r - 4} ${headY + 12} Q${x - r - 8} ${headY - r - 12} ${x} ${headY - r - 6} Q${x + r + 8} ${headY - r - 12} ${x + r + 4} ${headY + 12} Q${x + r - 8} ${headY - 30} ${x + 4} ${headY - r + 14} L${x} ${headY - r + 8} L${x - 4} ${headY - r + 14} Q${x - r + 8} ${headY - 30} ${x - r - 4} ${headY + 12} Z`}
            fill={fillOf('s12hair')} {...edge('hair', 2)} />
          <path d={`M${x - 20} ${headY - r + 2} Q${x - 6} ${headY - r - 4} ${x + 8} ${headY - r + 4}`} fill="none" stroke={P.hair.light} strokeWidth="4" opacity="0.8" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Steam({ t }: { t: number }) {
  return (
    <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
      {[0, 1, 2, 3].map((i) => {
        const s = steamAt(i, t), x = KETTLE.x + 80 - 10 + 8 * i + s.sway, y = KETTLE.y - 80 - s.rise;
        return <path key={i} d={`M${x} ${y + 40} q-14 -10 0 -20 q14 -10 0 -20`} strokeWidth={4 + 5 * (s.rise / 150)} opacity={0.7 * s.alpha} />;
      })}
    </g>
  );
}

/** Everything at street level: the stall, the footpath, the scooter, her on the bench, the tin roof. */
function Street({ t }: { t: number }) {
  return (
    <g>
      <Tapri t={t} />
      <Footpath />
      <Scooter t={t} />
      <g transform={`translate(${HER.x} ${FEET_Y}) scale(${HER_SCALE}) translate(${-HER.x} ${-FEET_Y})`}>
        <g transform={`translate(${HER.x - 520} 0)`}><Bench /></g>
        <Her t={t} />
      </g>
      <Awning t={t} />
    </g>
  );
}

/** The whole picture through one camera; behind a close-up the far layers soften. */
function Scene({ t, cam, blur }: { t: number; cam: Cam; blur: number }) {
  const far = blur > 0 ? 'url(#s12far)' : undefined, mid = blur > 0 ? 'url(#s12mid)' : undefined;
  return (
    <g>
      <rect width={W} height={H} fill="url(#s12sky)" />
      <g transform={layer(cam, LAYERS.far)} filter={far}><Far t={t} /></g>
      <g transform={layer(cam, LAYERS.rainFar)} filter={far}><Rain t={t} near={0.2} /></g>
      <g transform={layer(cam, LAYERS.tree)} filter={mid}><Tree t={t} /></g>
      <g transform={layer(cam, LAYERS.rainNear)} filter={mid}><Rain t={t} near={0.7} /></g>
      <g transform={layer(cam, LAYERS.street)}>
        <Road t={t} />
        {/* the wet road mirrors the whole street (flipped about the road surface, dimmed and softened) */}
        <g clipPath="url(#s12below)">
          <g transform={`translate(0 ${2 * WATER_Y}) scale(1 -1)`} opacity="0.32" filter="url(#s12mid)">
            <Street t={t} />
          </g>
        </g>
        <g filter="url(#s12paint)"><Street t={t} /></g>
        <Steam t={t} />
      </g>
    </g>
  );
}

export function SoundMind012({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, d = dissolveAt(t), s = shotAt(t);
  return (
    <AbsoluteFill style={{ background: SCENE.skyTop }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <Defs />
        {d && <Scene t={t} cam={d.prev} blur={focusBlur(d.prevId)} />}
        <g opacity={d ? d.k : 1}><Scene t={t} cam={cameraAt(t)} blur={focusBlur(s.id)} /></g>
        <rect width={W} height={H} fill="url(#s12vignette)" />
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} ink={SCENE.text} p={VIVID} />
      {!cover && <Html5Audio src={staticFile('sm-r012-tapri-mix.wav')} />}
    </AbsoluteFill>
  );
}

