// @soundmindwithshivani racing-mind reel #1 (framework S23, Painted 2D S21), "the 1 a.m. thoughts". Timeline and palette:
// lib/sm015.ts. A dark blue bedroom and one warm lamp: she lies awake on her side, phone glowing, while her thoughts
// crowd the dark above her; at the cut they all stop, then from above she breathes in, out, and closes her eyes.
// Painted, not outlined: gradients from each shape's light side to its shadow side, edges a darker shade of the colour.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  W, H, THOUGHTS, thoughtAlpha, LINES, LINE_BOX, textAlpha, SCENE, PAINT, LAYERS, SIDE, TOP, shotAt, cameraAt,
  cameraTransform, eyesClosed, shiftAt, chestAt, restlessAt, phoneLit, lampAt, twinkleAt, type Thought,
} from './lib/sm015.ts';
import { layerCam, type Cam } from './lib/sm011.ts';
import { TEXT_BOXES } from './lib/meStory.ts';
import { Filters, Grain, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 8.6;                                       // the thoughts piling up over her
const P = PAINT;
const layer = (cam: Cam, depth: number) => cameraTransform(layerCam(cam, depth));
const fillOf = (k: keyof typeof PAINT) => `url(#s15${k})`;
const edge = (k: keyof typeof PAINT, w = 3) => ({ stroke: P[k].edge, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
const WARM = '#FFC872', WARM_HOT = '#FFF0C8';

function Defs() {
  return (
    <defs>
      {Object.entries(P).map(([k, p]) => (
        <linearGradient key={k} id={`s15${k}`} x1="0.1" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0" stopColor={p.light} /><stop offset="0.45" stopColor={p.fill} /><stop offset="1" stopColor={p.shade} />
        </linearGradient>
      ))}
      <linearGradient id="s15wallside" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A3256" /><stop offset="0.5" stopColor="#1E2846" /><stop offset="1" stopColor="#151C36" /></linearGradient>
      <linearGradient id="s15night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0C1030" /><stop offset="1" stopColor="#1C2050" /></linearGradient>
      <radialGradient id="s15lamp"><stop offset="0" stopColor={WARM_HOT} stopOpacity="0.8" /><stop offset="0.25" stopColor={WARM} stopOpacity="0.4" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
      <radialGradient id="s15screen"><stop offset="0" stopColor="#DCE8FF" stopOpacity="0.7" /><stop offset="1" stopColor="#DCE8FF" stopOpacity="0" /></radialGradient>
      <linearGradient id="s15hush" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#080B1E" stopOpacity="0.55" /><stop offset="0.45" stopColor="#080B1E" stopOpacity="0.45" /><stop offset="0.56" stopColor="#080B1E" stopOpacity="0" /></linearGradient>
      <radialGradient id="s15vignette" cx="0.45" cy="0.6" r="0.8"><stop offset="0.5" stopColor="#070A1A" stopOpacity="0" /><stop offset="1" stopColor="#070A1A" stopOpacity="0.65" /></radialGradient>
      <filter id="s15soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
      <filter id="s15paint"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
    </defs>
  );
}

// ---- her face: painted, no outline; worried brows while awake, soft when resting --------------------------------------------
function Face({ x, y, r, closed, worry }: { x: number; y: number; r: number; closed: boolean; worry: number }) {
  const k = r / 50, ey = y + 2;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 0.92} ry={r} fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2.5" />
      {closed ? (
        <g fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round">
          <path d={`M${x - 26 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} /><path d={`M${x + 8 * k} ${ey} q9 ${7 * k} ${18 * k} 0`} />
        </g>
      ) : (
        [-17, 17].map(dx => <g key={dx}><ellipse cx={x + dx * k} cy={ey} rx={6.5 * k} ry={8 * k} fill="#2A1A12" /><circle cx={x + dx * k + 2} cy={ey - 3} r={2 * k} fill="#FFFFFF" /></g>)
      )}
      {/* brows: the inner ends lift when she worries */}
      <path d={`M${x - 28 * k} ${ey - 16 * k} q10 ${-6 * k - 4 * worry * k} ${20 * k} ${-1 - 6 * worry * k} M${x + 8 * k} ${ey - 17 * k - 6 * worry * k} q10 ${-5 * k + 4 * worry * k} ${20 * k} ${1 + 6 * worry * k}`} fill="none" stroke={P.hair.fill} strokeWidth={3.5 * k} strokeLinecap="round" />
      <path d={`M${x + 2 * k} ${ey + 6 * k} q4 ${9 * k} -3 ${12 * k}`} fill="none" stroke={P.skin.edge} strokeWidth={2.5 * k} opacity="0.7" strokeLinecap="round" />
      <path d={worry > 0.5 ? `M${x - 9 * k} ${y + 29 * k} Q${x} ${y + 25 * k} ${x + 9 * k} ${y + 29 * k}` : `M${x - 10 * k} ${y + 26 * k} Q${x} ${y + 32 * k} ${x + 10 * k} ${y + 26 * k}`}
        fill="none" stroke="#A8514A" strokeWidth={3 * k} strokeLinecap="round" />
      {[-30, 30].map(dx => <ellipse key={dx} cx={x + dx * k} cy={y + 14 * k} rx={9 * k} ry={6 * k} fill="#F08A8A" opacity="0.3" />)}
    </g>
  );
}

function Lamp({ x, y, t, top = false }: { x: number; y: number; t: number; top?: boolean }) {
  const k = lampAt(t) * (0.97 + 0.03 * Math.sin(t * 9));
  return (
    <g>
      <circle cx={x} cy={y} r={(top ? 380 : 620) * k} fill="url(#s15lamp)" opacity={k} style={{ mixBlendMode: 'screen' }} />
      {top ? (
        <g><circle cx={x} cy={y} r="62" fill={fillOf('lampShade')} {...edge('lampShade', 3)} /><circle cx={x} cy={y} r="24" fill={WARM_HOT} opacity={0.9 * k} /></g>
      ) : (
        <g>
          <path d={`M${x} ${y + 60} V${y + 150}`} stroke={P.brass.fill} strokeWidth="8" />
          <ellipse cx={x} cy={y + 152} rx="40" ry="10" fill={fillOf('brass')} {...edge('brass', 2)} />
          <path d={`M${x - 70} ${y + 64} L${x - 44} ${y - 50} H${x + 44} L${x + 70} ${y + 64} Z`} fill={fillOf('lampShade')} {...edge('lampShade', 3)} />
          <ellipse cx={x} cy={y + 64} rx="70" ry="10" fill={WARM_HOT} opacity={0.8 * k} />
        </g>
      )}
    </g>
  );
}

// ---- 1. awake: on her side, the lamp, the phone, the window with Diwali lights outside ---------------------------------------
function Side({ t, cam }: { t: number; cam: Cam }) {
  const { headX, headY, r, lampX, lampY, phoneX, phoneY } = SIDE, s = shiftAt(t), b = restlessAt(t);
  return (
    <g>
      <g transform={layer(cam, LAYERS.outside)}>
        <rect width={W} height={H} fill="url(#s15night)" />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={575 + 26 * i} cy={930 + 12 * Math.sin(i * 0.9)} r="5" fill={WARM} opacity={0.35 + 0.35 * twinkleAt(i, t)} />)}
      </g>
      <g transform={layer(cam, LAYERS.room)}>
        <g filter="url(#s15paint)">
          {/* the wall with a small window on the right, curtains half drawn */}
          <path d={`M0 0 H${W} V${H} H0 Z M560 820 V1040 H780 V820 Z`} fill="url(#s15wallside)" fillRule="evenodd" />
          <path d="M560 820 V1040 H780 V820 Z M670 820 V1040" fill="none" stroke={P.frame.fill} strokeWidth="10" />
          <path d={`M545 795 Q${575 + 3 * Math.sin(t)} 920 550 1065 L605 1065 Q598 920 605 795 Z`} fill={fillOf('curtain')} {...edge('curtain', 2)} />
          <path d={`M795 795 Q${768 + 3 * Math.sin(t + 1)} 920 790 1065 L735 1065 Q742 920 738 795 Z`} fill={fillOf('curtain')} {...edge('curtain', 2)} />
          {/* the bedside table */}
          <rect x="20" y={phoneY + 16} width="230" height="260" fill={fillOf('wood')} {...edge('wood', 3)} />
          <rect x="10" y={phoneY + 4} width="250" height="20" rx="5" fill={P.wood.light} {...edge('wood', 2)} />
          {/* the bed: frame, sheet, pillow */}
          <rect x="250" y="1300" width="840" height="230" fill={fillOf('sheet')} {...edge('sheet', 3)} />
          <rect x="250" y="1520" width="840" height="40" fill={fillOf('wood')} />
          <rect x="250" y="1080" width="30" height="480" rx="8" fill={fillOf('wood')} {...edge('wood', 2)} />
          <ellipse cx="420" cy="1268" rx="170" ry="52" fill={fillOf('pillow')} {...edge('pillow', 3)} />
        </g>
        <Lamp x={lampX} y={lampY} t={t} />
        {/* her phone, screen up and glowing until the cut */}
        <g>
          {phoneLit(t) && <circle cx={phoneX} cy={phoneY - 10} r="110" fill="url(#s15screen)" style={{ mixBlendMode: 'screen' }} />}
          <rect x={phoneX - 42} y={phoneY - 8} width="84" height="14" rx="4" fill={fillOf('phone')} {...edge('phone', 2)} />
          {phoneLit(t) && <rect x={phoneX - 36} y={phoneY - 10} width="72" height="4" rx="2" fill="#DCE8FF" />}
        </g>
        <g filter="url(#s15paint)">
          {/* hair spread on the pillow, her head on its side, the blanket over her, a hand at the edge */}
          <g transform={`rotate(-16 ${headX} ${headY}) translate(${-3 * s} ${b * 0.8})`}>
            <path d={`M${headX - r - 30} ${headY + 30} Q${headX - r - 50} ${headY - r - 30} ${headX} ${headY - r - 18} Q${headX + r + 40} ${headY - r - 20} ${headX + r + 24} ${headY + 20} Q${headX + r + 40} ${headY + 60} ${headX + r} ${headY + 50} L${headX - r} ${headY + 50} Z`} fill={fillOf('hair')} {...edge('hair', 2)} />
            <Face x={headX} y={headY} r={r} closed={eyesClosed(t)} worry={1} />
            <path d={`M${headX - r + 4} ${headY - 20} Q${headX - 20} ${headY - r - 8} ${headX + r - 4} ${headY - 24} Q${headX + 10} ${headY - r + 2} ${headX - r + 4} ${headY - 20} Z`} fill={fillOf('hair')} />
          </g>
          <path d={`M${headX + 30} ${headY + 70 + b} Q${headX + 120} ${1150 - 14 * s + b} ${640 + 10 * s} ${1160 - 20 * s} Q${820} ${1120 - 10 * s} ${980} ${1200} Q1060 1240 1080 1300 L1080 1330 H${headX - 40} Q${headX - 20} ${headY + 80} ${headX + 30} ${headY + 70 + b} Z`} fill={fillOf('blanket')} {...edge('blanket', 3)} />
          <path d={`M${headX + 10} ${headY + 86 + b} Q${headX + 140} ${1180 - 12 * s} ${700} ${1190 - 14 * s}`} fill="none" stroke={P.blanket.light} strokeWidth="6" opacity="0.5" strokeLinecap="round" />
          <ellipse cx={headX + 70} cy={headY + 62 + b} rx="26" ry="18" fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2" />
        </g>
      </g>
    </g>
  );
}

// ---- 3. rest: from above, on her back, breathing slowly --------------------------------------------------------------------
function Top({ t, cam }: { t: number; cam: Cam }) {
  const { headX, headY, r, lampX, lampY } = TOP, c = chestAt(t);
  return (
    <g transform={layer(cam, LAYERS.room)}>
      <g filter="url(#s15paint)">
        {/* the floor, a rug, the bedside table with its lamp and the phone face down */}
        <rect width={W} height={H} fill="#231E36" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M0 ${80 + 160 * i} H${W}`} stroke="#2E2744" strokeWidth="4" />)}
        <rect x="20" y={lampY - 110} width="200" height="220" rx="10" fill={fillOf('wood')} {...edge('wood', 3)} />
        <rect x="120" y={lampY + 50} width="44" height="80" rx="8" fill={fillOf('phone')} {...edge('phone', 2)} />
        {/* the bed: headboard, mattress, pillow */}
        <rect x="230" y="420" width="620" height="70" rx="14" fill={fillOf('wood')} {...edge('wood', 3)} />
        <rect x="250" y="480" width="580" height="1360" rx="22" fill={fillOf('sheet')} {...edge('sheet', 3)} />
        <ellipse cx={headX} cy={headY - 40} rx="210" ry="96" fill={fillOf('pillow')} {...edge('pillow', 3)} />
        {/* her hair spread on the pillow */}
        <path d={`M${headX - r - 50} ${headY + 30} Q${headX - r - 80} ${headY - r - 60} ${headX} ${headY - r - 44} Q${headX + r + 80} ${headY - r - 60} ${headX + r + 50} ${headY + 30} Q${headX + r + 30} ${headY + 70} ${headX + r - 6} ${headY + 40} L${headX - r + 6} ${headY + 40} Q${headX - r - 30} ${headY + 70} ${headX - r - 50} ${headY + 30} Z`} fill={fillOf('hair')} {...edge('hair', 2)} />
      </g>
      <Lamp x={lampX} y={lampY - 20} t={t} top />
      <g filter="url(#s15paint)">
        {/* her neck, with a soft shadow under the chin; it runs under the collar so a breath never opens a gap */}
        <rect x={headX - 25} y={headY + 30} width="50" height="130" rx="18" fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2" />
        <ellipse cx={headX} cy={headY + r - 2} rx="30" ry="12" fill={P.skin.shade} opacity="0.55" />
        {/* the sweatshirt's shoulders and the blanket, rising and falling with her breath */}
        <g transform={`translate(0 ${-8 * c}) translate(${headX} 1000) scale(${1 + 0.035 * c} ${1 + 0.05 * c}) translate(${-headX} -1000)`}>
          <path d={`M${headX - 140} 1000 Q${headX - 150} ${headY + 126} ${headX} ${headY + 112} Q${headX + 150} ${headY + 126} ${headX + 140} 1000 Z`} fill={fillOf('sweatshirt')} {...edge('sweatshirt')} />
          <path d={`M${headX - 34} ${headY + 116} Q${headX} ${headY + 140} ${headX + 34} ${headY + 116}`} fill="none" stroke={P.sweatshirt.shade} strokeWidth="9" strokeLinecap="round" />
          <rect x="262" y="960" width="556" height="870" rx="30" fill={fillOf('blanket')} {...edge('blanket', 3)} />
          <rect x="262" y="960" width="556" height="56" rx="20" fill={P.sheet.light} {...edge('sheet', 2)} />
          {/* her arms along her sides, over the blanket */}
          {[-1, 1].map(s => {
            const d = `M${headX + s * 118} ${headY + 150} Q${headX + s * 180} 990 ${headX + s * 148} 1120`;
            return (
              <g key={s}>
                <path d={d} fill="none" stroke={P.sweatshirt.edge} strokeWidth="66" strokeLinecap="round" />
                <path d={d} fill="none" stroke={s < 0 ? P.sweatshirt.light : P.sweatshirt.fill} strokeWidth="58" strokeLinecap="round" />
              </g>
            );
          })}
          {[-1, 1].map(s => <ellipse key={s} cx={headX + s * 147} cy="1152" rx="22" ry="28" fill={fillOf('skin')} stroke={P.skin.edge} strokeWidth="2" />)}
        </g>
        <Face x={headX} y={headY} r={r} closed={eyesClosed(t)} worry={0} />
      </g>
    </g>
  );
}

/** A racing thought: Lora for most, Kalam (her handwriting) for the "italic" ones, a dark halo over the lamp light. */
function ThoughtText({ th, t }: { th: Thought; t: number }) {
  const a = thoughtAlpha(th, t);
  if (a <= 0) return null;
  const font = th.style === 'italic' ? `700 ${th.size}px/1.3 Kalam` : `${th.style === 'bold' ? 700 : 500} ${th.size}px/1.3 Lora`;
  return (
    <div style={{ position: 'absolute', left: th.x, top: th.y, whiteSpace: 'nowrap', color: SCENE.text, opacity: a, font,
      textShadow: '0 0 18px rgba(8,10,30,0.9), 0 2px 6px rgba(8,10,30,0.8)' }}>{th.text}</div>
  );
}

function Words({ t }: { t: number }) {
  const b = LINE_BOX, handle = TEXT_BOXES.find(x => x.id === 'handle')!;
  const box: React.CSSProperties = { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: SCENE.text };
  return (
    <>
      {THOUGHTS.map(th => <ThoughtText key={th.text} th={th} t={t} />)}
      {LINES.map(l => {
        const a = textAlpha(l, t);
        return a > 0 && (
          <div key={l.text} style={{ ...box, left: b.x, top: b.y, width: b.w, height: b.h, opacity: a, font: '500 60px/1.3 Lora', textWrap: 'balance',
            textShadow: '0 0 22px rgba(8,10,30,0.9), 0 2px 8px rgba(8,10,30,0.8)' } as React.CSSProperties}>{l.text}</div>
        );
      })}
      <div style={{ ...box, left: handle.x, top: handle.y, width: handle.w, height: handle.h, font: '500 30px Lora', opacity: 0.8 }}>@soundmindwithshivani</div>
    </>
  );
}

export function SoundMind015({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, s = shotAt(t), cam = cameraAt(t);
  return (
    <AbsoluteFill style={{ background: '#1E2846' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <Defs />
        {s.id === 'rest' ? <Top t={t} cam={cam} /> : <Side t={t} cam={cam} />}
        {/* the dark above her, where the thoughts go: keeps them readable over the lamp's glow */}
        {s.id === 'awake' && <rect width={W} height={H} fill="url(#s15hush)" />}
        <rect width={W} height={H} fill="url(#s15vignette)" />
        <Grain />
      </svg>
      <Words t={t} />
      {!cover && <Html5Audio src={staticFile('sm-r015-thoughts-mix.wav')} />}
    </AbsoluteFill>
  );
}
