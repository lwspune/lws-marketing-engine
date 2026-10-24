// @soundmindwithshivani pause reel #3 (framework S20, Painted 2D S21), "window seat". Timeline and palette: lib/sm013.ts.
// A warm, dim room around a bright golden-hour window: she reads curled in the window seat, chai steaming on the sill,
// dust drifting in the sunbeam, a lamp, a plant, fairy lights; the town and a low sun outside move at their own depth.
// Painted, not outlined: gradients from each shape's light side to its shadow side, edges a darker shade of the colour.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  W, H, DURATION, HOOK, LINE2, SCENE, PAINT, WINDOW, SEAT_Y, CUP, BOOK, HER, SUN, BEAM, LAYERS, shotAt, cameraAt,
  dissolveAt, focusBlur, cameraTransform, glanceAt, leanAt, eyesClosed, breezeAt, steamAt, pageAt, motesAt, cloudsAt,
  birdsAt, twinkleAt,
} from './lib/sm013.ts';
import { layerCam, type Cam } from './lib/sm011.ts';
import { VIVID } from './lib/smPalette.ts';
import { Filters, Grain, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 1.8;                                       // looking out of the window, the message up
const P = PAINT;
const layer = (cam: Cam, depth: number) => cameraTransform(layerCam(cam, depth));
const fillOf = (k: keyof typeof PAINT) => `url(#s13${k})`;
const edge = (k: keyof typeof PAINT, w = 3) => ({ stroke: P[k].edge, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const WARM = '#FFD08A', WARM_HOT = '#FFF0C8';

function Defs() {
  return (
    <defs>
      {Object.entries(P).map(([k, p]) => (
        <linearGradient key={k} id={`s13${k}`} x1="0.1" y1="0.15" x2="0.9" y2="0.85">
          <stop offset="0" stopColor={p.light} /><stop offset="0.45" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} />
        </linearGradient>
      ))}
      <linearGradient id="s13sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E9A36A" /><stop offset="0.45" stopColor="#F6C27E" /><stop offset="0.75" stopColor="#FBDCA6" /><stop offset="1" stopColor="#F3C59A" />
      </linearGradient>
      <radialGradient id="s13sun"><stop offset="0" stopColor="#FFF6DA" /><stop offset="0.35" stopColor="#FFD889" stopOpacity="0.9" /><stop offset="1" stopColor="#FFB86B" stopOpacity="0" /></radialGradient>
      <radialGradient id="s13glow"><stop offset="0" stopColor={WARM_HOT} stopOpacity="0.85" /><stop offset="0.3" stopColor={WARM} stopOpacity="0.4" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
      <radialGradient id="s13window" cx="0.55" cy="0.5" r="0.6"><stop offset="0" stopColor="#FFC98A" stopOpacity="0.5" /><stop offset="1" stopColor="#FFC98A" stopOpacity="0" /></radialGradient>
      <linearGradient id="s13beam" x1="0.7" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#FFE2A8" stopOpacity="0.32" /><stop offset="1" stopColor="#FFE2A8" stopOpacity="0" /></linearGradient>
      <radialGradient id="s13vignette" cx="0.55" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#140E18" stopOpacity="0" /><stop offset="1" stopColor="#140E18" stopOpacity="0.55" /></radialGradient>
      <filter id="s13blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
      <filter id="s13soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="s13mid" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter>
      <filter id="s13paint"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
    </defs>
  );
}

// ---- outside the window: the evening sky, a low sun, the town, clouds, birds going home ---------------------------------
function Town({ t }: { t: number }) {
  const blocks = [[260, 150, 960], [400, 130, 900], [520, 170, 940], [680, 140, 880], [810, 200, 960], [990, 140, 920]];
  return (
    <g>
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 3} fill="url(#s13sun)" />
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#FFF1C8" opacity="0.95" />
      {cloudsAt(t).map((c, i) => <ellipse key={i} cx={c.x} cy={c.y} rx={c.w} ry={c.w * 0.22} fill="#FCE3C2" opacity="0.75" filter="url(#s13soft)" />)}
      {blocks.map(([x, w, top], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={1300 - top} fill={i % 2 ? '#B9806A' : '#A8705E'} opacity="0.85" />
          {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => (
            <rect key={`${r}-${c}`} x={x + 18 + c * (w - 36) / 3} y={top + 24 + r * 60} width="16" height="22" rx="2" fill={(r + c + i) % 3 === 0 ? '#FFE3A0' : '#C99482'} opacity="0.9" />
          )))}
        </g>
      ))}
      <rect x="0" y="1060" width={W} height="300" fill="#F3C59A" opacity="0.35" />
    </g>
  );
}

