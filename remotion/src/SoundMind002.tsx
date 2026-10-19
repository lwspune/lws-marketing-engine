// @soundmindwithshivani reel #2 ("the window"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm002.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { DURATION, HOOK, LINE2, GLASS, ME, FLOOR_Y, THOUGHTS, thoughtAt, zoomAt, nightAt, sleepAt, smileAt, sipAt } from './lib/sm002.ts';
import { labelWidth } from './lib/meStory.ts';
import { C, Filters, Grain, LabelPill, MeFigure, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.25;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
const FRAME = 22, SILL_Y = GLASS.y + GLASS.h + FRAME;

function Room({ night }: { night: number }) {
  return (
    <>
      <rect width="1080" height="1920" fill="#F3EADB" />
      <path d={`M0 ${FLOOR_Y} H1080 V1920 H0 Z`} fill="#E2D3BC" />
      {[1420, 1530, 1660, 1800].map((y) => <path key={y} d={`M0 ${y} H1080`} stroke="#CDB998" strokeWidth="4" />)}
      <ellipse cx={ME.x + 40} cy={FLOOR_Y + 40} rx="260" ry="46" fill={C.leaf} opacity="0.9" />
      <rect width="1080" height="1920" fill="#3A3346" opacity={0.14 * night} />
      {/* a warm lamp-glow around ME as the room darkens */}
      <defs>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.warm} stopOpacity="0.55" /><stop offset="1" stopColor={C.warm} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={ME.x} cy={ME.headY + 60} r="330" fill="url(#glow)" opacity={night} />
    </>
  );
}

/** The sky seen through the pane: dusk turning to night, with the moon and stars coming out. */
function Sky({ night, t }: { night: number; t: number }) {
  return (
    <>
      <defs>
        <linearGradient id="pane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix('#C8D3E3', '#26314D', night)} /><stop offset="1" stopColor={mix('#EBD7C5', '#4A4F72', night)} />
        </linearGradient>
        <clipPath id="glass"><rect x={GLASS.x} y={GLASS.y} width={GLASS.w} height={GLASS.h} /></clipPath>
      </defs>
      <rect x={GLASS.x} y={GLASS.y} width={GLASS.w} height={GLASS.h} fill="url(#pane)" />
      <g opacity={night}>
        <circle cx={GLASS.x + GLASS.w - 110} cy={GLASS.y + 110} r="52" fill="#F4EBC8" />
        <circle cx={GLASS.x + GLASS.w - 88} cy={GLASS.y + 96} r="46" fill={mix('#C8D3E3', '#26314D', night)} />
        {[[520, 640], [600, 720], [700, 610], [560, 900], [880, 860], [790, 980], [640, 1050]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4 + 2 * Math.sin(t * 3 + i)} fill="#F4EBC8" />
        ))}
      </g>
    </>
  );
}

