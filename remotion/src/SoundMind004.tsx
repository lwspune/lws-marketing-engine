// @soundmindwithshivani reel #4 ("my own page"). Shared look and pieces: MeStory.tsx. Timeline and rules: lib/sm004.ts.
// Vivid palette (founder, 2026-10-20). New tools on test: the strikes and the marker are hand-drawn annotations
// (@remotion/rough-notation, seeded), the doodles are real pen strokes (perfect-freehand), drawn point by point.
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Highlight, StrikeThrough } from '@remotion/rough-notation';
import { getStroke } from 'perfect-freehand';
import {
  DURATION, HOOK, LINE2, ME, GROUND_Y, PAGE, FONT, LINES, FINAL, DOODLES, SEED, writeAt, strikeAt, inkAlpha, doodleAt,
  doodlePoints, pageTurnAt, penAt, highlightAt, sunAt, smileAt, zoomAt, wordBox, type Doodle, type Line,
} from './lib/sm004.ts';
import { VIVID as pal } from './lib/smPalette.ts';
import { Filters, Grain, MeFigure, Outdoor, Words, useSoundMindFonts } from './MeStory.tsx';

const COVER_T = 3.4;                                   // two critic lines on the page, the first struck out
const FOCUS = { x: 470, y: 1120 };                     // the close-up frames ME and her notebook
const CRITIC = '#6B7280';                              // the critic's grey: 4.8:1 on the white page
const DOODLE_COLOURS = { heart: '#FF4D6D', star: '#F4A100', flower: '#3FA34D' };
const ROWS = [0, 1, 2, 3, 4].map(r => PAGE.y + 60 + r * 82);
const zoomCss = (z: number) => ({ transform: `scale(${z})`, transformOrigin: `${FOCUS.x}px ${FOCUS.y}px` });
// The first page lifts away up and to the left as it turns.
const turnSvg = (u: number) => `translate(${-720 * u} ${-260 * u}) rotate(${-18 * u} ${PAGE.x} ${PAGE.y})`;
const turnCss = (u: number): React.CSSProperties => ({ transform: `translate(${-720 * u}px, ${-260 * u}px) rotate(${-18 * u}deg)`, transformOrigin: `${PAGE.x}px ${PAGE.y}px`, opacity: 1 - u });

function Page({ shade = true }: { shade?: boolean }) {
  return (
    <g>
      {shade && <rect x={PAGE.x + 10} y={PAGE.y + 12} width={PAGE.w} height={PAGE.h} rx="24" fill={pal.ink} opacity="0.12" />}
      <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} rx="24" fill={pal.white} stroke={pal.ink} strokeWidth="5" />
      {ROWS.map(y => <path key={y} d={`M${PAGE.x + 24} ${y + 30} H${PAGE.x + PAGE.w - 24}`} stroke="#CDEFFF" strokeWidth="3" />)}
      {[0, 1, 2, 3, 4, 5].map(k => <circle key={k} cx={PAGE.x} cy={PAGE.y + 50 + k * 76} r="11" fill={pal.paper} stroke={pal.ink} strokeWidth="4" />)}
    </g>
  );
}

// The notebook stands on a little easel in the grass.
const Easel = () => (
  <g stroke={pal.ink} strokeWidth="6" strokeLinecap="round">
    <path d={`M${PAGE.x + 120} ${PAGE.y + PAGE.h - 10} L${PAGE.x + 90} ${GROUND_Y + 40}`} />
    <path d={`M${PAGE.x + PAGE.w - 120} ${PAGE.y + PAGE.h - 10} L${PAGE.x + PAGE.w - 90} ${GROUND_Y + 40}`} />
  </g>
);

// A doodle drawn with a real pen stroke: perfect-freehand turns the points drawn so far into an ink outline.
function strokePath(points: number[][]) {
  const o = getStroke(points, { size: 9, thinning: 0.55, smoothing: 0.5, streamline: 0.35, simulatePressure: true });
  if (o.length < 3) return '';
  const d = o.map(([x, y], i) => { const [nx, ny] = o[(i + 1) % o.length]; return `${(x + nx) / 2},${(y + ny) / 2}`; });
  return `M${o[0][0]},${o[0][1]} Q${d.join(' ')} Z`;
}
function DoodleMark({ d, t }: { d: Doodle; t: number }) {
  const u = doodleAt(d, t);
  if (u <= 0) return null;
  const pts = doodlePoints(d.shape), n = Math.max(2, Math.round(u * (pts.length - 1)) + 1);
  return <path d={strokePath(pts.slice(0, n).map(([x, y]) => [d.x + d.size * x, d.y + d.size * y]))} fill={DOODLE_COLOURS[d.shape]} />;
}

