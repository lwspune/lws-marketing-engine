// @soundmindwithshivani reel #1 ("the umbrella"). Sound Mind's look (soundmind/brand.md): cream paper, green-grey ink,
// sage accent, Kalam headlines, simple line art with a slight hand-drawn wobble. Timeline and rules: lib/sm001.ts.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  HOOK, LINE2, UMBRELLA, ME, GROUND_Y, CLOUD_Y, DROPS, LABEL_H, labelWidth, dropAt, zoomAt, sunAt,
  smileAt, plantAt, cloudX, DURATION,
} from './lib/sm001.ts';
import { C, Filters, Grain, LabelPill, MeFigure, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 5.6;

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

// ME holds the umbrella's shaft in her right hand; the left rests on her knee.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 70} ${headY + 120} ${UMBRELLA.cx - 4} ${headY + 112}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx={UMBRELLA.cx - 2} cy={headY + 110} r="14" fill={C.white} stroke={C.ink} strokeWidth="5" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
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
              <LabelPill w={w} text={d.label} />
            </g>
          </g>
        );
      })}
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
          <Filters />
          <Outdoor sun={sunAt(t)} groundY={GROUND_Y} />
          <g filter="url(#rough)">
            <Cloud t={t} />
            <Plant x={330} y={GROUND_Y + 4} scale={0.4 + plantAt(t)} />
            <Me t={t} />
            <Umbrella />
          </g>
          <Drops t={t} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} />
      {!cover && <Html5Audio src={staticFile('sm-r001-umbrella.wav')} />}
    </AbsoluteFill>
  );
}
