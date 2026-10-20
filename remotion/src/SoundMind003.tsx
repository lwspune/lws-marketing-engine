// @soundmindwithshivani reel #3 ("my own plant"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm003.ts.
// Two palettes (lib/smPalette.ts): the original muted one, and `vivid` (founder, 2026-10-20: "more vibrant colours").
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, PLANT, CROWS, BANNER_DY, crowAt, zoomAt, growthAt, bloomAt, sunAt, smileAt, pourAt,
} from './lib/sm003.ts';
import { labelWidth, LABEL_H } from './lib/meStory.ts';
import { MUTED, VIVID, type SmPalette } from './lib/smPalette.ts';
import { Filters, Grain, LabelPill, MeFigure, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

// Cover moments: the muted cover as first made; the vivid one when two remarks are fully on screen.
const COVER_T = 4.2, COVER_T_VIVID = 4.9;
const FOCUS = { x: 560, y: 1150 };                      // the close-up frames ME and her plant together
const CAN = { x: 560, y: 1185 };

// A crow: dark body, flapping wings, a little orange beak; it faces the way it flies in.
function CrowShape({ x, y, flap, face, pal }: { x: number; y: number; flap: number; face: 1 | -1; pal: SmPalette }) {
  const wing = 26 * flap;
  return (
    <g transform={`translate(${x} ${y}) scale(${face} 1)`}>
      <path d={`M-10 -6 Q-40 ${-30 - wing} -62 ${-12 - wing} Q-36 -8 -10 4 Z`} fill={pal.crow} stroke={pal.ink} strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="0" cy="0" rx="38" ry="20" fill={pal.crow} stroke={pal.ink} strokeWidth="4" />
      <path d="M-34 -4 L-56 -14 L-52 8 Z" fill={pal.crow} stroke={pal.ink} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="34" cy="-12" r="16" fill={pal.crow} stroke={pal.ink} strokeWidth="4" />
      <path d="M48 -14 L66 -8 L48 -4 Z" fill={pal.beak} stroke={pal.ink} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="38" cy="-15" r="3.5" fill={pal.white} />
      <path d={`M6 2 Q-14 ${22 + wing} -40 ${18 + wing} Q-18 8 6 2 Z`} fill={pal.crowWing} stroke={pal.ink} strokeWidth="4" strokeLinejoin="round" />
    </g>
  );
}

function Crows({ t, pal }: { t: number; pal: SmPalette }) {
  return (
    <>
      {CROWS.map((c, i) => {
        const p = crowAt(c, t);
        if (p.phase === 'wait' || p.phase === 'gone') return null;
        const top = p.y + BANNER_DY - LABEL_H / 2;
        return (
          <g key={i}>
            <path d={`M${p.x} ${p.y + 18} L${p.x} ${top}`} stroke={pal.ink} strokeWidth="3" />
            <g transform={`translate(${p.x} ${p.y + BANNER_DY})`}><LabelPill w={labelWidth(c.label)} text={c.label} fill={pal.pills[i % pal.pills.length]} /></g>
            <CrowShape x={p.x} y={p.y} flap={p.flap} face={(c.side < 0) === (p.phase !== 'leave') ? 1 : -1} pal={pal} />
          </g>
        );
      })}
    </>
  );
}

// ME holds the watering can in her right hand, tipped towards her plant; her left hand rests on her knee.
function Me({ t, pal }: { t: number; pal: SmPalette }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 100} ${headY + 110} ${CAN.x - 50} ${CAN.y + 4}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}
function Can({ t, pal }: { t: number; pal: SmPalette }) {
  const k = pourAt(t), pouring = k <= 1;
  return (
    <g>
      <g transform={`rotate(${pouring ? 14 : 4} ${CAN.x} ${CAN.y})`}>
        <path d={`M${CAN.x - 50} ${CAN.y - 30} Q${CAN.x - 20} ${CAN.y - 76} ${CAN.x + 16} ${CAN.y - 30}`} fill="none" stroke={pal.ink} strokeWidth="7" />
        <path d={`M${CAN.x - 56} ${CAN.y - 30} H${CAN.x + 30} L${CAN.x + 24} ${CAN.y + 34} H${CAN.x - 50} Z`} fill={pal.can} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d={`M${CAN.x + 26} ${CAN.y + 6} L${CAN.x + 96} ${CAN.y - 34} L${CAN.x + 104} ${CAN.y - 22} L${CAN.x + 28} ${CAN.y + 22} Z`} fill={pal.can} stroke={pal.ink} strokeWidth="5" strokeLinejoin="round" />
      </g>
      <circle cx={CAN.x - 50} cy={CAN.y + 4} r="13" fill={pal.white} stroke={pal.ink} strokeWidth="5" />
      {pouring && [0, 0.33, 0.66].map((o, i) => {
        const u = (k + o) % 1;
        return <path key={i} d={`M${CAN.x + 108 + 10 * u} ${CAN.y - 14 + 70 * u} q-6 10 0 15 q6 -5 0 -15 Z`} fill={pal.water} stroke={pal.soft} strokeWidth="3" opacity={1 - u * 0.5} />;
      })}
    </g>
  );
}

export function SoundMind003({ cover = false, vivid = false }: { cover?: boolean; vivid?: boolean }) {
  useSoundMindFonts();
  const pal = vivid ? VIVID : MUTED;
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? (vivid ? COVER_T_VIVID : COVER_T) : frame / fps, z = zoomAt(t), sun = sunAt(t);
  return (
    <AbsoluteFill style={{ background: pal.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          <Outdoor sun={sun} groundY={GROUND_Y} p={pal} />
          {/* a grey mood over the day that lifts as the sun comes out */}
          <rect width="1080" height="1920" fill={pal.mood} opacity={pal.moodOpacity * (1 - sun)} />
          <g filter="url(#rough)">
            <Plant x={PLANT.x} y={PLANT.y} scale={growthAt(t)} bloom={bloomAt(t)} potScale={PLANT.potScale} p={pal} />
            <Me t={t} pal={pal} />
            <Can t={t} pal={pal} />
          </g>
          <Crows t={t} pal={pal} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r003-plant.wav')} />}
    </AbsoluteFill>
  );
}