// The pencil, its tip on the pen's position.
function Pencil({ t }: { t: number }) {
  const { x, y } = penAt(t);
  return (
    <g transform={`translate(${x} ${y}) rotate(-40)`}>
      <path d="M0 0 L22 -9 L22 9 Z" fill="#F3D9A4" stroke={pal.ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M0 0 L8 -3.3 L8 3.3 Z" fill={pal.ink} />
      <rect x="22" y="-10" width="96" height="20" rx="4" fill={pal.sunFill} stroke={pal.ink} strokeWidth="4" />
      <rect x="118" y="-10" width="22" height="20" rx="8" fill={pal.cheek} stroke={pal.ink} strokeWidth="4" />
    </g>
  );
}

// ME sits beside her notebook: one hand on the page's edge, the other on her knee.
function Me({ t }: { t: number }) {
  const { x, headY, r } = ME;
  return (
    <MeFigure x={x} headY={headY} r={r} groundY={GROUND_Y} t={t} smile={smileAt(t)} p={pal}>
      <path d={`M${x + 52} ${headY + 100} Q${x + 120} ${headY + 120} ${PAGE.x - 6} ${headY + 96}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${x - 52} ${headY + 100} Q${x - 90} ${headY + 150} ${x - 70} ${GROUND_Y - 50}`} fill="none" stroke={pal.ink} strokeWidth="6" strokeLinecap="round" />
    </MeFigure>
  );
}

const wordStyle = (l: Line, colour: string): React.CSSProperties => {
  const b = wordBox(l);
  return { position: 'absolute', left: b.x0, top: b.y0, height: b.y1 - b.y0, display: 'flex', alignItems: 'center', whiteSpace: 'pre',
    font: `700 ${FONT}px/1 Kalam`, color: colour };
};
function CriticLine({ l, i, t }: { l: Line; i: number; t: number }) {
  const w = writeAt(l, t);
  if (w <= 0) return null;
  return (
    <div style={{ ...wordStyle(l, CRITIC), opacity: inkAlpha(l, t), clipPath: `inset(-20px ${(1 - w) * 100}% -20px -20px)` }}>
      <StrikeThrough progress={strikeAt(l, t)} seed={SEED + i} color={pal.ink} strokeWidth={5}>{l.text}</StrikeThrough>
    </div>
  );
}

export function SoundMind004({ cover = false }: { cover?: boolean }) {
  useSoundMindFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, z = zoomAt(t), sun = sunAt(t), turn = pageTurnAt(t);
  const first = LINES.slice(0, 5), second = LINES.slice(5), w = writeAt(FINAL, t);
  return (
    <AbsoluteFill style={{ background: pal.paper }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Filters />
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}>
          <Outdoor sun={sun} groundY={GROUND_Y} p={pal} />
          <rect width="1080" height="1920" fill={pal.mood} opacity={pal.moodOpacity * (1 - sun)} />
          <g filter="url(#rough)"><Easel /><Page /></g>
          {turn < 1 && <g transform={turnSvg(turn)} opacity={1 - turn} filter="url(#rough)"><Page shade={false} /></g>}
          <g filter="url(#rough)"><Me t={t} /></g>
          {DOODLES.map(d => <DoodleMark key={d.shape} d={d} t={t} />)}
        </g>
      </svg>
      {/* the words are HTML (rough-notation measures them), zoomed and turned with the page they sit on */}
      <div style={{ position: 'absolute', inset: 0, ...zoomCss(z) }}>
        {turn < 1 && <div style={{ position: 'absolute', inset: 0, ...turnCss(turn) }}>{first.map((l, i) => <CriticLine key={l.text} l={l} i={i} t={t} />)}</div>}
        {second.map((l, i) => <CriticLine key={l.text} l={l} i={i + 5} t={t} />)}
        {w > 0 && (
          <div style={{ ...wordStyle(FINAL, pal.ink), clipPath: `inset(-20px ${(1 - w) * 100}% -20px -20px)` }}>
            <Highlight progress={highlightAt(t)} seed={SEED + 9} color="#FFE066">{FINAL.text}</Highlight>
          </div>
        )}
      </div>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(${FOCUS.x} ${FOCUS.y}) scale(${z}) translate(${-FOCUS.x} ${-FOCUS.y})`}><Pencil t={t} /></g>
        <Grain />
      </svg>
      <Words t={t} hook={HOOK} line2={LINE2} duration={DURATION} p={pal} />
      {!cover && <Html5Audio src={staticFile('sm-r004-page.wav')} />}
    </AbsoluteFill>
  );
}
