// @soundmindwithshivani reel #5 ("the hammock"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm005.ts.
// Vivid palette (framework S18). ME lies down here, so she is drawn in this file rather than with the sitting MeFigure.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  DURATION, HOOK, LINE2, GROUND_Y, TREES, ANCHORS, HAMMOCK, ME, BATTERY, PLANT, PRESSURES, pressureAt, ropeTo, swayAt,
  batteryAt, batteryColour, wakeAt, smileAt, sunAt, bloomAt, zoomAt,
} from './lib/sm005.ts';
import { labelWidth } from './lib/meStory.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, LabelPill, Outdoor, Plant, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.95;                                   // the second pressure at the height of its tug, the battery red
const FOCUS = { x: 470, y: 1060 };                      // the close-up frames ME's sleeping face
const BARK = '#A0643C', CLOTH = '#2EC4B6', STRIPE = '#FFD23F', PILLOW = '#FFF1B5';
const CHARGE = { low: '#FF4D6D', mid: '#F4A100', full: '#3FA34D' };

function Tree({ x }: { x: number }) {
  return (
    <g>
      <path d={`M${x - 24} ${GROUND_Y + 20} L${x - 18} 700 H${x + 18} L${x + 24} ${GROUND_Y + 20} Z`} fill={BARK} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      {[[-70, 690, 100], [60, 680, 110], [0, 600, 120], [-10, 740, 90]].map(([dx, y, r], i) => (
        <circle key={i} cx={x + dx} cy={y} r={r} fill={i % 2 ? pal.grass : pal.leaf} stroke={pal.ink} strokeWidth="6" />
      ))}
    </g>
  );
}

// The cloth: a crescent hanging between its ends; ME's body sits in it, her head on a pillow at the left end.
// The front of the cloth rises higher than its lowest line, so ME's body lies inside it.
const LIP = 2 * HAMMOCK.sag - 120;
const edge = (u: number) => ({ x: HAMMOCK.x0 + (HAMMOCK.x1 - HAMMOCK.x0) * u, y: HAMMOCK.y + 2 * LIP * u * (1 - u) });
function Hammock({ t }: { t: number }) {
  const { x0, x1, y, sag } = HAMMOCK, mid = (x0 + x1) / 2, wake = wakeAt(t), smile = smileAt(t);
  const hx = ME.x, hy = ME.headY, r = ME.r;
  const breathe = 3 * Math.sin(t * 2.2);
  const eyes = wake < 0.5
    ? <path d={`M${hx - 32} ${hy - 2} q10 8 20 0 M${hx + 8} ${hy - 2} q10 8 20 0`} fill="none" stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
    : <><circle cx={hx - 22} cy={hy - 4} r="6" fill={pal.ink} /><circle cx={hx + 18} cy={hy - 4} r="6" fill={pal.ink} /></>;
  return (
    <g>
      {/* body, lying along the cloth, rising and falling with her breath */}
      <path d={`M${hx + 20} ${hy + 40} Q${hx + 60} ${hy - 4 - breathe} ${hx + 130} ${hy + 10 - breathe} Q${mid + 20} ${hy + 46 - breathe} ${x1 - 70} ${hy - 8} Q${x1 - 24} ${hy - 18} ${x1 - 20} ${hy + 30} Q${mid} ${y + 2 * sag - 60} ${hx + 20} ${hy + 40} Z`}
        fill={pal.white} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      <ellipse cx={x1 - 48} cy={hy - 22} rx="18" ry="24" fill={pal.white} stroke={pal.ink} strokeWidth="5" />
      <ellipse cx={x1 - 20} cy={hy - 12} rx="16" ry="22" fill={pal.white} stroke={pal.ink} strokeWidth="5" />
      <text x={mid + 10} y={hy + 70} textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="44" fill={pal.ink}>ME</text>
      <path d={`M${x0} ${y} Q${mid} ${y + LIP} ${x1} ${y} Q${mid} ${y + sag * 2 + 70} ${x0} ${y} Z`} fill={CLOTH} stroke={pal.ink} strokeWidth="6" strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((u) => { const e = edge(u); return <path key={u} d={`M${e.x} ${e.y + 4} L${e.x} ${e.y + 50 + 40 * Math.sin(Math.PI * u)}`} stroke={STRIPE} strokeWidth="10" strokeLinecap="round" />; })}
      <ellipse cx={hx - 20} cy={hy + 34} rx="70" ry="26" fill={PILLOW} stroke={pal.ink} strokeWidth="5" />
      <circle cx={hx} cy={hy} r={r} fill={pal.white} stroke={pal.ink} strokeWidth="6" />
      {eyes}
      <path d={`M${hx - 16 - 6 * smile} ${hy + 22} Q${hx} ${hy + 30 + 16 * smile} ${hx + 16 + 6 * smile} ${hy + 22}`} fill={smile > 0.5 ? pal.white : 'none'} stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hx - 36} cy={hy + 18} r="9" fill={pal.cheek} opacity={0.35 + 0.4 * smile} />
      <circle cx={hx + 36} cy={hy + 18} r="9" fill={pal.cheek} opacity={0.35 + 0.4 * smile} />
    </g>
  );
}

