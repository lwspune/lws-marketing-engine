// @soundmindwithshivani reel #1 ("the umbrella"). Sound Mind's look (soundmind/brand.md): cream paper, green-grey ink,
// sage accent, Kalam headlines, simple line art with a slight hand-drawn wobble. Timeline and rules: lib/sm001.ts.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  HOOK, LINE2, UMBRELLA, ME, GROUND_Y, CLOUD_Y, DROPS, LABEL_H, labelWidth, dropAt, textAlpha, zoomAt, sunAt,
  smileAt, plantAt, cloudX, TEXT_BOXES,
} from './lib/sm001.ts';

const C = { paper: '#F6F1E7', ink: '#2F3A33', soft: '#5E6B62', sage: '#8FAE8B', leaf: '#DCE8D3', hill: '#C9D8C2',
  grass: '#B3CBA9', drop: '#E4EAEE', cloud: '#CDD3D8', warm: '#EBC097', white: '#FFFFFF' };
const COVER_T = 5.6;

// Kalam and Lora ship in public/fonts (SIL Open Font Licence); hold the render until both are ready.
function useSoundMindFonts() {
  const [handle] = useState(() => delayRender('sound mind fonts'));
  useEffect(() => {
    const faces = [new FontFace('Kalam', `url(${staticFile('fonts/Kalam-Bold.ttf')})`, { weight: '700' }),
      new FontFace('Lora', `url(${staticFile('fonts/Lora.ttf')})`, { weight: '400 700' })];
    // FontFaceSet.add is typed in lib "DOM.Iterable", which this project doesn't include.
    const fonts = document.fonts as unknown as { add(face: FontFace): void };
    Promise.all(faces.map((f) => f.load().then((l) => fonts.add(l)))).then(() => continueRender(handle));
  }, [handle]);
}

const box = (id: string) => TEXT_BOXES.find((b) => b.id === id)!;

function Sky({ t }: { t: number }) {
  const sun = sunAt(t);
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.paper} /><stop offset="1" stopColor="#EEE6D4" />
        </linearGradient>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.07 0" /></filter>
        <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="5" /></filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#sky)" />
      <rect width="1080" height="1920" fill={C.warm} opacity={0.18 * sun} />
      {/* The sun rises in the open sky on the left, where the cloud was, not behind the umbrella. */}
      <g opacity={sun} transform={`translate(0 ${-560 * sun})`}>
        <circle cx="230" cy="1180" r="70" fill={C.warm} stroke={C.ink} strokeWidth="5" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <path key={i} d={`M${230 + 95 * Math.cos(a)} ${1180 + 95 * Math.sin(a)} L${230 + 125 * Math.cos(a)} ${1180 + 125 * Math.sin(a)}`}
            stroke={C.ink} strokeWidth="5" strokeLinecap="round" />;
        })}
      </g>
      <path d="M0 1180 Q200 1100 380 1170 T760 1150 T1080 1170 V1400 H0 Z" fill={C.hill} />
      <path d={`M0 ${GROUND_Y + 10} Q270 ${GROUND_Y - 30} 540 ${GROUND_Y} T1080 ${GROUND_Y - 10} V1920 H0 Z`} fill={C.grass} />
      {[[140, 1420], [260, 1500], [820, 1440], [930, 1520], [700, 1600], [380, 1640], [80, 1700]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={9 * Math.cos((a * Math.PI) / 180)} cy={9 * Math.sin((a * Math.PI) / 180)} r="6" fill={C.white} />)}
          <circle r="5" fill={C.warm} />
        </g>
      ))}
    </>
  );
}

function Cloud({ t }: { t: number }) {
  const x = cloudX(t), raining = t < 22.5;
  return (
    <g transform={`translate(${x} ${CLOUD_Y})`}>
      <path d="M-210 40 Q-240 -10 -180 -30 Q-170 -95 -90 -85 Q-50 -140 20 -110 Q90 -150 140 -80 Q220 -90 220 -10 Q260 30 200 55 Z"
        fill={C.cloud} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      {raining && [-150, -70, 10, 90, 160].map((dx, i) => {
        const k = ((t * 1.6 + i * 0.37) % 1);
        return <path key={i} d={`M${dx} ${70 + k * 120} l-6 26`} stroke={C.soft} strokeWidth="4" strokeLinecap="round" opacity={0.5 * (1 - k)} />;
      })}
    </g>
  );
}