function Thoughts({ t }: { t: number }) {
  return (
    <g clipPath="url(#glass)">
      {THOUGHTS.map((th, i) => {
        const p = thoughtAt(th, t);
        if (p.phase === 'wait' || p.phase === 'gone' || p.alpha <= 0) return null;
        const w = labelWidth(th.label);
        return (
          <g key={i} opacity={p.alpha} transform={`translate(${p.x} ${p.y}) scale(${p.scale * p.sx} ${p.scale * p.sy})`}>
            <LabelPill w={w} text={th.label} fill="#E6E2EF" />
            {p.phase === 'hit' && [-1, 1].map((s) => (
              <path key={s} d={`M${s * (w / 2 + 10)} -26 l${s * 18} -10 M${s * (w / 2 + 14)} 0 l${s * 22} 0 M${s * (w / 2 + 10)} 26 l${s * 18} 10`}
                stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** One bar near the top (clear glass where the thoughts land), a soft reflection, the frame, the sill and the curtains. */
function WindowFront() {
  const { x, y, w, h } = GLASS;
  return (
    <>
      <path d={`M${x + 40} ${y + 60} L${x + 120} ${y + 20} M${x + 40} ${y + 120} L${x + 190} ${y + 40}`} stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
      <path d={`M${x} ${y + h * 0.16} H${x + w}`} stroke="#D9C7AE" strokeWidth="14" />
      <path d={`M${x} ${y + h * 0.16} H${x + w}`} stroke={C.ink} strokeWidth="4" opacity="0.6" />
      <path d={`M${x - FRAME} ${y - FRAME} H${x + w + FRAME} V${y + h + FRAME} H${x - FRAME} Z M${x} ${y} V${y + h} H${x + w} V${y} Z`}
        fill="#D9C7AE" fillRule="evenodd" stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <rect x={x - FRAME - 26} y={SILL_Y} width={w + 2 * FRAME + 52} height="30" rx="6" fill="#D9C7AE" stroke={C.ink} strokeWidth="6" />
      <path d={`M${x - FRAME - 40} ${y - 50} Q${x - 10} ${y + 300} ${x - FRAME - 10} ${SILL_Y + 20} L${x - FRAME - 70} ${SILL_Y + 20} Q${x - FRAME - 80} ${y + 300} ${x - FRAME - 70} ${y - 50} Z`}
        fill={C.sage} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d={`M${x + w + FRAME + 40} ${y - 50} Q${x + w + 10} ${y + 300} ${x + w + FRAME + 10} ${SILL_Y + 20} L${x + w + FRAME + 70} ${SILL_Y + 20} Q${x + w + FRAME + 80} ${y + 300} ${x + w + FRAME + 70} ${y - 50} Z`}
        fill={C.sage} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d={`M${x - FRAME - 100} ${y - 50} H${x + w + FRAME + 100}`} stroke={C.ink} strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

// ME holds her tea in both hands; during the close-up she lifts it to her lips.
function cupAt(t: number) {
  return { x: ME.x + 6, y: ME.headY + 92 - 66 * sipAt(t) };
}
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME, cup = cupAt(t);
  return (
    <>
      <ellipse cx={x} cy={FLOOR_Y + 2} rx="150" ry="30" fill={C.sage} stroke={C.ink} strokeWidth="6" />
      <MeFigure x={x} headY={headY} r={r} groundY={FLOOR_Y} t={t} smile={smileAt(t)} sleep={sleepAt(t)}>
        <path d={`M${x - 52} ${headY + 100} Q${x - 70} ${(headY + 150 + cup.y) / 2} ${cup.x - 40} ${cup.y + 10}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
        <path d={`M${x + 52} ${headY + 100} Q${x + 74} ${(headY + 150 + cup.y) / 2} ${cup.x + 40} ${cup.y + 10}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      </MeFigure>
    </>
  );
}
function Cup({ t }: { t: number }) {
  const c = cupAt(t), steam = 1 - sleepAt(t);
  return (
    <g>
      {[-12, 6].map((dx, i) => (
        <path key={i} d={`M${c.x + dx} ${c.y - 34} q-10 -16 0 -32 q10 -16 0 -32`} fill="none" stroke={C.soft} strokeWidth="4" strokeLinecap="round"
          opacity={steam * (0.35 + 0.25 * Math.sin(t * 2.5 + i * 2))} />
      ))}
      <path d={`M${c.x + 30} ${c.y - 14} q26 0 26 18 q0 18 -26 18`} fill="none" stroke={C.ink} strokeWidth="6" />
      <path d={`M${c.x - 32} ${c.y - 28} H${c.x + 32} L${c.x + 26} ${c.y + 28} H${c.x - 26} Z`} fill={C.warm} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <circle cx={c.x - 38} cy={c.y + 8} r="13" fill={C.white} stroke={C.ink} strokeWidth="5" />
      <circle cx={c.x + 38} cy={c.y + 8} r="13" fill={C.white} stroke={C.ink} strokeWidth="5" />
    </g>
  );
}
function Zzz({ t }: { t: number }) {
  const s = sleepAt(t);
  if (s <= 0) return null;
  return (
    <g fontFamily="Kalam" fontWeight="700" fill={C.ink}>
      {[0, 1, 2].map((i) => {
        const k = (t * 0.5 + i / 3) % 1;
        return <text key={i} x={ME.x + 70 + 40 * k} y={ME.headY - 80 - 120 * k} fontSize={30 + 18 * k} opacity={s * (1 - k)}>z</text>;
      })}
    </g>
  );
}

export function SoundMind002({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t), night = nightAt(t);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${ME.x} ${ME.headY}) scale(${z}) translate(${-ME.x} ${-ME.headY})`}>
          <Room night={night} />
          <Sky night={night} t={t} />
          <Thoughts t={t} />
          <g filter="url(#rough)">
            <WindowFront />
            <Plant x={430} y={FLOOR_Y + 4} scale={0.9} />
            <Me t={t} />
            <Cup t={t} />
          </g>
          <Zzz t={t} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} />
      {!cover && <Html5Audio src={staticFile('sm-r002-window.wav')} />}
    </AbsoluteFill>
  );
}
