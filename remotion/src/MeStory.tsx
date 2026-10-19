// Shared pieces of Sound Mind's "ME" story reels (soundmind/brand.md → Reels): palette, fonts, filters, the outdoor
// scene, the ME figure, the little plant, word-labels and the on-screen text. Each reel adds its own metaphor.
import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { TEXT_BOXES, LABEL_H, textAlpha, type TextItem } from './lib/meStory.ts';

export const C = { paper: '#F6F1E7', ink: '#2F3A33', soft: '#5E6B62', sage: '#8FAE8B', leaf: '#DCE8D3', hill: '#C9D8C2',
  grass: '#B3CBA9', drop: '#E4EAEE', cloud: '#CDD3D8', warm: '#EBC097', white: '#FFFFFF', pot: '#D9C7AE' };

// Kalam and Lora ship in public/fonts (SIL Open Font Licence); hold the render until both are ready.
export function useSoundMindFonts() {
  const [handle] = useState(() => delayRender('sound mind fonts'));
  useEffect(() => {
    const faces = [new FontFace('Kalam', `url(${staticFile('fonts/Kalam-Bold.ttf')})`, { weight: '700' }),
      new FontFace('Lora', `url(${staticFile('fonts/Lora.ttf')})`, { weight: '400 700' })];
    // FontFaceSet.add is typed in lib "DOM.Iterable", which this project doesn't include.
    const fonts = document.fonts as unknown as { add(face: FontFace): void };
    Promise.all(faces.map((f) => f.load().then((l) => fonts.add(l)))).then(() => continueRender(handle));
  }, [handle]);
}

/** Paper grain (over everything) and the hand-drawn wobble (on line art). */
export const Filters = () => (
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.07 0" /></filter>
    <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="5" /></filter>
  </defs>
);
export const Grain = () => <rect width="1080" height="1920" filter="url(#grain)" />;

/** Cream sky, a sun that rises on the left as `sun` goes 0 → 1, sage hills, grass from `groundY`, little flowers. */
export function Outdoor({ sun, groundY }: { sun: number; groundY: number }) {
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.paper} /><stop offset="1" stopColor="#EEE6D4" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#sky)" />
      <rect width="1080" height="1920" fill={C.warm} opacity={0.18 * sun} />
      <g opacity={sun} transform={`translate(0 ${-560 * sun})`}>
        <circle cx="230" cy="1180" r="70" fill={C.warm} stroke={C.ink} strokeWidth="5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <path key={i} d={`M${230 + 95 * Math.cos(a)} ${1180 + 95 * Math.sin(a)} L${230 + 125 * Math.cos(a)} ${1180 + 125 * Math.sin(a)}`}
            stroke={C.ink} strokeWidth="5" strokeLinecap="round" />;
        })}
      </g>
      <path d="M0 1180 Q200 1100 380 1170 T760 1150 T1080 1170 V1400 H0 Z" fill={C.hill} />
      <path d={`M0 ${groundY + 10} Q270 ${groundY - 30} 540 ${groundY} T1080 ${groundY - 10} V1920 H0 Z`} fill={C.grass} />
      <Flowers />
    </>
  );
}

export const Flowers = ({ spots = [[140, 1420], [260, 1500], [820, 1440], [930, 1520], [700, 1600], [380, 1640], [80, 1700]] }: { spots?: number[][] }) => (
  <>
    {spots.map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={9 * Math.cos((a * Math.PI) / 180)} cy={9 * Math.sin((a * Math.PI) / 180)} r="6" fill={C.white} />)}
        <circle r="5" fill={C.warm} />
      </g>
    ))}
  </>
);

/**
 * The ME figure sitting cross-legged on `groundY`, breathing gently. `children` are its arms (each reel poses them),
 * drawn over the body and under the head. `smile` 0 → 1 widens the smile; `sleep` 0 → 1 lowers the eyelids into sleep.
 */
