// @lws.pune · Map #1 (predict-first): "Which chapter gets the most NDA maths questions now?" B, Probability (41 of the
// last 360). Then all of NDA probability on one map: the camera visits each of 8 nodes while its formula writes in, two
// flips to the indigo board break the pattern, and the whole map is held for a screenshot before the reel settles back
// into frame 0. White board (F12), flat 2D, VIVID node colours (F24). Timeline and checks: lib/reel017.ts.
import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WHITE as P, VIVID, tint, SOFT_UI } from './lib/palette.ts';
import { clamp01, captionAt, tween } from './lib/motion.ts';
import {
  OPTIONS, ANSWER, NODES, HUB, REGION, VIEW, card, FLIPS, writeAt, focusAt, hubAnswerAt, pulseAt, flipAt, finalAt, predictAnswerAt,
  CAPTIONS, CAMERA, COVER_T, type Flip,
} from './lib/reel017.ts';
import { Board, Caption, PredictHeader, Theme, hand, useFonts } from './board.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Guess before you watch', y: 1590, size: 60 };
const LABEL = 'NDA MATHS  ·  LAST 3 PAPERS';
const FLIP_BG = P.blue, FLIP_HI = VIVID.lab.yellow;

// "^{n}C_{r}" → n raised, r lowered.
function Formula({ text }: { text: string }) {
  return <>{text.split(/(\^\{[^}]*\}|_\{[^}]*\})/).map((s, i) => {
    if (s.startsWith('^{')) return <sup key={i} style={{ fontSize: '0.62em', verticalAlign: '0.55em', lineHeight: 0 }}>{s.slice(2, -1)}</sup>;
    if (s.startsWith('_{')) return <sub key={i} style={{ fontSize: '0.62em', verticalAlign: '-0.2em', lineHeight: 0 }}>{s.slice(2, -1)}</sub>;
    return <React.Fragment key={i}>{s}</React.Fragment>;
  })}</>;
}

// One node: a white card; empty bars until its formula writes in left to right; a glow in its colour while in focus.
function NodeCard({ i, t }: { i: number; t: number }) {
  const n = NODES[i], b = card(i), w = writeAt(i, t), f = focusAt(i, t), reveal = `inset(0 ${(1 - w) * 100}% 0 0)`;
  return (
    <div style={{
      position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 28, background: '#fff', boxSizing: 'border-box',
      padding: '22px 20px', textAlign: 'center',
      boxShadow: `0 14px 40px ${tint(P.ink, 0.1)}, 0 0 0 ${3 + 3 * f}px ${tint(n.color, 0.25 + 0.55 * f)}, 0 0 ${36 * f}px ${tint(n.color, 0.45 * f)}`,
    }}>
      {w < 1 && <div style={{ position: 'absolute', inset: 0, opacity: 1 - w }}>
        <div style={{ margin: '30px auto 0', width: 150, height: 22, borderRadius: 11, background: tint(n.color, 0.4) }} />
        {n.lines.map((_, k) => <div key={k} style={{ margin: '24px auto 0', width: 230 - 40 * k, height: 18, borderRadius: 9, background: tint(P.ink, 0.12) }} />)}
      </div>}
      {w > 0 && <div style={{ clipPath: reveal, WebkitClipPath: reveal }}>
        <div style={{ font: `700 38px/50px ${SOFT_UI}`, color: n.color }}>{n.title}</div>
        {n.lines.map(l => <div key={l} style={{ ...hand(n.size ?? 34), lineHeight: '44px', color: P.ink, whiteSpace: 'pre' }}><Formula text={l} /></div>)}
      </div>}
    </div>
  );
}