function Birds({ t }: { t: number }) {
  return (
    <g fill="none" stroke="#6B4A4A" strokeWidth="4" strokeLinecap="round">
      {birdsAt(t).filter(b => b.on).map((b, i) => <path key={i} d={`M${b.x - 14} ${b.y + 6 * b.flap} Q${b.x - 6} ${b.y - 6} ${b.x} ${b.y} Q${b.x + 6} ${b.y - 6} ${b.x + 14} ${b.y + 6 * b.flap}`} />)}
    </g>
  );
}

// ---- the room: the wall with its window, frame, seat, lamp, plant, fairy lights, the sunbeam ------------------------------
function Room({ t }: { t: number }) {
  const { x0, x1, y0, y1 } = WINDOW;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return (
    <g>
      {/* the wall, with the window cut out of it so the evening shows through */}
      <path d={`M0 0 H${W} V${H} H0 Z M${x0} ${y0} V${y1} H${x1} V${y0} Z`} fill={fillOf('wall')} fillRule="evenodd" />
      <circle cx={mx} cy={my} r="620" fill="url(#s13window)" style={{ mixBlendMode: 'screen' }} />
      {/* the window frame and its bars */}
      <path d={`M${x0} ${y0} H${x1} V${y1} H${x0} Z`} fill="none" {...edge('frame', 4)} stroke={P.frame.fill} strokeWidth="26" />
      <path d={`M${x0} ${y0} H${x1} V${y1} H${x0} Z`} fill="none" stroke={P.frame.edge} strokeWidth="4" />
      <path d={`M${mx} ${y0} V${y1} M${x0} ${my - 40} H${x1}`} stroke={P.frame.fill} strokeWidth="16" />
      <path d={`M${mx} ${y0} V${y1} M${x0} ${my - 40} H${x1}`} stroke={P.frame.light} strokeWidth="4" opacity="0.6" />
      {/* fairy lights along the top of the window */}
      <path d={`M${x0 - 20} ${y0 - 22} Q${mx} ${y0 + 20} ${x1 + 20} ${y0 - 22}`} fill="none" stroke="#3B2F33" strokeWidth="3" />
      {Array.from({ length: 13 }, (_, i) => {
        const u = i / 12, x = x0 - 20 + u * (x1 - x0 + 40), y = y0 - 22 + 4 * u * (1 - u) * 42, k = twinkleAt(i, t);
        return <g key={i}><circle cx={x} cy={y + 8} r="20" fill={WARM} opacity={0.3 * k} /><circle cx={x} cy={y + 8} r="7" fill={WARM_HOT} opacity={0.6 + 0.4 * k} /></g>;
      })}
      {/* the floor lamp on the left, glowing */}
      <path d="M150 1700 V830" stroke={P.lampBrass.edge} strokeWidth="12" strokeLinecap="round" />
      <path d="M150 1700 V830" stroke={P.lampBrass.fill} strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="150" cy="1702" rx="60" ry="14" fill={fillOf('lampBrass')} {...edge('lampBrass', 2)} />
      <circle cx="150" cy="800" r="230" fill="url(#s13glow)" style={{ mixBlendMode: 'screen' }} />
      <path d="M80 820 L102 700 H198 L220 820 Z" fill={fillOf('lampShade')} {...edge('lampShade', 3)} />
      {/* the window seat, its front panel and a rug on the floor */}
      <rect x="230" y={SEAT_Y} width="850" height="34" rx="8" fill={fillOf('seat')} {...edge('seat', 3)} />
      <rect x="250" y={SEAT_Y + 34} width="810" height="300" fill={fillOf('seat')} opacity="0.9" />
      {[420, 640, 860].map((x) => <rect key={x} x={x - 80} y={SEAT_Y + 70} width="160" height="220" rx="10" fill="none" stroke={P.seat.edge} strokeWidth="4" opacity="0.6" />)}
      <ellipse cx="560" cy="1760" rx="460" ry="90" fill={fillOf('rug')} opacity="0.9" />
      {/* the plant on the seat */}
      <path d="M330 1290 L322 1220 H398 L390 1290 Z" fill={fillOf('pot')} {...edge('pot', 3)} />
      {[[-40, -150, -30], [-10, -190, -8], [25, -170, 18], [45, -120, 34], [-55, -100, -46]].map(([dx, dy, a], i) => (
        <g key={i} transform={`rotate(${a + 2 * breezeAt(t, i)} 360 1222)`}>
          <path d={`M360 1222 Q${360 + dx * 0.4} ${1222 + dy * 0.5} ${360 + dx * 0.2} ${1222 + dy}`} fill="none" stroke={P.plant.edge} strokeWidth="4" />
          <ellipse cx={360 + dx * 0.2} cy={1222 + dy} rx="16" ry="32" fill={fillOf('plant')} {...edge('plant', 2)} />
        </g>
      ))}
    </g>
  );
}

