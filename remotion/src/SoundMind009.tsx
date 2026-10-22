// @soundmindwithshivani reel #9 ("the kite"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm009.ts.
// Vivid palette (framework S18).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, HAND, KITE, PLANT, CLOUDS, cloudAt, cloudWidth, kiteAt, sagAt, sunAt, smileAt, bloomAt,
  zoomAt, type Cloud,
} from './lib/sm009.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, MeFigure, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.8;                                    // the second cloud at the height of its gust, the kite jerked aside
const FOCUS = { x: 520, y: 1000 };                      // the close-up frames ME, the string and the kite
const STORM = '#C5CDD6', STORM_DARK = '#9AA6B2';
const SAILS = ['#FF6F91', '#FFD23F', '#2EC4B6', '#FF9F1C'];
const BOWS = ['#FF6F91', '#7B61FF', '#FFD23F'];

function Kite({ t }: { t: number }) {
  const k = kiteAt(t), w = KITE.w / 2, h = KITE.h / 2, top = -h, bottom = h, cross = -h * 0.3;
  const sails = [
    `M0 ${top} L${-w} ${cross} L0 ${cross} Z`, `M0 ${top} L${w} ${cross} L0 ${cross} Z`,
    `M${-w} ${cross} L0 ${bottom} L0 ${cross} Z`, `M${w} ${cross} L0 ${bottom} L0 ${cross} Z`,
  ];
  // The tail waves behind the kite's bottom tip, with three bows along it.
  const tail = Array.from({ length: 9 }, (_, i) => ({ x: 14 * Math.sin(t * 5 - i * 0.8) * (i / 8), y: bottom + i * 22 }));
  return (
    <g transform={`translate(${k.x} ${k.y}) rotate(${k.rot})`}>
      <path d={`M${tail.map((p) => `${p.x} ${p.y}`).join(' L')}`} fill="none" stroke={pal.ink} strokeWidth="4" strokeLinecap="round" />
      {[3, 5, 7].map((i, b) => (
        <path key={i} d={`M${tail[i].x - 14} ${tail[i].y - 8} L${tail[i].x + 14} ${tail[i].y + 8} L${tail[i].x + 14} ${tail[i].y - 8} L${tail[i].x - 14} ${tail[i].y + 8} Z`}
          fill={BOWS[b]} stroke={pal.ink} strokeWidth="3" strokeLinejoin="round" />
      ))}
      {sails.map((d, i) => <path key={i} d={d} fill={SAILS[i]} />)}
      <path d={`M0 ${top} L${w} ${cross} L0 ${bottom} L${-w} ${cross} Z M0 ${top} V${bottom} M${-w} ${cross} H${w}`} fill="none" stroke={pal.ink} strokeWidth="5" strokeLinejoin="round" />
    </g>
  );
}

// The string runs from ME's hand to the kite's bottom tip, sagging more once it's let out.
function KiteString({ t }: { t: number }) {
  const k = kiteAt(t), a = (k.rot * Math.PI) / 180, tip = { x: k.x - Math.sin(a) * (KITE.h / 2), y: k.y + Math.cos(a) * (KITE.h / 2) };
  const mx = (HAND.x + tip.x) / 2, my = (HAND.y + tip.y) / 2 + sagAt(t);
  return <path d={`M${HAND.x} ${HAND.y} Q${mx} ${my} ${tip.x} ${tip.y}`} fill="none" stroke={pal.ink} strokeWidth="3" />;
}

function CloudShape({ c, t }: { c: Cloud; t: number }) {
  const s = cloudAt(c, t);
  if (s.phase === 'wait' || s.phase === 'gone') return null;
  const w = cloudWidth(c.label), hw = w / 2;
  const n = Math.max(3, Math.round(w / 90));
  const puffs = Array.from({ length: n }, (_, i) => ({ x: -hw + 50 + ((w - 100) * i) / (n - 1), r: i % 2 ? 50 : 62 }));
  const toKite = -c.side;
  return (
    <g transform={`translate(${s.x} ${s.y})`}>
      {puffs.map((p, i) => <circle key={i} cx={p.x} cy={-22} r={p.r} fill={STORM} stroke={pal.ink} strokeWidth="5" />)}
      <rect x={-hw} y={-30} width={w} height={86} rx={43} fill={STORM} stroke={pal.ink} strokeWidth="5" />
      {puffs.map((p, i) => <circle key={`f${i}`} cx={p.x} cy={-22} r={p.r - 5} fill={STORM} />)}
      <rect x={-hw + 5} y={-25} width={w - 10} height={76} rx={38} fill={STORM} />
      <path d={`M${-hw + 40} 44 q${hw - 40} 14 ${w - 80} 0`} fill="none" stroke={STORM_DARK} strokeWidth="6" strokeLinecap="round" />
      <text y="18" textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="34" fill={pal.ink}>{c.label}</text>
      {s.gust > 0.05 && [0, 1, 2].map((i) => (
        <path key={i} d={`M${toKite * (hw + 16)} ${-20 + i * 30} q${toKite * 40} ${-14} ${toKite * (80 + 40 * s.gust)} 0`}
          fill="none" stroke={pal.soft} strokeWidth="5" strokeLinecap="round" opacity={s.gust} />
      ))}
    </g>
  );
}

// ME holds the string up in her right hand; her left hand rests on her knee.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 110} ${headY + 96} ${HAND.x} ${HAND.y}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx={HAND.x} cy={HAND.y} r="9" fill={pal.white} stroke={pal.ink} strokeWidth="5" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}

export function SoundMind009({ cover = false }: { cover?: boolean }) {
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
          </g>
          <KiteString t={t} />
          <g filter="url(#rough)"><Kite t={t} /></g>
          {CLOUDS.map((c, i) => <CloudShape key={i} c={c} t={t} />)}
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r009-kite.wav')} />}
    </AbsoluteFill>
  );
}