function Umbrella() {
  const { cx, cy, rx, ry } = UMBRELLA, n = 6, w = (2 * rx) / n;
  // Dome from the left rim over to the right rim, then scalloped edges back along the bottom.
  const canopy = `M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
  const back = Array.from({ length: n }, (_, i) => `Q${cx + rx - w * (i + 0.5)} ${cy + 34} ${cx + rx - w * (i + 1)} ${cy}`).join(' ');
  return (
    <g>
      <path d={`M${cx} ${cy - ry} V1255 q0 40 -36 40 q-30 0 -30 -28`} fill="none" stroke={C.ink} strokeWidth="9" strokeLinecap="round" />
      <path d={`${canopy} ${back} Z`} fill={C.sage} stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
      {[-2, -1, 0, 1, 2].map((k) => (
        <path key={k} d={`M${cx} ${cy - ry} Q${cx + k * w * 0.62} ${cy - ry * 0.55} ${cx + k * w * 1.0} ${cy + 20}`} fill="none" stroke={C.ink} strokeWidth="4" opacity="0.55" />
      ))}
      <path d={`M${cx - rx * 0.62} ${cy - ry * 0.62} Q${cx - rx * 0.4} ${cy - ry * 0.9} ${cx - rx * 0.1} ${cy - ry * 0.98}`} fill="none" stroke={C.leaf} strokeWidth="10" strokeLinecap="round" opacity="0.9" />
      <circle cx={cx} cy={cy - ry - 10} r="12" fill={C.ink} />
    </g>
  );
}

function Me({ t }: { t: number }) {
  const { x, headY, r } = ME, smile = smileAt(t), breathe = 1 + 0.012 * Math.sin(t * 2.2);
  return (
    <g transform={`translate(${x} ${headY}) scale(${breathe}) translate(${-x} ${-headY})`}>
      <path d={`M${x - 120} ${GROUND_Y - 6} Q${x - 130} ${GROUND_Y - 60} ${x - 40} ${GROUND_Y - 40} Q${x} ${GROUND_Y - 30} ${x + 40} ${GROUND_Y - 40} Q${x + 130} ${GROUND_Y - 60} ${x + 120} ${GROUND_Y - 6} Z`}
        fill={C.white} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <path d={`M${x - 70} ${GROUND_Y - 40} Q${x - 78} ${headY + 90} ${x - 40} ${headY + 62} H${x + 40} Q${x + 78} ${headY + 90} ${x + 70} ${GROUND_Y - 40} Z`}
        fill={C.white} stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
      <text x={x} y={headY + 150} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="44" fill={C.ink}>ME</text>
      <path d={`M${x + 52} ${headY + 100} Q${x + 70} ${headY + 120} ${UMBRELLA.cx - 4} ${headY + 112}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx={UMBRELLA.cx - 2} cy={headY + 110} r="14" fill={C.white} stroke={C.ink} strokeWidth="5" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx={x} cy={headY} r={r} fill={C.white} stroke={C.ink} strokeWidth="6" />
      <path d={`M${x - 34} ${headY - 4} q12 10 24 0 M${x + 10} ${headY - 4} q12 10 24 0`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <path d={`M${x - 18 - 6 * smile} ${headY + 22} Q${x} ${headY + 32 + 16 * smile} ${x + 18 + 6 * smile} ${headY + 22}`} fill={smile > 0.5 ? C.white : 'none'} stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx={x - 40} cy={headY + 18} r="9" fill={C.warm} opacity={0.35 + 0.4 * smile} />
      <circle cx={x + 40} cy={headY + 18} r="9" fill={C.warm} opacity={0.35 + 0.4 * smile} />
    </g>
  );
}