export function MeFigure({ x, headY, r, groundY, t, smile, sleep = 0, children }:
  { x: number; headY: number; r: number; groundY: number; t: number; smile: number; sleep?: number; children?: React.ReactNode }) {
  const breathe = 1 + 0.012 * Math.sin(t * 2.2);
  const eyes = sleep > 0
    ? `M${x - 34} ${headY + 2 * sleep - 4} q12 ${10 - 4 * sleep} 24 0 M${x + 10} ${headY + 2 * sleep - 4} q12 ${10 - 4 * sleep} 24 0`
    : `M${x - 34} ${headY - 4} q12 10 24 0 M${x + 10} ${headY - 4} q12 10 24 0`;
  return (
    <g transform={`translate(${x} ${headY}) scale(${breathe}) translate(${-x} ${-headY})`}>
      <path d={`M${x - 120} ${groundY - 6} Q${x - 130} ${groundY - 60} ${x - 40} ${groundY - 40} Q${x} ${groundY - 30} ${x + 40} ${groundY - 40} Q${x + 130} ${groundY - 60} ${x + 120} ${groundY - 6} Z`}
        fill={C.white} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d={`M${x - 70} ${groundY - 40} Q${x - 78} ${headY + 90} ${x - 40} ${headY + 62} H${x + 40} Q${x + 78} ${headY + 90} ${x + 70} ${groundY - 40} Z`}
        fill={C.white} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <text x={x} y={headY + 150} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="44" fill={C.ink}>ME</text>
      {children}
      <circle cx={x} cy={headY} r={r} fill={C.white} stroke={C.ink} strokeWidth="6" />
      <path d={eyes} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${x - 18 - 6 * smile} ${headY + 22} Q${x} ${headY + 32 + 16 * smile} ${x + 18 + 6 * smile} ${headY + 22}`} fill={smile > 0.5 ? C.white : 'none'} stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx={x - 40} cy={headY + 18} r="9" fill={C.warm} opacity={0.35 + 0.4 * smile} />
      <circle cx={x + 40} cy={headY + 18} r="9" fill={C.warm} opacity={0.35 + 0.4 * smile} />
    </g>
  );
}

/** A small potted plant; `scale` grows the stem and leaves from the pot's rim; `bloom` 0 → 1 opens a flower on top. */
export function Plant({ x, y, scale, bloom = 0, potScale = 1 }: { x: number; y: number; scale: number; bloom?: number; potScale?: number }) {
  return (
    <g transform={potScale === 1 ? undefined : `translate(${x} ${y}) scale(${potScale}) translate(${-x} ${-y})`}>
      <path d={`M${x - 40} ${y - 50} H${x + 40} L${x + 30} ${y} H${x - 30} Z`} fill={C.pot} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
      <g transform={`translate(${x} ${y - 50}) scale(${scale}) translate(${-x} ${-(y - 50)})`}>
        <path d={`M${x} ${y - 50} Q${x - 4} ${y - 100} ${x} ${y - 140}`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
        <path d={`M${x} ${y - 112} q-40 -6 -52 -34 q34 -4 52 30 Z`} fill={C.leaf} stroke={C.ink} strokeWidth="4" />
        <path d={`M${x} ${y - 128} q40 -10 52 -40 q-36 0 -52 36 Z`} fill={C.sage} stroke={C.ink} strokeWidth="4" />
        {bloom > 0 && (
          <g transform={`translate(${x} ${y - 146}) scale(${bloom})`}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx={14 * Math.cos((a * Math.PI) / 180)} cy={14 * Math.sin((a * Math.PI) / 180)} rx="13" ry="9"
                transform={`rotate(${a} ${14 * Math.cos((a * Math.PI) / 180)} ${14 * Math.sin((a * Math.PI) / 180)})`} fill={C.warm} stroke={C.ink} strokeWidth="3" />
            ))}
            <circle r="9" fill="#F3D9A4" stroke={C.ink} strokeWidth="3" />
          </g>
        )}
      </g>
    </g>
  );
}

/** A word-label pill centred on (0, 0): the rounded box and its text. */
export const LabelPill = ({ w, text, fill = C.drop }: { w: number; text: string; fill?: string }) => (
  <>
    <rect x={-w / 2} y={-LABEL_H / 2} width={w} height={LABEL_H} rx={LABEL_H / 2} fill={fill} stroke={C.ink} strokeWidth="4" />
    <text y="12" textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="34" fill={C.ink}>{text}</text>
  </>
);

const box = (id: string) => TEXT_BOXES.find((b) => b.id === id)!;

/** The hook (top), the second line (on a card near the bottom) and the account handle. */
export function Words({ t, hook, line2, duration, ink = C.ink }: { t: number; hook: TextItem; line2: TextItem; duration: number; ink?: string }) {
  const h = box('hook'), l = box('line2'), handle = box('handle');
  const a1 = textAlpha(hook, t, duration), a2 = textAlpha(line2, t, duration);
  const text: React.CSSProperties = { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.ink };
  return (
    <>
      {a1 > 0 && <div style={{ ...text, color: ink, left: h.x, top: h.y, width: h.w, height: h.h, opacity: a1, font: '700 72px/1.18 Kalam' }}>{hook.text}</div>}
      {a2 > 0 && (
        <div style={{ ...text, left: l.x, top: l.y, width: l.w, height: l.h, opacity: a2, font: '700 56px/1.2 Kalam',
          background: 'rgba(246,241,231,0.92)', border: `4px solid ${C.sage}`, borderRadius: 36, padding: '0 30px', boxSizing: 'border-box' }}>{line2.text}</div>
      )}
      <div style={{ ...text, color: ink, left: handle.x, top: handle.y, width: handle.w, height: handle.h, font: '500 30px Lora', opacity: 0.8 }}>@soundmindwithshivani</div>
    </>
  );
}