function MapPicture({ t }: { t: number }) {
  const [z, fx, fy] = tween(t, CAMERA.start, CAMERA.keys), h = hubAnswerAt(t);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
      transform: `translate(${VIEW.x}px, ${VIEW.y}px) scale(${z}) translate(${-fx}px, ${-fy}px)` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {NODES.map((n, i) => {
          const p = pulseAt(i, t), a = Math.atan2(n.y - HUB.y, n.x - HUB.x), x0 = HUB.x + HUB.r * Math.cos(a), y0 = HUB.y + HUB.r * Math.sin(a);
          return (
            <g key={i}>
              <line x1={x0} y1={y0} x2={n.x} y2={n.y} stroke={tint(n.color, 0.45)} strokeWidth={5} strokeLinecap="round" />
              {p !== null && <circle cx={x0 + (n.x - x0) * p * 0.8} cy={y0 + (n.y - y0) * p * 0.8} r={11} fill={n.color} opacity={Math.sin(Math.PI * p)}
                style={{ filter: `drop-shadow(0 0 10px ${tint(n.color, 0.8)})` }} />}
            </g>
          );
        })}
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill={P.ink} style={{ filter: `drop-shadow(0 14px 30px ${tint(P.ink, 0.25)})` }} />
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r - 12} fill="none" stroke={tint('#ffffff', 0.18)} strokeWidth={3} />
      </svg>
      <div style={{ position: 'absolute', left: HUB.x - HUB.r, top: HUB.y - HUB.r, width: 2 * HUB.r, height: 2 * HUB.r, color: '#fff', textAlign: 'center' }}>
        {h < 1 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - h, ...hand(130) }}>?</div>}
        {h > 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: h }}>
          <div style={{ font: `600 26px ${SOFT_UI}`, color: tint('#ffffff', 0.75) }}>NDA maths</div>
          <div style={{ ...hand(44), marginTop: 4 }}>Probability</div>
        </div>}
      </div>
      {NODES.map((_, i) => <NodeCard key={i} i={i} t={t} />)}
    </div>
  );
}

// The pattern break: the whole frame flips to indigo, the lines arrive one by one.
function FlipCard({ f, t, k }: { f: Flip; t: number; k: number }) {
  const a = flipAt(f, t);
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ background: FLIP_BG, opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      {f.lines.map((l, j) => {
        const big = j === 0, small = k === 1 && j >= 2, la = clamp01((t - f.t0 - 0.08 - j * 0.16) / 0.15);
        return <div key={l} style={{
          opacity: la, transform: `translateY(${(1 - la) * 18}px)`, textAlign: 'center', whiteSpace: 'pre',
          font: `${big ? 700 : 600} ${big ? 128 : small ? 46 : 64}px/${big ? 1.1 : 1.25} ${SOFT_UI}`,
          color: big ? FLIP_HI : small ? tint('#ffffff', 0.85) : '#fff', marginBottom: big ? 12 : 0,
        }}>{l}</div>;
      })}
    </AbsoluteFill>
  );
}

// The end header in place of the question: what to do with the map, then the follow (F20).
function FinalHeader({ t }: { t: number }) {
  const a = finalAt(t);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, opacity: a, textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 96, font: `700 34px ${SOFT_UI}`, color: P.muted }}>NDA MATHS  ·  PROBABILITY</div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 148, ...hand(76), color: P.ink }}>Screenshot this 📌</div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 262, font: `600 42px ${SOFT_UI}`, color: P.muted }}>All of NDA probability, one map</div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 334, font: `700 56px ${SOFT_UI}`, color: P.green }}>Follow for more</div>
    </div>
  );
}

export function Reel017({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t), q = 1 - finalAt(t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        {q > 0 && <div style={{ position: 'absolute', inset: 0, opacity: q }}>
          <PredictHeader t={t} label={LABEL} lines={['Which chapter gets the most', 'NDA maths questions now?']}
            options={OPTIONS} answer={ANSWER} at={predictAnswerAt(t)} size={52} chipW={300} />
        </div>}
        <FinalHeader t={t} />
        {/* the picture area: clipped below the question so a zoom never covers it, soft at its edges (F8) */}
        <div style={{ position: 'absolute', left: 0, top: REGION.top, width: 1080, height: REGION.h, overflow: 'hidden', ...softEdges({ top: 0.015, bottom: 0.02 }) }}>
          <div style={{ position: 'absolute', left: 0, top: -REGION.top, width: 1080, height: 1920 }}><MapPicture t={t} /></div>
        </div>
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && FLIPS.map((f, k) => <FlipCard key={k} f={f} t={t} k={k} />)}
        {!cover && <Html5Audio src={staticFile('nda-maths-017-probability-map-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
