// @soundmindwithshivani reel #8 ("the teacup"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm008.ts.
// Vivid palette (framework S18).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, CUP, PLANT, KETTLES, POURING, kettleAt, levelAt, spillAt, lidAt, splashAt, steamAt,
  sunAt, smileAt, bloomAt, zoomAt, type Kettle,
} from './lib/sm008.ts';
import { labelWidth } from './lib/meStory.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, LabelPill, MeFigure, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 7.3;                                    // the fourth request pouring, the cup already spilling over
const FOCUS = { x: 470, y: 1120 };                      // the close-up frames ME and her cup
const TEA = '#C9783B', CUP_FILL = '#FFF1B5', SAUCER = '#CDEFFF', LID = '#FF6F91';
const KETTLE_COLOURS = ['#2EC4B6', '#FF9F1C', '#7B61FF', '#FF6F91'];
const TOP = CUP.y - CUP.h;                              // the cup's rim
const KS = 1.25;                                        // kettles drawn a quarter larger than their outline below
const cupPath = `M${CUP.x - CUP.w / 2} ${TOP} H${CUP.x + CUP.w / 2} L${CUP.x + CUP.w / 2 - 16} ${CUP.y} H${CUP.x - CUP.w / 2 + 16} Z`;

function Cup({ t }: { t: number }) {
  const level = Math.min(1, levelAt(t)), spill = spillAt(t), fillTop = CUP.y - (CUP.h - 10) * level;
  return (
    <g>
      <defs><clipPath id="cup"><path d={cupPath} /></clipPath></defs>
      <ellipse cx={CUP.x} cy={CUP.y + 6} rx="120" ry="20" fill={SAUCER} stroke={pal.ink} strokeWidth="5" />
      {spill > 0 && <ellipse cx={CUP.x} cy={CUP.y + 6} rx={40 + 70 * spill} ry={8 + 9 * spill} fill={TEA} opacity="0.9" />}
      <path d={`M${CUP.x + CUP.w / 2 - 8} ${TOP + 22} q46 6 30 42 q-10 14 -34 10`} fill="none" stroke={pal.ink} strokeWidth="9" strokeLinecap="round" />
      <path d={cupPath} fill={CUP_FILL} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      <rect x={CUP.x - CUP.w / 2} y={fillTop} width={CUP.w} height={CUP.y - fillTop} fill={TEA} clipPath="url(#cup)" />
      <path d={cupPath} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      {spill > 0 && [-1, 1].map((s) => (
        <path key={s} d={`M${CUP.x + s * (CUP.w / 2 - 4)} ${TOP} q${s * 10} ${40 * spill} ${s * 2} ${(CUP.h + 4) * spill}`} fill="none" stroke={TEA} strokeWidth="10" strokeLinecap="round" />
      ))}
      <path d={`M${CUP.x - CUP.w / 2 + 18} ${TOP + 18} L${CUP.x - CUP.w / 2 + 28} ${CUP.y - 18}`} fill="none" stroke={pal.white} strokeWidth="7" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

function Lid({ t }: { t: number }) {
  const k = lidAt(t);
  if (k <= 0) return null;
  const y = TOP - 8 - 170 * (1 - k);
  return (
    <g opacity={Math.min(1, k * 3)}>
      <ellipse cx={CUP.x} cy={y} rx={CUP.w / 2 + 10} ry="16" fill={LID} stroke={pal.ink} strokeWidth="5" />
      <circle cx={CUP.x} cy={y - 18} r="10" fill={LID} stroke={pal.ink} strokeWidth="5" />
    </g>
  );
}

// Splashes: drops thrown off the lid while a second-wave kettle pours onto it.
function Splash({ t }: { t: number }) {
  const s = splashAt(t);
  if (s <= 0) return null;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const u = ((t * 2.2 + i / 6) % 1), dir = i % 2 ? 1 : -1, spread = 40 + 18 * (i % 3);
        return <circle key={i} cx={CUP.x + dir * spread * (0.4 + u)} cy={TOP - 24 - 60 * u + 80 * u * u} r={7 - 3 * u} fill={TEA} opacity={s * (1 - u)} />;
      })}
    </>
  );
}

