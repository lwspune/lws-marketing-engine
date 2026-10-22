// @soundmindwithshivani reel #10 ("the rain cloud"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm010.ts.
// Vivid palette (framework S18).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, CLOUD, SIGNS, SPROUTS, signAt, cloudAt, rainAt, sproutAt, rainbowAt, sunAt, smileAt,
  bloomAt, zoomAt, type Sign,
} from './lib/sm010.ts';
import { labelWidth, LABEL_H } from './lib/meStory.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, LabelPill, MeFigure, Outdoor, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.3;                                    // the second sign up, the cloud already squeezed a step
const FOCUS = { x: 460, y: 1060 };                      // the close-up frames ME and her cloud
const RAIN = '#5AB8F0', POST = '#A0643C';
const BANDS = ['#FF4D6D', '#FF9F1C', '#FFD23F', '#3FA34D', '#2EC4B6', '#7B61FF'];
const DROPS = 40;
const rand = (i: number, k: number) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const ART = 1.1;                                        // the cloud drawing, scaled to CLOUD's size
const mix = (a: string, b: string, k: number) => {
  const p = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k)).join(',')})`;
};

function Cloud({ t }: { t: number }) {
  const c = cloudAt(t);
  if (c.alpha <= 0) return null;
  const fill = mix('#FFFFFF', '#5E6B7A', c.dark), w = CLOUD.w / 2 / ART, h = CLOUD.h / 2 / ART;
  return (
    <g opacity={c.alpha} transform={`translate(${CLOUD.x} ${c.y}) scale(${c.scale * ART})`}>
      {[[-80, 10, 60], [-20, -24, 78], [60, -6, 66], [100, 20, 46]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={fill} stroke={pal.ink} strokeWidth="6" />)}
      <rect x={-w + 10} y={0} width={2 * w - 20} height={h} rx={h / 2} fill={fill} stroke={pal.ink} strokeWidth="6" />
      {[[-80, 10, 54], [-20, -24, 72], [60, -6, 60], [100, 20, 40]].map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={fill} />)}
      <rect x={-w + 16} y={4} width={2 * w - 32} height={h - 8} rx={h / 2 - 4} fill={fill} />
    </g>
  );
}

// Raindrops fall from under the cloud to the grass; how many fall at once follows the rain's strength.
function Rain({ t }: { t: number }) {
  const r = rainAt(t), c = cloudAt(t);
  if (r <= 0) return null;
  const top = c.y + (CLOUD.h / 2) * c.scale, span = (CLOUD.w / 2 - 30) * c.scale;
  return (
    <>
      {Array.from({ length: DROPS }, (_, i) => {
        if (i / DROPS >= r) return null;
        const u = (t * (1.4 + 0.4 * rand(i, 2)) + rand(i, 1)) % 1, x = CLOUD.x - span + rand(i, 3) * 2 * span, y = top + u * (GROUND_Y - top);
        return <path key={i} d={`M${x} ${y} q-10 20 0 28 q10 -8 0 -28 Z`} fill={RAIN} stroke={pal.ink} strokeWidth="3" />;
      })}
    </>
  );
}

function SignPost({ s, i, t }: { s: Sign; i: number; t: number }) {
  const st = signAt(s, t);
  if (st.phase === 'wait' || st.phase === 'gone') return null;
  return (
    <g opacity={st.alpha} transform={`rotate(${st.rot} ${st.x} ${GROUND_Y + 10})`}>
      <rect x={st.x - 9} y={st.y + LABEL_H / 2 - 4} width="18" height={Math.max(0, GROUND_Y + 30 - st.y - LABEL_H / 2)} fill={POST} stroke={pal.ink} strokeWidth="4" />
      <g transform={`translate(${st.x} ${st.y})`}><LabelPill w={labelWidth(s.label)} text={s.label} fill={pal.pills[i % pal.pills.length]} /></g>
    </g>
  );
}

// Flowers in the grass: a stem with two leaves grows up, then the petals open at the ending.
function Sprouts({ t }: { t: number }) {
  const b = bloomAt(t);
  return (
    <>
      {SPROUTS.map((f, i) => {
        const g = sproutAt(f, t);
        if (g <= 0) return null;
        const y = GROUND_Y + 30, h = 90 * g;
        return (
          <g key={i}>
            <path d={`M${f.x} ${y} V${y - h}`} stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${f.x} ${y - h * 0.45} q-30 -6 -38 -26 q26 -2 38 22 Z M${f.x} ${y - h * 0.6} q30 -6 38 -26 q-26 -2 -38 22 Z`} fill={pal.leaf} stroke={pal.ink} strokeWidth="3" transform={`translate(${f.x} ${y}) scale(${g}) translate(${-f.x} ${-y})`} />
            <g transform={`translate(${f.x} ${y - h}) scale(${0.35 + 0.65 * b})`}>
              {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={14 * Math.cos((a * Math.PI) / 180)} cy={14 * Math.sin((a * Math.PI) / 180)} r="11" fill={i % 2 ? pal.bloomPetal : '#FF9F1C'} stroke={pal.ink} strokeWidth="3" />)}
              <circle r="8" fill={pal.bloomCenter} stroke={pal.ink} strokeWidth="3" />
            </g>
          </g>
        );
      })}
    </>
  );
}

// The rainbow draws itself across the sky, band by band, behind everything.
function Rainbow({ t }: { t: number }) {
  const k = rainbowAt(t);
  if (k <= 0) return null;
  return (
    <g opacity="0.9">
      {BANDS.map((c, i) => <path key={c} d={`M${60 + i * 22} 1290 A${480 - i * 22} ${520 - i * 22} 0 0 1 ${1020 - i * 22} 1290`} fill="none" stroke={c} strokeWidth="22" pathLength={1} strokeDasharray={`${k} 1`} />)}
    </g>
  );
}

function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 90} ${headY + 150} ${x + 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}

export function SoundMind010({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t), sun = sunAt(t);
  return (
    <AbsoluteFill style={{ background: pal.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          <Outdoor sun={sun} groundY={GROUND_Y} p={pal} />
          <Rainbow t={t} />
          <rect width="1080" height="1920" fill={pal.mood} opacity={pal.moodOpacity * (1 - sun)} />
          <Sprouts t={t} />
          <Rain t={t} />
          <g filter="url(#rough)"><Me t={t} /></g>
          <g filter="url(#rough)"><Cloud t={t} /></g>
          {SIGNS.map((s, i) => <SignPost key={i} s={s} i={i} t={t} />)}
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r010-rain.wav')} />}
    </AbsoluteFill>
  );
}