// Little Zs drift up from ME while she sleeps.
function Zs({ t, sway }: { t: number; sway: number }) {
  const awake = wakeAt(t);
  if (awake >= 1) return null;
  return (
    <>
      {[0, 0.66, 1.33].map((o) => {
        const u = ((t + o) % 2) / 2;
        return <text key={o} x={ME.x + 40 + 50 * u + sway} y={ME.headY - 80 - 90 * u} fontFamily="Kalam" fontWeight="700" fontSize={30 + 16 * u}
          fill={pal.soft} opacity={(1 - awake) * Math.sin(Math.PI * u)}>Z</text>;
      })}
    </>
  );
}

function Battery({ t }: { t: number }) {
  const { x, y, w, h } = BATTERY, level = batteryAt(t), full = level >= 1;
  const charging = !full && PRESSURES.some((p) => pressureAt(p, t).phase === 'leave');
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="18" fill={pal.white} stroke={pal.ink} strokeWidth="7" />
      <rect x={x + w} y={y + h / 2 - 20} width="16" height="40" rx="5" fill={pal.ink} />
      <rect x={x + 12} y={y + 12} width={(w - 24) * level} height={h - 24} rx="10" fill={CHARGE[batteryColour(level)]} />
      {charging && <path d={`M${x + w / 2 + 8} ${y + 18} L${x + w / 2 - 18} ${y + h / 2 + 4} H${x + w / 2 + 2} L${x + w / 2 - 8} ${y + h - 18} L${x + w / 2 + 20} ${y + h / 2 - 6} H${x + w / 2} Z`}
        fill={pal.white} stroke={pal.ink} strokeWidth="4" strokeLinejoin="round" />}
      {full && [0, 1, 2, 3, 4, 5].map((k) => {
        const a = -Math.PI / 2 + (k - 2.5) * 0.5, s = 1 + 0.08 * Math.sin(t * 6);
        const cx = x + w / 2, cy = y + h / 2;
        return <path key={k} d={`M${cx + 140 * s * Math.cos(a)} ${cy + 90 * s * Math.sin(a)} L${cx + 170 * s * Math.cos(a)} ${cy + 112 * s * Math.sin(a)}`}
          stroke={STRIPE} strokeWidth="7" strokeLinecap="round" />;
      })}
    </g>
  );
}

function Pressures({ t, sway }: { t: number; sway: number }) {
  return (
    <>
      {PRESSURES.map((p, i) => {
        const s = pressureAt(p, t);
        if (s.phase === 'wait' || s.phase === 'gone') return null;
        const end = s.x - p.side * (labelWidth(p.label) / 2 - 10), to = ropeTo(p.side), tx = to.x + sway;
        const slack = 40 * (1 - s.pull);                               // the rope hangs loose, and goes taut on a tug
        return (
          <g key={i} opacity={s.alpha}>
            {s.phase !== 'leave' && <path d={`M${end} ${s.y + 20} Q${(end + tx) / 2} ${(s.y + to.y) / 2 + slack} ${tx} ${to.y}`} fill="none" stroke={pal.ink} strokeWidth="4" />}
            <g transform={`translate(${s.x} ${s.y}) rotate(${p.side * 4 * s.pull})`}><LabelPill w={labelWidth(p.label)} text={p.label} fill={pal.pills[i % pal.pills.length]} /></g>
          </g>
        );
      })}
    </>
  );
}

export function SoundMind005({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t), sun = sunAt(t), sway = swayAt(t);
  const ends = { l: { x: HAMMOCK.x0 + sway, y: HAMMOCK.y }, r: { x: HAMMOCK.x1 + sway, y: HAMMOCK.y } };
  return (
    <AbsoluteFill style={{ background: pal.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          <Outdoor sun={sun} groundY={GROUND_Y} p={pal} />
          <rect width="1080" height="1920" fill={pal.mood} opacity={pal.moodOpacity * (1 - sun)} />
          <g filter="url(#rough)">
            {TREES.map((x) => <Tree key={x} x={x} />)}
            <Plant x={PLANT.x} y={PLANT.y} scale={0.75 + 0.25 * bloomAt(t)} bloom={bloomAt(t)} potScale={1.3} p={pal} />
            <path d={`M${ANCHORS.left.x} ${ANCHORS.left.y} L${ends.l.x} ${ends.l.y} M${ANCHORS.right.x} ${ANCHORS.right.y} L${ends.r.x} ${ends.r.y}`}
              stroke={pal.ink} strokeWidth="5" strokeLinecap="round" />
            <g transform={`translate(${sway} 0)`}><Hammock t={t} /></g>
            <Battery t={t} />
          </g>
          <Zs t={t} sway={sway} />
          <Pressures t={t} sway={sway} />
        </g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r005-hammock.wav')} />}
    </AbsoluteFill>
  );
}