/** The sunbeam through the window and the dust drifting in it. */
function Beam({ t }: { t: number }) {
  return (
    <g style={{ mixBlendMode: 'screen' }}>
      <path d={`M${WINDOW.x0 + 60} ${WINDOW.y0 + 80} L${WINDOW.x1 - 40} ${WINDOW.y0 + 80} L${BEAM.x1} ${BEAM.y1} L${BEAM.x0 - 80} ${BEAM.y1} Z`} fill="url(#s13beam)" />
      {motesAt(t).map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="#FFF3D6" opacity={m.alpha} />)}
    </g>
  );
}

// ---- the mug of chai on the sill, steaming ----------------------------------------------------------------------------------
function Mug({ t }: { t: number }) {
  const { x, y } = CUP;
  return (
    <g>
      <path d={`M${x - 34} ${y - 66} H${x + 34} L${x + 30} ${y} H${x - 30} Z`} fill={fillOf('mug')} {...edge('mug', 3)} />
      <path d={`M${x + 32} ${y - 50} q30 4 26 24 q-4 18 -28 14`} fill="none" stroke={P.mug.edge} strokeWidth="10" />
      <path d={`M${x + 32} ${y - 50} q30 4 26 24 q-4 18 -28 14`} fill="none" stroke={P.mug.fill} strokeWidth="5" />
      <ellipse cx={x} cy={y - 66} rx="34" ry="8" fill="#8A4E2A" />
      <ellipse cx={x - 14} cy={y - 40} rx="6" ry="16" fill="#FFFFFF" opacity="0.35" />
      <g fill="none" stroke="#FFFFFF" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => {
          const s = steamAt(i, t), sx = x - 12 + 8 * i + s.sway, sy = y - 76 - s.rise;
          return <path key={i} d={`M${sx} ${sy + 40} q-14 -10 0 -20 q14 -10 0 -20`} strokeWidth={4 + 5 * (s.rise / 150)} opacity={0.7 * s.alpha} />;
        })}
      </g>
    </g>
  );
}

// ---- her: curled in the window seat, knees up, the book open on her knees --------------------------------------------------
function Face({ x, y, r, closed, look }: { x: number; y: number; r: number; closed: boolean; look: number }) {
  const k = r / 50, ey = y + 2 + 4 * (1 - look);                 // reading: eyes lowered; looking out: level
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 0.92} ry={r} fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2.5" />
      {closed || look < 0.3 ? (
        <g fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round">
          <path d={`M${x - 26 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} /><path d={`M${x + 8 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} />
        </g>
      ) : (
        [-17, 17].map((dx) => <g key={dx}><ellipse cx={x + dx * k + 3 * look} cy={ey} rx={6.5 * k} ry={8 * k} fill="#2A1A12" /><circle cx={x + dx * k + 3 * look + 2} cy={ey - 3} r={2 * k} fill="#FFFFFF" /></g>)
      )}
      <path d={`M${x - 28 * k} ${ey - 16 * k} q10 ${-6 * k} ${20 * k} -1 M${x + 8 * k} ${ey - 17 * k} q10 ${-5 * k} ${20 * k} 1`} fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round" />
      <path d={`M${x + 2 * k} ${ey + 6 * k} q4 ${9 * k} -3 ${12 * k}`} fill="none" stroke={P.skin.edge} strokeWidth={2.5 * k} opacity="0.7" strokeLinecap="round" />
      <path d={`M${x - 10 * k} ${y + 26 * k} Q${x} ${y + 33 * k} ${x + 10 * k} ${y + 26 * k}`} fill="#C9665E" stroke="#A8514A" strokeWidth={1.5 * k} />
      {[-30, 30].map((dx) => <ellipse key={dx} cx={x + dx * k} cy={y + 14 * k} rx={9 * k} ry={6 * k} fill="#F08A8A" opacity="0.35" />)}
    </g>
  );
}

