// @soundmindwithshivani reminder reel #1 (framework S22, Painted 2D S21), "a reminder under the stars". Timeline and
// palette: lib/sm014.ts. One short line at a time over five painted night scenes that dissolve into each other: a dark
// room with a round window (we fly through it), Pune rooftops at Diwali, her on the terrace looking up, the Milky Way
// with a shooting star, moonlit clouds that sink into the dark of the first frame.
// Painted, not outlined: gradients from each shape's light side to its shadow side, edges a darker shade of the colour.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  W, H, LINES, TEXT_BOX, SCENE, PAINT, WINDOW, HER, MOON, LAYERS, shotAt, cameraAt, dissolveAt, dimAt,
  cameraTransform, textAlpha, tiltAt, breathAt, breezeAt, starsAbove, twinkleAt, flickerAt, swayAt, cloudsAt,
  shootingStarAt, type ShotId,
} from './lib/sm014.ts';
import { layerCam, type Cam } from './lib/sm011.ts';
import { TEXT_BOXES } from './lib/meStory.ts';
import { Filters, Grain, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 0.9;                                       // the hook inside the round window
const P = PAINT;
const layer = (cam: Cam, depth: number) => cameraTransform(layerCam(cam, depth));
const fillOf = (k: keyof typeof PAINT) => `url(#s14${k})`;
const edge = (k: keyof typeof PAINT, w = 3) => ({ stroke: P[k].edge, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const WARM = '#FFC872', WARM_HOT = '#FFF0C8';

const STARS_WINDOW = starsAbove(1150, 70, 1);
const STARS_ROOF = starsAbove(1150, 110, 2);
const STARS_TERRACE = starsAbove(1250, 120, 3);
const STARS_SKY = starsAbove(1920, 190, 4);
const STARS_CLOUDS = starsAbove(900, 60, 5);
const rnd = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
// the Milky Way's dust: many faint points along a band from bottom left to top right
const BAND = { x0: -100, y0: 1750, x1: 1180, y1: 150, width: 260 };
const DUST = Array.from({ length: 640 }, (_, i) => {
  const u = rnd(i, 21), off = (rnd(i, 22) + rnd(i, 23) + rnd(i, 24) - 1.5) * BAND.width;
  const nx = -(BAND.y1 - BAND.y0), ny = BAND.x1 - BAND.x0, n = Math.hypot(nx, ny);
  return { x: BAND.x0 + (BAND.x1 - BAND.x0) * u + (off * nx) / n, y: BAND.y0 + (BAND.y1 - BAND.y0) * u + (off * ny) / n, r: 0.8 + 1.4 * rnd(i, 25), a: 0.25 + 0.5 * rnd(i, 26) };
});

function Defs() {
  return (
    <defs>
      {Object.entries(P).map(([k, p]) => (
        <linearGradient key={k} id={`s14${k}`} x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0" stopColor={p.light} /><stop offset="0.45" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} />
        </linearGradient>
      ))}
      <linearGradient id="s14night" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0E1233" /><stop offset="0.45" stopColor="#1E2350" /><stop offset="0.8" stopColor="#2B2A62" /><stop offset="1" stopColor="#4A3466" />
      </linearGradient>
      <linearGradient id="s14city" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0F1236" /><stop offset="0.4" stopColor="#1F2154" /><stop offset="0.62" stopColor="#2B2A62" /><stop offset="0.78" stopColor="#5A3A6E" /><stop offset="1" stopColor="#8A4E62" />
      </linearGradient>
      <linearGradient id="s14deep" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor="#0A0C26" /><stop offset="0.5" stopColor="#1A1C48" /><stop offset="1" stopColor="#262A5C" />
      </linearGradient>
      <linearGradient id="s14moonlit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1C2350" /><stop offset="0.5" stopColor="#2A3368" /><stop offset="1" stopColor="#1A1E44" />
      </linearGradient>
      <radialGradient id="s14halo"><stop offset="0" stopColor="#FFF4D6" stopOpacity="0.55" /><stop offset="0.35" stopColor="#C9C8F0" stopOpacity="0.18" /><stop offset="1" stopColor="#C9C8F0" stopOpacity="0" /></radialGradient>
      <radialGradient id="s14glow"><stop offset="0" stopColor={WARM_HOT} stopOpacity="0.9" /><stop offset="0.3" stopColor={WARM} stopOpacity="0.45" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
      <radialGradient id="s14flame" cx="0.5" cy="0.7" r="0.6"><stop offset="0" stopColor="#FFFBE8" /><stop offset="0.45" stopColor="#FFD35C" /><stop offset="1" stopColor="#F07A28" /></radialGradient>
      <radialGradient id="s14spill" cx="0.5" cy="0.45" r="0.5"><stop offset="0.55" stopColor="#8E9BE0" stopOpacity="0.22" /><stop offset="1" stopColor="#8E9BE0" stopOpacity="0" /></radialGradient>
      <radialGradient id="s14vignette" cx="0.5" cy="0.5" r="0.78"><stop offset="0.55" stopColor="#07081A" stopOpacity="0" /><stop offset="1" stopColor="#07081A" stopOpacity="0.6" /></radialGradient>
      <linearGradient id="s14tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.95" /></linearGradient>
      <filter id="s14blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
      <filter id="s14haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      <filter id="s14soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="s14paint"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
    </defs>
  );
}

// ---- shared pieces --------------------------------------------------------------------------------------------------------
function Stars({ stars, t }: { stars: { i: number; x: number; y: number; r: number }[]; t: number }) {
  return (
    <g>
      {stars.map(s => {
        const k = twinkleAt(s.i, t);
        return (
          <g key={s.i}>
            {s.r > 3 && <circle cx={s.x} cy={s.y} r={s.r * 4} fill="#DCE2FF" opacity={0.18 * k} />}
            <circle cx={s.x} cy={s.y} r={s.r} fill="#F4F2FF" opacity={0.35 + 0.65 * k} />
          </g>
        );
      })}
    </g>
  );
}

function Moon({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 5} fill="url(#s14halo)" />
      <circle cx={x} cy={y} r={r} fill={fillOf('moon')} />
      {[[-0.3, -0.2, 0.22], [0.25, 0.15, 0.15], [-0.05, 0.4, 0.12]].map(([dx, dy, rr], i) => (
        <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill={P.moon.shade} opacity="0.35" />
      ))}
    </g>
  );
}

/** A clay diya with its flame and glow. */
function Diya({ x, y, s = 1, t, i }: { x: number; y: number; s?: number; t: number; i: number }) {
  const k = flickerAt(i, t), lean = 3 * Math.sin(t * 5.3 + i);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="-30" r={70 * k} fill="url(#s14glow)" style={{ mixBlendMode: 'screen' }} />
      <path d="M-30 -8 Q0 22 30 -8 Q34 -16 22 -14 L-22 -14 Q-34 -16 -30 -8 Z" fill={fillOf('diya')} {...edge('diya', 2)} />
      <path d="M-22 -14 Q0 -8 22 -14" fill="none" stroke={P.diya.light} strokeWidth="2.5" />
      <path d={`M0 -14 Q${-9 + lean / 3} -26 ${lean} ${-14 - 30 * k} Q${9 + lean / 3} -26 0 -14 Z`} fill="url(#s14flame)" />
    </g>
  );
}

/** A hanging star lantern (akash kandil), glowing, swaying on its string. */
function Lantern({ x, y, t }: { x: number; y: number; t: number }) {
  const k = flickerAt(9, t), star = Array.from({ length: 10 }, (_, j) => {
    const a = (Math.PI * j) / 5 - Math.PI / 2, rr = j % 2 ? 34 : 78;
    return `${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return (
    <g transform={`rotate(${swayAt(t)} ${x} ${y - 140})`}>
      <path d={`M${x} ${y - 300} V${y - 78}`} stroke="#6E5A7E" strokeWidth="3" />
      <circle cx={x} cy={y} r={190 * k} fill="url(#s14glow)" style={{ mixBlendMode: 'screen' }} />
      <polygon transform={`translate(${x} ${y})`} points={star} fill={fillOf('lantern')} {...edge('lantern', 3)} />
      <polygon transform={`translate(${x} ${y}) scale(0.45)`} points={star} fill={WARM_HOT} opacity={0.55 * k} />
      {[-24, -8, 8, 24].map((dx, j) => (
        <path key={dx} d={`M${x + dx} ${y + 40} q${2 * Math.sin(t * 2 + j)} 40 ${dx * 0.3} ${80 + 8 * (j % 2)}`} fill="none" stroke={j % 2 ? '#E8C34A' : '#D9542E'} strokeWidth="4" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** A string of fairy lights along a curve, twinkling. */
function FairyLights({ pts, t, seed = 0 }: { pts: { x: number; y: number }[]; t: number; seed?: number }) {
  return (
    <g>
      <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#3A2F4A" strokeWidth="2.5" />
      {pts.map((p, i) => {
        const k = twinkleAt(i + seed, t), c = (i + seed) % 3 === 0 ? '#FFB3C7' : WARM;
        return <g key={i}><circle cx={p.x} cy={p.y + 6} r="16" fill={c} opacity={0.28 * k} /><circle cx={p.x} cy={p.y + 6} r="5" fill={WARM_HOT} opacity={0.6 + 0.4 * k} /></g>;
      })}
    </g>
  );
}
const sag = (x0: number, y0: number, x1: number, y1: number, depth: number, n: number) =>
  Array.from({ length: n }, (_, i) => { const u = i / (n - 1); return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + 4 * depth * u * (1 - u) }; });

/** A skyline of flat-roofed buildings with lit windows (some warm, some cool), from x = 0 to W. */
function Skyline({ base, tops, k, lit = 0.35, seed = 0 }: { base: number; tops: [number, number][]; k: keyof typeof PAINT; lit?: number; seed?: number }) {
  let x = -20;
  return (
    <g>
      {tops.map(([w, top], i) => {
        const x0 = x; x += w;
        return (
          <g key={i}>
            <rect x={x0} y={top} width={w + 2} height={base - top} fill={fillOf(k)} />
            <rect x={x0} y={top} width={w + 2} height="8" fill={P[k].light} opacity="0.5" />
            {Array.from({ length: Math.floor((base - top - 40) / 70) }, (_, r) => Array.from({ length: Math.max(1, Math.floor((w - 30) / 56)) }, (_, c) => {
              const on = rnd(i * 31 + r * 7 + c, 40 + seed) < lit;
              return <rect key={`${r}-${c}`} x={x0 + 22 + c * 56} y={top + 30 + r * 70} width="22" height="30" rx="3" fill={on ? (rnd(i + r + c, 41 + seed) < 0.75 ? '#FFD27A' : '#BFD6FF') : P[k].shade} opacity={on ? 0.9 : 0.7} />;
            }))}
          </g>
        );
      })}
    </g>
  );
}

// ---- 1. the dark room and its round window --------------------------------------------------------------------------------
function WindowRoom({ t, cam }: { t: number; cam: Cam }) {
  const { cx, cy, r } = WINDOW, ring = Array.from({ length: 22 }, (_, i) => { const a = (2 * Math.PI * i) / 22 - Math.PI / 2; return { x: cx + (r + 36) * Math.cos(a), y: cy + (r + 36) * Math.sin(a) }; });
  const curtain = 6 * breezeAt(t);
  return (
    <g>
      <g transform={layer(cam, LAYERS.far)}>
        <rect width={W} height={H} fill="url(#s14night)" />
        <Stars stars={STARS_WINDOW} t={t} />
        <Moon x={680} y={640} r={46} />
        <Skyline base={1400} tops={[[150, 1080], [120, 1130], [170, 1050], [140, 1110], [160, 1070], [130, 1120], [180, 1060], [160, 1100]]} k="far" lit={0.3} seed={1} />
      </g>
      <g transform={layer(cam, LAYERS.near)}>
        <g filter="url(#s14paint)">
          <path d={`M0 0 H${W} V${H} H0 Z M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`} fill={fillOf('wall')} fillRule="evenodd" />
          <circle cx={cx} cy={cy} r={r + 260} fill="url(#s14spill)" style={{ mixBlendMode: 'screen' }} />
          <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={P.frame.edge} strokeWidth="34" />
          <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={fillOf('frame')} strokeWidth="26" />
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={P.frame.light} strokeWidth="3" opacity="0.6" />
          {/* the sill below the window, a diya and a small plant on it */}
          <rect x="170" y={cy + r + 92} width="740" height="380" fill={fillOf('sill')} opacity="0.92" />
          {[350, 730].map(x => <rect key={x} x={x - 150} y={cy + r + 130} width="300" height="150" rx="10" fill="none" stroke={P.sill.edge} strokeWidth="4" opacity="0.7" />)}
          {[350, 730].map(x => <circle key={x} cx={x} cy={cy + r + 205} r="9" fill={P.diya.light} />)}
          <rect x="120" y={cy + r + 60} width="840" height="36" rx="8" fill={fillOf('sill')} {...edge('sill', 3)} />
          {/* a plant and a stack of books on the sill */}
          <path d={`M182 ${cy + r + 60} L176 ${cy + r - 10} H252 L246 ${cy + r + 60} Z`} fill={fillOf('pot')} {...edge('pot', 3)} />
          {[[-40, -150, -30], [-10, -190, -8], [25, -170, 18], [45, -120, 34], [-55, -100, -46]].map(([dx, dy, a], i) => (
            <g key={i} transform={`rotate(${a + 2 * breezeAt(t, i)} 214 ${cy + r - 8})`}>
              <path d={`M214 ${cy + r - 8} Q${214 + dx * 0.4} ${cy + r - 8 + dy * 0.5} ${214 + dx * 0.2} ${cy + r - 8 + dy}`} fill="none" stroke={P.plant.edge} strokeWidth="4" />
              <ellipse cx={214 + dx * 0.2} cy={cy + r - 8 + dy} rx="16" ry="32" fill={fillOf('plant')} {...edge('plant', 2)} />
            </g>
          ))}
          {([['curtain', 0, 150], ['mat', 30, 130], ['lantern', 34, 140]] as const).map(([k, y, w], i) => (
            <rect key={i} x={890 - w / 2 + 6 * i} y={cy + r + 26 - y} width={w} height="30" rx="5" fill={fillOf(k)} {...edge(k, 2)} />
          ))}
          {/* a curtain drawn back on the left, moving a little in the breeze */}
          <path d={`M60 330 Q${150 + curtain} 700 ${110 + curtain} 1100 Q${150 + curtain} 1350 ${70 + curtain * 1.5} 1560 L0 1560 V330 Z`} fill={fillOf('curtain')} {...edge('curtain', 3)} />
          <path d="M40 300 H330" stroke={P.frame.fill} strokeWidth="14" strokeLinecap="round" />
        </g>
        <FairyLights pts={ring} t={t} />
        <Diya x={420} y={cy + r + 60} s={1.3} t={t} i={0} />
        <Diya x={680} y={cy + r + 60} s={1.3} t={t} i={1} />
      </g>
    </g>
  );
}

// ---- 2. Pune rooftops at Diwali ---------------------------------------------------------------------------------------------
function Rooftops({ t, cam }: { t: number; cam: Cam }) {
  return (
    <g>
      <g transform={layer(cam, LAYERS.sky)}>
        <rect width={W} height={H} fill="url(#s14city)" />
        <Stars stars={STARS_ROOF} t={t} />
        <Moon x={240} y={430} r={78} />
      </g>
      <g transform={layer(cam, LAYERS.far)}>
        <Skyline base={1920} tops={[[130, 1250], [160, 1200], [110, 1280], [180, 1220], [140, 1260], [150, 1190], [170, 1240], [120, 1270]]} k="far" lit={0.3} seed={2} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={W * rnd(i, 50)} cy={1180 + 60 * rnd(i, 51)} r={6 + 10 * rnd(i, 52)} fill={i % 3 ? WARM : '#FF9FB8'} opacity={0.25 + 0.2 * twinkleAt(i, t)} filter="url(#s14soft)" />)}
      </g>
      <g transform={layer(cam, LAYERS.mid)}>
        <Skyline base={1920} tops={[[260, 1400], [300, 1340], [240, 1420], [300, 1360]]} k="mid" lit={0.45} seed={3} />
        <FairyLights pts={sag(0, 1360, 560, 1350, 40, 15)} t={t} seed={3} />
        <FairyLights pts={sag(560, 1380, 1080, 1340, 30, 14)} t={t} seed={8} />
        <Lantern x={860} y={1190} t={t} />
      </g>
      <g transform={layer(cam, LAYERS.near)}>
        <g filter="url(#s14paint)">
          <rect x="-10" y="1712" width={W + 20} height="220" fill={fillOf('near')} />
          <rect x="-10" y="1702" width={W + 20} height="26" rx="6" fill={P.near.light} {...edge('near', 2)} />
        </g>
        {[150, 340, 540, 740, 930].map((x, i) => <Diya key={x} x={x} y={1704} s={1.4} t={t} i={i + 2} />)}
      </g>
    </g>
  );
}

// ---- 3. her on the terrace, her back to us, looking up -----------------------------------------------------------------------
function Her({ t }: { t: number }) {
  const { x, headY, r } = HER, tilt = tiltAt(t), lift = 2 * breathAt(t);
  const shoulderY = headY + 80 - lift, hipY = 1640;
  return (
    <g>
      {/* arms reaching back to her hands on the mat, behind her */}
      {[-1, 1].map(s => {
        const d = `M${x + s * 78} ${shoulderY + 30} Q${x + s * 150} ${shoulderY + 160} ${x + s * 172} ${hipY + 40}`;
        return (
          <g key={s}>
            <path d={d} fill="none" stroke={P.sweatshirt.edge} strokeWidth="44" strokeLinecap="round" />
            <path d={d} fill="none" stroke={s < 0 ? P.sweatshirt.light : P.sweatshirt.fill} strokeWidth="36" strokeLinecap="round" />
            <ellipse cx={x + s * 174} cy={hipY + 58} rx="20" ry="14" fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2" />
          </g>
        );
      })}
      {/* the oversized sweatshirt, from behind */}
      <path d={`M${x - 82} ${shoulderY + 6} Q${x} ${shoulderY - 22} ${x + 82} ${shoulderY + 6} Q${x + 120} ${shoulderY + 170} ${x + 128} ${hipY + 30} H${x - 128} Q${x - 120} ${shoulderY + 170} ${x - 82} ${shoulderY + 6} Z`} fill={fillOf('sweatshirt')} {...edge('sweatshirt')} />
      <path d={`M${x} ${shoulderY + 40} V${hipY}`} stroke={P.sweatshirt.shade} strokeWidth="6" opacity="0.4" strokeLinecap="round" />
      <path d={`M${x - 120} ${hipY + 18} Q${x} ${hipY + 40} ${x + 120} ${hipY + 18}`} fill="none" stroke={P.sweatshirt.shade} strokeWidth="14" strokeLinecap="round" />
      {/* the head, tipped back to look at the sky: from behind it drops a little and the hair foreshortens */}
      <g transform={`translate(0 ${10 * tilt - lift}) translate(${x} ${headY + 40}) scale(1 ${1 - 0.07 * tilt}) translate(${-x} ${-(headY + 40)})`}>
        <rect x={x - 16} y={headY + 30} width="32" height="40" fill={fillOf('skin')} />
        <ellipse cx={x} cy={headY} rx={r * 0.98} ry={r * 1.05} fill={fillOf('hair')} {...edge('hair', 2)} />
        {/* loose shoulder-length hair, moving in the breeze */}
        <path d={`M${x - r} ${headY - 10} Q${x - r - 14 + 3 * breezeAt(t)} ${headY + 70} ${x - r + 2 + 5 * breezeAt(t, 1)} ${headY + 104} Q${x} ${headY + 116} ${x + r - 2 + 5 * breezeAt(t, 2)} ${headY + 104} Q${x + r + 14 + 3 * breezeAt(t, 3)} ${headY + 70} ${x + r} ${headY - 10} Z`} fill={fillOf('hair')} {...edge('hair', 2)} />
        <path d={`M${x - 20} ${headY - r + 14} Q${x - 26} ${headY + 40} ${x - 14} ${headY + 96}`} fill="none" stroke={P.hair.light} strokeWidth="4" opacity="0.5" strokeLinecap="round" />
        <path d={`M${x + 22} ${headY - r + 18} Q${x + 30} ${headY + 40} ${x + 20} ${headY + 94}`} fill="none" stroke={P.hair.light} strokeWidth="3" opacity="0.4" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Terrace({ t, cam }: { t: number; cam: Cam }) {
  const steam = [0, 1, 2].map(i => { const u = (t / 2.4 + i / 3) % 1; return { y: -u * 90, a: Math.sin(Math.PI * u), sw: 8 * Math.sin(2 * Math.PI * (u + 0.3 * i)) }; });
  return (
    <g>
      <g transform={layer(cam, LAYERS.sky)}>
        <rect width={W} height={H} fill="url(#s14night)" />
        <g opacity="0.5" filter="url(#s14haze)"><ellipse cx="860" cy="260" rx="420" ry="120" transform="rotate(-35 860 260)" fill="#6C5AA8" /></g>
        <Stars stars={STARS_TERRACE} t={t} />
      </g>
      <g transform={layer(cam, LAYERS.far)}>
        <Skyline base={1920} tops={[[170, 1380], [140, 1410], [190, 1370], [150, 1400], [160, 1385], [180, 1395], [140, 1375]]} k="far" lit={0.3} seed={4} />
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={W * rnd(i, 60)} cy={1350 + 70 * rnd(i, 61)} r={5 + 9 * rnd(i, 62)} fill={i % 4 ? WARM : '#FF9FB8'} opacity={0.25 + 0.2 * twinkleAt(i + 3, t)} filter="url(#s14soft)" />)}
      </g>
      <g transform={layer(cam, LAYERS.near)}>
        <g filter="url(#s14paint)">
          {/* the parapet at the roof's edge, the terrace floor, the mat */}
          <rect x="-10" y="1440" width={W + 20} height="90" fill={fillOf('near')} />
          <rect x="-10" y="1430" width={W + 20} height="22" rx="6" fill={P.near.light} {...edge('near', 2)} />
          <rect x="-10" y="1530" width={W + 20} height="400" fill={fillOf('terrace')} />
          <path d="M150 1620 L930 1620 L1010 1920 L70 1920 Z" fill={fillOf('mat')} {...edge('mat', 3)} />
          {[1680, 1750, 1830].map(y => <path key={y} d={`M${130 - (y - 1620) * 0.27} ${y} H${950 + (y - 1620) * 0.27}`} stroke={P.mat.light} strokeWidth="8" opacity="0.6" />)}
          <Her t={t} />
          {/* a cup of chai beside her, steaming */}
          <path d="M300 1700 H356 L350 1760 H306 Z" fill={fillOf('cup')} {...edge('cup', 2)} />
          <ellipse cx="328" cy="1700" rx="28" ry="7" fill="#7A4426" />
        </g>
        <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
          {steam.map((s, i) => <path key={i} d={`M${320 + 8 * i + s.sw} ${1690 + s.y} q-10 -8 0 -16 q10 -8 0 -16`} strokeWidth="4" opacity={0.55 * s.a} />)}
        </g>
        {[120, 330, 760, 960].map((x, i) => <Diya key={x} x={x} y={1432} s={1.1} t={t} i={i + 7} />)}
        <Diya x={790} y={1720} s={1.4} t={t} i={12} />
      </g>
    </g>
  );
}

// ---- 4. the Milky Way and a shooting star -----------------------------------------------------------------------------------
function Sky({ t, cam }: { t: number; cam: Cam }) {
  const s = shootingStarAt(t);
  const ang = Math.atan2(560 - 360, 860 - 230) * 180 / Math.PI;
  return (
    <g>
      <g transform={layer(cam, LAYERS.sky)}>
        <rect width={W} height={H} fill="url(#s14deep)" />
      </g>
      <g transform={layer(cam, LAYERS.far)}>
        <g filter="url(#s14haze)">
          <ellipse cx="540" cy="950" rx="900" ry="200" transform="rotate(-51 540 950)" fill="#4B3F7E" />
          <ellipse cx="400" cy="1180" rx="400" ry="130" transform="rotate(-51 400 1180)" fill="#9A4F8E" opacity="0.75" />
          <ellipse cx="780" cy="620" rx="340" ry="110" transform="rotate(-51 780 620)" fill="#2F7A96" opacity="0.75" />
          <ellipse cx="300" cy="1420" rx="200" ry="80" transform="rotate(-51 300 1420)" fill="#C9708A" opacity="0.6" />
          <ellipse cx="560" cy="930" rx="520" ry="40" transform="rotate(-48 560 930)" fill="#141634" opacity="0.75" />
        </g>
        {DUST.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#EDEBFF" opacity={d.a * (0.7 + 0.3 * twinkleAt(i, t))} />)}
      </g>
      <g transform={layer(cam, LAYERS.near)}>
        <Stars stars={STARS_SKY} t={t} />
        {s && (
          <g opacity={s.alpha}>
            <rect x={s.x - s.tail} y={s.y - 2} width={s.tail} height="4" rx="2" fill="url(#s14tail)" transform={`rotate(${ang} ${s.x} ${s.y})`} />
            <circle cx={s.x} cy={s.y} r="14" fill="#DCE6FF" opacity="0.35" />
            <circle cx={s.x} cy={s.y} r="4.5" fill="#FFFFFF" />
          </g>
        )}
      </g>
    </g>
  );
}

// ---- 5. moonlit clouds ----------------------------------------------------------------------------------------------------
/** A soft bank of cloud: flattened puffs on a long base, their tops lit by the moon. */
function Cloud({ x, y, w }: { x: number; y: number; w: number }) {
  const puffs = [[-0.4, 0.02, 0.13, 0.08], [-0.25, -0.04, 0.16, 0.11], [-0.06, -0.08, 0.18, 0.13], [0.14, -0.05, 0.16, 0.1], [0.32, 0.0, 0.13, 0.08], [0.45, 0.04, 0.08, 0.05]];
  return (
    <g>
      <ellipse cx={x} cy={y + 0.06 * w} rx={0.52 * w} ry={0.07 * w} fill={P.cloud.shade} />
      {puffs.map(([dx, dy, rx, ry], i) => <ellipse key={i} cx={x + dx * w} cy={y + dy * w} rx={rx * w} ry={ry * w} fill={fillOf('cloud')} />)}
      <ellipse cx={x} cy={y + 0.07 * w} rx={0.5 * w} ry={0.045 * w} fill={P.cloud.shade} opacity="0.8" />
      {puffs.map(([dx, dy, rx, ry], i) => (
        <path key={i} d={`M${x + (dx - rx * 0.75) * w} ${y + (dy - ry * 0.6) * w} Q${x + dx * w} ${y + (dy - ry * 1.25) * w} ${x + (dx + rx * 0.75) * w} ${y + (dy - ry * 0.6) * w}`} fill="none" stroke={P.cloud.light} strokeWidth="6" opacity="0.75" strokeLinecap="round" />
      ))}
    </g>
  );
}

function Clouds({ t, cam }: { t: number; cam: Cam }) {
  const c = cloudsAt(t), depth = [LAYERS.mid, LAYERS.far, LAYERS.near, LAYERS.far];
  return (
    <g>
      <g transform={layer(cam, LAYERS.sky)}>
        <rect width={W} height={H} fill="url(#s14moonlit)" />
        <Stars stars={STARS_CLOUDS} t={t} />
        <Moon x={MOON.x - 220} y={MOON.y} r={MOON.r * 1.5} />
      </g>
      {[1, 3, 0, 2].map(i => (
        <g key={i} transform={layer(cam, depth[i])} filter={depth[i] < 0.5 ? 'url(#s14soft)' : undefined}>
          <Cloud x={c[i].x} y={c[i].y} w={c[i].w} />
        </g>
      ))}
    </g>
  );
}

function Scene({ id, t, cam }: { id: ShotId; t: number; cam: Cam }) {
  if (id === 'window') return <WindowRoom t={t} cam={cam} />;
  if (id === 'rooftops') return <Rooftops t={t} cam={cam} />;
  if (id === 'terrace') return <Terrace t={t} cam={cam} />;
  if (id === 'sky') return <Sky t={t} cam={cam} />;
  return <Clouds t={t} cam={cam} />;
}

/** One line at a time, mid-frame, in Lora; a soft dark halo keeps it readable over lights. */
function Lines({ t }: { t: number }) {
  const b = TEXT_BOX, handle = TEXT_BOXES.find(x => x.id === 'handle')!;
  const box: React.CSSProperties = { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: SCENE.text };
  return (
    <>
      {LINES.map(l => {
        const a = textAlpha(l, t);
        return a > 0 && (
          <div key={l.text} style={{ ...box, left: b.x, top: b.y, width: b.w, height: b.h, opacity: a, font: '500 54px/1.3 Lora', textWrap: 'balance',
            textShadow: '0 0 22px rgba(8,9,30,0.9), 0 2px 8px rgba(8,9,30,0.8)' } as React.CSSProperties}>{l.text}</div>
        );
      })}
      <div style={{ ...box, left: handle.x, top: handle.y, width: handle.w, height: handle.h, font: '500 30px Lora', opacity: 0.8 }}>@soundmindwithshivani</div>
    </>
  );
}

export function SoundMind014({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, d = dissolveAt(t), s = shotAt(t);
  return (
    <AbsoluteFill style={{ background: '#0E1233' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <Defs />
        {d && <Scene id={d.prevId} t={t} cam={d.prev} />}
        <g opacity={d ? d.k : 1}><Scene id={s.id} t={t} cam={cameraAt(t)} /></g>
        <rect width={W} height={H} fill="url(#s14vignette)" />
        <rect width={W} height={H} fill="#07081A" opacity={1 - dimAt(t)} />
        <Grain />
      </svg>
      <Lines t={t} />
      {!cover && <Html5Audio src={staticFile('sm-r014-stars-mix.wav')} />}
    </AbsoluteFill>
  );
}
