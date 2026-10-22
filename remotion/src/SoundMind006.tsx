// @soundmindwithshivani reel #6 ("the mirror"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm006.ts.
// Vivid palette (framework S18). The cloth moves on its own once it leaves ME's hand (storybook style, like reel #4's pencil).
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, MIRROR, CLOTH_REST, NOTE, NOTE_FONT, NOTES, FLOWERS, noteAt, noteLines, clothAt,
  flowerAt, smileAt, sunAt, sparkleAt, zoomAt,
} from './lib/sm006.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, MeFigure, Outdoor, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 1.6;                                    // the first note stuck on the glass, the hook above
const FOCUS = { x: 500, y: 1100 };                      // the close-up frames ME and the mirror
const FRAME = '#FFC93C', GLASS = '#CDEFFF', CLOTH = '#FF8FA3';
const NOTE_COLOURS = ['#FFF1B5', '#FFD6E0', '#D8F5C9', '#E9D7FF'];
const { x: MX, y: MY, rx: RX, ry: RY } = MIRROR;

// The reflection: ME's head and shoulders inside the glass, her "ME" written back to front.
function Reflection({ smile }: { smile: number }) {
  const hy = MY - 40, r = 58;
  return (
    <g clipPath="url(#glass)">
      <path d={`M${MX - 120} ${MY + RY} Q${MX - 118} ${hy + 90} ${MX - 50} ${hy + 70} H${MX + 50} Q${MX + 118} ${hy + 90} ${MX + 120} ${MY + RY} Z`}
        fill={pal.white} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      <text x={MX} y={hy + 160} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="44" fill={pal.ink}
        transform={`translate(${2 * MX} 0) scale(-1 1)`}>ME</text>
      <circle cx={MX} cy={hy} r={r} fill={pal.white} stroke={pal.ink} strokeWidth="6" />
      <path d={`M${MX - 32} ${hy - 4} q12 10 24 0 M${MX + 8} ${hy - 4} q12 10 24 0`} fill="none" stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${MX - 16 - 6 * smile} ${hy + 22} Q${MX} ${hy + 30 + 16 * smile} ${MX + 16 + 6 * smile} ${hy + 22}`} fill={smile > 0.5 ? pal.white : 'none'} stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx={MX - 36} cy={hy + 18} r="9" fill={pal.cheek} opacity={0.35 + 0.4 * smile} />
      <circle cx={MX + 36} cy={hy + 18} r="9" fill={pal.cheek} opacity={0.35 + 0.4 * smile} />
    </g>
  );
}

function Mirror({ t }: { t: number }) {
  const sparkle = sparkleAt(t);
  return (
    <g>
      <defs><clipPath id="glass"><ellipse cx={MX} cy={MY} rx={RX} ry={RY} /></clipPath></defs>
      <g stroke={pal.ink} strokeWidth="7" strokeLinecap="round">
        <path d={`M${MX - 50} ${MY + RY} L${MX - 110} ${GROUND_Y + 30}`} />
        <path d={`M${MX + 50} ${MY + RY} L${MX + 110} ${GROUND_Y + 30}`} />
      </g>
      <ellipse cx={MX} cy={MY} rx={RX + 20} ry={RY + 20} fill={FRAME} stroke={pal.ink} strokeWidth="6" />
      <ellipse cx={MX} cy={MY} rx={RX} ry={RY} fill={GLASS} stroke={pal.ink} strokeWidth="5" />
      <Reflection smile={smileAt(t)} />
      <path d={`M${MX - 110} ${MY - 120} L${MX - 60} ${MY - 180} M${MX - 120} ${MY - 60} L${MX - 40} ${MY - 160}`} stroke={pal.white} strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      {sparkle > 0 && [[MX - 90, MY - 150, 1], [MX + 100, MY - 60, 0.8], [MX - 70, MY + 140, 0.7]].map(([x, y, k], i) => {
        const s = 26 * k * sparkle;
        return <path key={i} d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`} fill={pal.white} stroke={FRAME} strokeWidth="3" />;
      })}
    </g>
  );
}

function FrameFlowers({ t }: { t: number }) {
  return (
    <>
      {FLOWERS.map((f, i) => {
        const k = flowerAt(f, t);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${f.x} ${f.y}) scale(${k}) rotate(${40 * (1 - k)})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={16 * Math.cos((a * Math.PI) / 180)} cy={16 * Math.sin((a * Math.PI) / 180)} rx="15" ry="10"
                transform={`rotate(${a} ${16 * Math.cos((a * Math.PI) / 180)} ${16 * Math.sin((a * Math.PI) / 180)})`}
                fill={i % 2 ? pal.bloomPetal : '#FF9F1C'} stroke={pal.ink} strokeWidth="3" />
            ))}
            <circle r="9" fill={pal.bloomCenter} stroke={pal.ink} strokeWidth="3" />
          </g>
        );
      })}
    </>
  );
}

function Notes({ t }: { t: number }) {
  return (
    <>
      {NOTES.map((n, i) => {
        const s = noteAt(n, t);
        if (s.phase === 'wait' || s.phase === 'gone') return null;
        const lines = noteLines(n.label), top = -(lines.length - 1) * NOTE_FONT * 0.58;
        return (
          <g key={i} opacity={s.alpha} transform={`translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${s.scale})`}>
            <rect x={-NOTE.w / 2 + 6} y={-NOTE.h / 2 + 8} width={NOTE.w} height={NOTE.h} rx="6" fill={pal.ink} opacity="0.15" />
            <rect x={-NOTE.w / 2} y={-NOTE.h / 2} width={NOTE.w} height={NOTE.h} rx="6" fill={NOTE_COLOURS[i % NOTE_COLOURS.length]} stroke={pal.ink} strokeWidth="4" />
            <rect x={-40} y={-NOTE.h / 2 - 12} width="80" height="26" rx="4" fill={pal.white} opacity="0.75" stroke={pal.ink} strokeWidth="2" />
            {lines.map((l, k) => (
              <text key={l} y={top + k * NOTE_FONT * 1.16 + 12} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize={NOTE_FONT} fill={pal.ink}>{l}</text>
            ))}
          </g>
        );
      })}
    </>
  );
}

// The cloth: a soft folded square that wiggles as it wipes.
function Cloth({ t }: { t: number }) {
  const { x, y } = clothAt(t), resting = x === CLOTH_REST.x && y === CLOTH_REST.y;
  return (
    <g transform={`translate(${x} ${y}) rotate(${resting ? -10 : 8 * Math.sin(t * 18)})`}>
      <path d="M-38 -26 Q-10 -36 36 -28 Q44 0 34 26 Q0 34 -36 26 Q-46 0 -38 -26 Z" fill={CLOTH} stroke={pal.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M-20 -14 Q0 -4 18 -16 M-22 8 Q0 18 20 6" fill="none" stroke={pal.ink} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

// ME sits beside the mirror: her right hand holds the cloth when it rests, her left hand on her knee.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 110} ${headY + 120} ${CLOTH_REST.x - 20} ${CLOTH_REST.y - 6}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}

export function SoundMind006({ cover = false }: { cover?: boolean }) {
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
          <g filter="url(#rough)"><Mirror t={t} /><Me t={t} /></g>
          <FrameFlowers t={t} />
          <Notes t={t} />
          <Cloth t={t} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r006-mirror.wav')} />}
    </AbsoluteFill>
  );
}