function Book({ t, x, y, w }: { t: number; x: number; y: number; w: number }) {
  const p = pageAt(t), half = w / 2, lines = [0.25, 0.4, 0.55, 0.7];
  const turnX = half * Math.cos(Math.PI * p);                          // the turning page's free edge: right → left
  return (
    <g>
      <path d={`M${x - half - 8} ${y + 10} L${x} ${y + 22} L${x + half + 8} ${y + 10} L${x + half + 4} ${y - 70} L${x} ${y - 58} L${x - half - 4} ${y - 70} Z`} fill={fillOf('cover')} {...edge('cover', 3)} />
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${x} ${y + 12} L${x + s * half} ${y} L${x + s * half} ${y - 74} L${x} ${y - 62} Z`} fill={fillOf('pages')} {...edge('pages', 2)} />
          {lines.map((u) => <path key={u} d={`M${x + s * 14} ${y - 62 + 74 * u + 2} L${x + s * (half - 14)} ${y - 74 + 74 * u + 4}`} stroke={P.pages.shade} strokeWidth="3" opacity="0.7" />)}
        </g>
      ))}
      {p > 0 && p < 1 && (
        <path d={`M${x} ${y + 12} Q${x + turnX * 0.5} ${y - 30 - 50 * Math.sin(Math.PI * p)} ${x + turnX} ${y - 6 - 30 * Math.sin(Math.PI * p)} L${x + turnX} ${y - 80 - 30 * Math.sin(Math.PI * p)} Q${x + turnX * 0.5} ${y - 100 - 50 * Math.sin(Math.PI * p)} ${x} ${y - 62} Z`}
          fill={p < 0.5 ? P.pages.light : P.pages.fill} stroke={P.pages.edge} strokeWidth="2" />
      )}
    </g>
  );
}

function Her({ t }: { t: number }) {
  const { x, headY, r } = HER, look = glanceAt(t), lean = leanAt(t), breath = Math.sin(t * 2.1);
  const shoulderY = headY + 72, knees = SEAT_Y - 120;
  const bookY = BOOK.y + 6 * lean, bookX = BOOK.x;                   // at the end the book settles open on her knees
  return (
    <g>
      {/* the cushion she sits on */}
      <rect x={x - 150} y={SEAT_Y - 26} width="300" height="34" rx="16" fill={fillOf('cushion')} {...edge('cushion', 3)} />
      {/* her back against the window frame, the sweater, the head */}
      <g transform={`rotate(${-3 * lean} ${x} ${SEAT_Y - 20}) translate(0 ${-1.5 * breath})`}>
        <path d={`M${x - 74} ${shoulderY + 8} Q${x} ${shoulderY - 16} ${x + 74} ${shoulderY + 8} Q${x + 100} ${shoulderY + 120} ${x + 92} ${SEAT_Y - 24} H${x - 92} Q${x - 100} ${shoulderY + 120} ${x - 74} ${shoulderY + 8} Z`} fill={fillOf('sweater')} {...edge('sweater')} />
        <path d={`M${x - 30} ${shoulderY - 2} Q${x} ${shoulderY + 22} ${x + 30} ${shoulderY - 2}`} fill="none" stroke={P.sweater.shade} strokeWidth="9" strokeLinecap="round" />
        <g transform={`rotate(${10 * look - 12 * lean} ${x} ${headY + 46}) translate(${14 * look} 0)`}>
          <path d={`M${x - r - 6} ${headY} Q${x - r - 20} ${headY + 110} ${x - r + 4} ${headY + 140} H${x + r - 4} Q${x + r + 20} ${headY + 110} ${x + r + 6} ${headY} Z`} fill={fillOf('hair')} {...edge('hair', 2)} />
          <rect x={x - 12} y={headY + 34} width="24" height="34" fill={fillOf('skin')} />
          <Face x={x} y={headY} r={r} closed={eyesClosed(t)} look={look} />
          <path d={`M${x - r - 4} ${headY + 12} Q${x - r - 8} ${headY - r - 12} ${x} ${headY - r - 6} Q${x + r + 8} ${headY - r - 12} ${x + r + 4} ${headY + 12} Q${x + r - 8} ${headY - 30} ${x + 4} ${headY - r + 14} L${x} ${headY - r + 8} L${x - 4} ${headY - r + 14} Q${x - r + 8} ${headY - 30} ${x - r - 4} ${headY + 12} Z`}
            fill={fillOf('hair')} {...edge('hair', 2)} />
        </g>
      </g>
      {/* knees drawn up, pyjama legs, socks */}
      {[-1, 1].map((s) => {
        const cx = x + s * 40;
        return (
          <g key={s}>
            <path d={`M${cx - 32} ${SEAT_Y - 18} L${cx - 33} ${knees + 32} A33 32 0 0 1 ${cx + 33} ${knees + 32} L${cx + 30} ${SEAT_Y - 18} Z`} fill={fillOf('pyjama')} {...edge('pyjama', 2.5)} />
            <ellipse cx={cx + s * 6} cy={SEAT_Y - 12} rx="30" ry="12" fill="#F4F0E8" stroke="#CFC6B6" strokeWidth="2.5" />
          </g>
        );
      })}
      {/* the book, open on her knees (on her chest at the end), and her hands holding it */}
      <Book t={t} x={bookX} y={bookY} w={BOOK.w} />
      {[-1, 1].map((s) => {
        const sx = x + s * 66, sy = shoulderY + 30, hx = bookX + s * (BOOK.w / 2 - 6), hy = bookY - 24;
        const d = `M${sx} ${sy} Q${x + s * 120} ${(sy + hy) / 2 + 40} ${hx} ${hy}`;
        return (
          <g key={s}>
            <path d={d} fill="none" stroke={P.sweater.edge} strokeWidth="34" strokeLinecap="round" />
            <path d={d} fill="none" stroke={s < 0 ? P.sweater.light : P.sweater.fill} strokeWidth="27" strokeLinecap="round" />
            <circle cx={hx} cy={hy} r="12" fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2" />
          </g>
        );
      })}
    </g>
  );
}

function Scene({ t, cam, blur }: { t: number; cam: Cam; blur: number }) {
  const soft = blur > 0 ? 'url(#s13mid)' : undefined;
  return (
    <g>
      <rect width={W} height={H} fill="url(#s13sky)" />
      <g transform={layer(cam, LAYERS.town)} filter={soft}><Town t={t} /></g>
      <g transform={layer(cam, LAYERS.near)} filter={soft}><Birds t={t} /></g>
      <g transform={layer(cam, LAYERS.room)}>
        <g filter="url(#s13paint)">
          <Room t={t} />
          <Her t={t} />
          <Mug t={t} />
        </g>
        <Beam t={t} />
      </g>
    </g>
  );
}

export function SoundMind013({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, d = dissolveAt(t), s = shotAt(t);
  return (
    <AbsoluteFill style={{ background: SCENE.behindText[0] }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <Defs />
        {d && <Scene t={t} cam={d.prev} blur={focusBlur(d.prevId)} />}
        <g opacity={d ? d.k : 1}><Scene t={t} cam={cameraAt(t)} blur={focusBlur(s.id)} /></g>
        <rect width={W} height={H} fill="url(#s13vignette)" />
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} ink={SCENE.text} p={VIVID} />
      {!cover && <Html5Audio src={staticFile('sm-r013-window-mix.wav')} />}
    </AbsoluteFill>
  );
}
