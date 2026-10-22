// @soundmindwithshivani reel #7 ("the glitter jar"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm007.ts.
// Vivid palette (framework S18).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, JAR, PLANT, PRESSURES, GLITTER, jarAt, pressureAt, shakeAt, agitationAt, glitterAt,
  breathAt, smileAt, sunAt, bloomAt, zoomAt,
} from './lib/sm007.ts';
import { labelWidth } from './lib/meStory.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, LabelPill, MeFigure, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.2;                                    // the second pressure just landed, the jar tilting, glitter whirling
const FOCUS = { x: 480, y: 1120 };                      // the close-up frames ME and her jar
const WATER = '#E8F7FF', MURK = '#B9A6FF', LID = '#FF9F1C';
const SPARKLES = ['#FF4D6D', '#F4A100', '#7B61FF', '#12A594'];

function Jar({ t }: { t: number }) {
  const { x, y } = jarAt(t), tilt = shakeAt(t), a = agitationAt(t), { w, h } = JAR;
  return (
    <g transform={`rotate(${tilt} ${x} ${y + h / 2})`}>
      <defs><clipPath id="water"><rect x={x - w / 2 + 6} y={y - h / 2 + 34} width={w - 12} height={h - 40} rx="34" /></clipPath></defs>
      <rect x={x - w / 2} y={y - h / 2 + 24} width={w} height={h - 24} rx="40" fill={WATER} stroke={pal.ink} strokeWidth="6" />
      <g clipPath="url(#water)">
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={MURK} opacity={0.35 * a} />
        {GLITTER.map((g, i) => {
          const p = glitterAt(g, t), s = g.size;
          return <rect key={i} x={x + p.x - s / 2} y={y + p.y - s / 2} width={s} height={s} rx="1.5" fill={SPARKLES[g.colour]}
            transform={`rotate(${45 + 90 * a * Math.sin(t * g.speed + g.phase)} ${x + p.x} ${y + p.y})`} />;
        })}
      </g>
      <path d={`M${x - w / 2 + 26} ${y - h / 2 + 60} Q${x - w / 2 + 18} ${y} ${x - w / 2 + 28} ${y + 50}`} fill="none" stroke={pal.white} strokeWidth="10" strokeLinecap="round" opacity="0.85" />
      <rect x={x - w / 2 + 14} y={y - h / 2} width={w - 28} height="34" rx="10" fill={LID} stroke={pal.ink} strokeWidth="6" />
      {Math.abs(tilt) > 2 && [-1, 1].map((s) => (
        <path key={s} d={`M${x + s * (w / 2 + 22)} ${y - 40} q${s * 14} 20 0 40 M${x + s * (w / 2 + 42)} ${y - 56} q${s * 18} 28 0 56`}
          fill="none" stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
      ))}
    </g>
  );
}

// ME holds the jar in her right hand (then rests it on the grass); her left hand on her knee; calm breaths ring out.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME, j = jarAt(t);
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 110} ${headY + 120} ${j.x - JAR.w / 2 + 4} ${j.y + 20}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}
function Breath({ t }: { t: number }) {
  const u = breathAt(t);
  if (u < 0) return null;
  return <circle cx={ME.x} cy={ME.headY + 80} r={150 + 160 * u} fill="none" stroke={pal.sage} strokeWidth="6" opacity={0.45 * (1 - u)} />;
}

function Pressures({ t }: { t: number }) {
  return (
    <>
      {PRESSURES.map((p, i) => {
        const s = pressureAt(p, t);
        if (s.phase === 'wait' || s.phase === 'gone') return null;
        return (
          <g key={i} opacity={s.alpha} transform={`translate(${s.x} ${s.y}) scale(${s.scale})`}>
            <LabelPill w={labelWidth(p.label)} text={p.label} fill={pal.pills[i % pal.pills.length]} />
          </g>
        );
      })}
    </>
  );
}

export function SoundMind007({ cover = false }: { cover?: boolean }) {
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
          <Breath t={t} />
          <g filter="url(#rough)">
            <Plant x={PLANT.x} y={PLANT.y} scale={0.6 + 0.35 * bloomAt(t)} bloom={bloomAt(t)} potScale={1.3} p={pal} />
            <Me t={t} />
          </g>
          <Jar t={t} />
          <Pressures t={t} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r007-jar.wav')} />}
    </AbsoluteFill>
  );
}