function Plant({ t }: { t: number }) {
  const g = 0.4 + plantAt(t), x = 330, y = GROUND_Y + 4;
  return (
    <g>
      <path d={`M${x - 40} ${y - 50} H${x + 40} L${x + 30} ${y} H${x - 30} Z`} fill="#D9C7AE" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
      <g transform={`translate(${x} ${y - 50}) scale(${g}) translate(${-x} ${-(y - 50)})`}>
        <path d={`M${x} ${y - 50} Q${x - 4} ${y - 100} ${x} ${y - 140}`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
        <path d={`M${x} ${y - 112} q-40 -6 -52 -34 q34 -4 52 30 Z`} fill={C.leaf} stroke={C.ink} strokeWidth="4" />
        <path d={`M${x} ${y - 128} q40 -10 52 -40 q-36 0 -52 36 Z`} fill={C.sage} stroke={C.ink} strokeWidth="4" />
      </g>
    </g>
  );
}

function Drops({ t }: { t: number }) {
  return (
    <>
      {DROPS.map((d, i) => {
        const s = dropAt(d, t);
        if (s.phase === 'wait' || s.phase === 'gone' || s.alpha <= 0) return null;
        const w = labelWidth(d.label), landed = s.phase === 'drop' && s.y >= GROUND_Y - LABEL_H / 2 + 9;
        return (
          <g key={i} opacity={s.alpha}>
            {landed && <ellipse cx={s.x} cy={GROUND_Y + 30} rx={w * 0.45} ry="14" fill={C.drop} stroke={C.soft} strokeWidth="3" opacity="0.8" />}
            <g transform={`translate(${s.x} ${s.y}) rotate(${(s.rot * 180) / Math.PI})`}>
              <path d={`M-12 ${-LABEL_H / 2 + 2} Q0 ${-LABEL_H / 2 - 26} 12 ${-LABEL_H / 2 + 2}`} fill={C.drop} stroke={C.ink} strokeWidth="4" />
              <rect x={-w / 2} y={-LABEL_H / 2} width={w} height={LABEL_H} rx={LABEL_H / 2} fill={C.drop} stroke={C.ink} strokeWidth="4" />
              <text y="12" textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="34" fill={C.ink}>{d.label}</text>
            </g>
          </g>
        );
      })}
    </>
  );
}

function Words({ t }: { t: number }) {
  const hook = box('hook'), line2 = box('line2'), handle = box('handle');
  const a1 = textAlpha(HOOK, t), a2 = textAlpha(LINE2, t);
  const text: React.CSSProperties = { position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.ink };
  return (
    <>
      {a1 > 0 && <div style={{ ...text, left: hook.x, top: hook.y, width: hook.w, height: hook.h, opacity: a1, font: '700 72px/1.18 Kalam' }}>{HOOK.text}</div>}
      {a2 > 0 && (
        <div style={{ ...text, left: line2.x, top: line2.y, width: line2.w, height: line2.h, opacity: a2, font: '700 56px/1.2 Kalam',
          background: 'rgba(246,241,231,0.92)', border: `4px solid ${C.sage}`, borderRadius: 36, padding: '0 30px', boxSizing: 'border-box' }}>{LINE2.text}</div>
      )}
      <div style={{ ...text, left: handle.x, top: handle.y, width: handle.w, height: handle.h, font: '500 30px Lora', color: C.ink, opacity: 0.8 }}>@soundmindwithshivani</div>
    </>
  );
}

export function SoundMind001({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${ME.x} ${ME.headY}) scale(${z}) translate(${-ME.x} ${-ME.headY})`}>
          <Sky t={t} />
          <g filter="url(#rough)">
            <Cloud t={t} />
            <Plant t={t} />
            <Me t={t} />
            <Umbrella />
          </g>
          <Drops t={t} />
        </g>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
      <Words t={t} />
      {!cover && <Html5Audio src={staticFile('sm-r001-umbrella.wav')} />}
    </AbsoluteFill>
  );
}
