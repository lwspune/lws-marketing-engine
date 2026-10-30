// @lws.pune · the poem reel: four red-graded photos of Indian soldiers, timed to @filmy.sketches' recitation (whose audio
// is added in the Instagram app). The timeline, the photos and their licences are in lib/poem001.ts. Silent MP4.
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { SCENES, COVER_T, CREDIT, sceneAlphas, pushAt, creditAt, embersAt, streaksAt } from './lib/poem001.ts';

const DEVANAGARI = '"Nirmala UI", "Mangal", "Kokila", serif';
const W = 1080, H = 1920;

function Smoke({ t }: { t: number }) {
  // three soft blobs of dark smoke drifting across, from @remotion/noise (the red haze of theirs)
  return (
    <>
      {[0, 1, 2].map(i => {
        const x = 540 + 480 * noise2D(`sx${i}`, t * 0.05, i), y = 700 + 600 * noise2D(`sy${i}`, i, t * 0.04);
        return <div key={i} style={{ position: 'absolute', left: x - 700, top: y - 700, width: 1400, height: 1400, borderRadius: 700,
          background: 'radial-gradient(circle, rgba(10,0,0,0.55) 0%, rgba(10,0,0,0) 70%)', opacity: 0.6 + 0.3 * noise2D(`so${i}`, t * 0.1, 0) }} />;
      })}
    </>
  );
}

export function LwsPoem001({ cover = false }: { cover?: boolean }) {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  const alphas = sceneAlphas(t), c = creditAt(t);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SCENES.map((s, i) => {
        if (alphas[i] <= 0) return null;
        const p = pushAt(i, t), lower = alphas.findIndex(a => a > 0);
        // the lower scene stays full and the next fades in over it (a true cross-fade, no dip to black)
        return <Img key={s.file} src={staticFile(s.file)} style={{ position: 'absolute', left: (W - 1300) / 2 + p.dx, top: (H - 2311) / 2, width: 1300, height: 2311,
          transform: `scale(${p.scale})`, opacity: i === lower ? 1 : alphas[i] }} />;
      })}
      <Smoke t={t} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="ember"><stop offset="0" stopColor="#ffd9a0" /><stop offset="0.4" stopColor="#ff7a2a" /><stop offset="1" stopColor="#ff3b0a" stopOpacity="0" /></radialGradient>
          <linearGradient id="streak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff6a2a" stopOpacity="0" /><stop offset="1" stopColor="#ffe0b0" /></linearGradient>
        </defs>
        {streaksAt(t).map((k, i) => <line key={i} x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke="#ffb27a" strokeWidth={3} strokeLinecap="round" opacity={k.alpha}
          style={{ filter: 'drop-shadow(0 0 6px #ff5a1a)' }} />)}
        {embersAt(t).map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.r * 2.2} fill="url(#ember)" opacity={e.alpha} />)}
      </svg>
      {/* their frame: the edges fall to black, the middle glows */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.78) 100%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.6) 100%)' }} />
      {c > 0 && (
        <div style={{ position: 'absolute', left: 0, width: W, top: 560, textAlign: 'center', opacity: c, transform: `translateY(${(1 - c) * 18}px)` }}>
          <div style={{ font: `700 76px ${DEVANAGARI}`, color: '#fff3e6', textShadow: '0 0 24px rgba(0,0,0,0.9), 0 0 6px #000' }}>{CREDIT.poet}</div>
          <div style={{ marginTop: 26, font: `600 34px "Segoe UI", sans-serif`, letterSpacing: 6, color: '#ffcfb0', textShadow: '0 0 12px #000' }}>{CREDIT.brand.toUpperCase()}</div>
        </div>
      )}
    </AbsoluteFill>
  );
}