function KettleShape({ k, i, t }: { k: Kettle; i: number; t: number }) {
  const s = kettleAt(k, t);
  if (s.phase === 'wait' || s.phase === 'gone') return null;
  const face = -k.side, colour = KETTLE_COLOURS[i % KETTLE_COLOURS.length];
  const rot = -k.side * s.tilt, a = (rot * Math.PI) / 180;
  // The spout's tip, turned with the kettle, is where the tea leaves it.
  const tip = { x: s.x + KS * (Math.cos(a) * (face * 92) - Math.sin(a) * -18), y: s.y + KS * (Math.sin(a) * (face * 92) + Math.cos(a) * -18) };
  const target = lidAt(t) > 0.5 ? TOP - 30 : TOP + 6;
  return (
    <g>
      {s.tilt > POURING && <path d={`M${tip.x} ${tip.y} Q${(tip.x + CUP.x) / 2} ${tip.y} ${CUP.x + k.side * 6} ${target}`} fill="none" stroke={TEA} strokeWidth="11" strokeLinecap="round" />}
      <g transform={`rotate(${rot} ${s.x} ${s.y}) translate(${s.x} ${s.y}) scale(${KS}) translate(${-s.x} ${-s.y})`}>
        <path d={`M${s.x + face * 40} ${s.y - 4} L${s.x + face * 94} ${s.y - 26} L${s.x + face * 96} ${s.y - 12} L${s.x + face * 46} ${s.y + 18} Z`} fill={colour} stroke={pal.ink} strokeWidth="5" strokeLinejoin="round" />
        <path d={`M${s.x - face * 46} ${s.y - 26} q${-face * 44} 30 0 56`} fill="none" stroke={pal.ink} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx={s.x} cy={s.y + 4} rx="58" ry="50" fill={colour} stroke={pal.ink} strokeWidth="6" />
        <rect x={s.x - 30} y={s.y - 54} width="60" height="14" rx="6" fill={pal.white} stroke={pal.ink} strokeWidth="4" />
        <circle cx={s.x} cy={s.y - 60} r="8" fill={pal.white} stroke={pal.ink} strokeWidth="4" />
      </g>
      <g transform={`translate(${s.x} ${s.labelY})`}><LabelPill w={labelWidth(k.label)} text={k.label} fill={pal.pills[i % pal.pills.length]} /></g>
    </g>
  );
}

// Steam from her own tea curls up into a heart at the ending.
function Steam({ t }: { t: number }) {
  const k = steamAt(t);
  if (k <= 0) return null;
  const x = CUP.x, y = TOP - 70;
  return <path d={`M${x} ${y + 40} C${x - 70} ${y - 10} ${x - 40} ${y - 70} ${x} ${y - 36} C${x + 40} ${y - 70} ${x + 70} ${y - 10} ${x} ${y + 40}`}
    fill="none" stroke={pal.bloomPetal} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />;
}

// ME holds the saucer in her right hand; her left hand rests on her knee.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 100} ${headY + 120} ${CUP.x - 112} ${CUP.y + 8}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}

export function SoundMind008({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t), sun = sunAt(t);
  return (
    <AbsoluteFill style={{ background: pal.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          <Outdoor sun={sun} groundY={GROUND_Y} p={pal} />
          <rect width="1080" height="1920" fill={pal.mood} opacity={pal.moodOpacity * (1 - sun)} />
          <g filter="url(#rough)">
            <Plant x={PLANT.x} y={PLANT.y} scale={0.6 + 0.35 * bloomAt(t)} bloom={bloomAt(t)} potScale={1.3} p={pal} />
            <Me t={t} />
            <Cup t={t} />
            <Lid t={t} />
          </g>
          <Steam t={t} />
          <Splash t={t} />
          {KETTLES.map((k, i) => <KettleShape key={i} k={k} i={i} t={t} />)}
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r008-teacup.wav')} />}
    </AbsoluteFill>
  );
}
