// White-board building blocks shared by every reel: the board, floating cards, captions and maths,
// drawn to match reels/engine.js ('white' theme) at 1080×1920.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, spring, useVideoConfig } from 'remotion';
import { WHITE, tint, TEXT_FONT, MATH_FONT, SOFT_UI, UI, type Palette } from './lib/palette.ts';
import { clamp01, prog } from './lib/motion.ts';
import { endLineFor, type Platform } from './lib/platform.ts';

// System fonts are not loaded until first used: hold the render until they are, as engine.js does.
const FONTS = ['600 40px Cambria', '40px "Cambria Math"', '800 40px "Segoe UI"', '600 40px "Segoe UI"',
  '400 40px "Segoe UI Variable Display"', '600 40px "Segoe UI Variable Display"', '700 40px "Segoe UI Variable Display"'];
export function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(FONTS.map(f => document.fonts.load(f))).then(() => continueRender(handle)); }, [handle]);
}

// The look: white unless a reel wraps itself in <Theme value={LAB}> (the dark board, @pyqvault_ A/B test L22).
const ThemeContext = createContext<Palette>(WHITE);
export const Theme = ThemeContext.Provider;
export const usePalette = () => useContext(ThemeContext);
// A card's fill and shadow: white with an ink shadow on the white board, the palette's card with a black shadow on lab.
const cardFill = (P: Palette) => P.card ?? '#fff';
const cardShadow = (P: Palette, a: number) => tint(P.shadow ?? P.ink, P.shadow ? Math.min(0.6, a * 3.5) : a);

export const hand = (size: number) => ({ font: `600 ${size}px ${TEXT_FONT}` });

// Warm paper-white, a touch darker towards the edges, with the account's watermark.
export function Board({ watermark = true }: { watermark?: boolean }) {
  const P = usePalette();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle 1440px at 540px 806px, ${P.board} 100px, ${P.edge} 1440px)` }}>
      {watermark && (
        <div style={{ position: 'absolute', left: 150, top: 1600 - 30, font: `600 34px ${UI}`, color: tint(P.muted, 0.55), whiteSpace: 'pre' }}>
          LWS Pune  ·  NDA Maths
        </div>
      )}
    </AbsoluteFill>
  );
}

export function Card({ x, y, w, h, r = 32, shade = 0.1 }: { x: number; y: number; w: number; h: number; r?: number; shade?: number }) {
  const P = usePalette();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: cardFill(P), boxShadow: `0 16px 48px ${cardShadow(P, shade)}` }} />;
}

// A caption on a floating white card centred on (540, y). From `age` = 0 it rises into place on a spring;
// the opening caption (rise = false) is already in place on frame 0, because it is the hook.
export function Caption({ text, alpha, age, size = 56, y = 300, rise = true }: { text: string; alpha: number; age: number; size?: number; y?: number; rise?: boolean }) {
  const P = usePalette();
  const { fps } = useVideoConfig();
  const s = rise ? spring({ frame: age * fps, fps, config: { damping: 15, mass: 0.7 } }) : 1;
  if (alpha <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: 540, top: y, maxWidth: 860 + 96, padding: '30px 48px', borderRadius: 34, background: cardFill(P),
      boxShadow: `0 16px 48px ${cardShadow(P, 0.14)}`, opacity: alpha, textAlign: 'center', whiteSpace: 'pre-line',
      font: `600 ${size}px/${size * 1.22}px ${SOFT_UI}`, color: P.ink, width: 'max-content',
      transform: `translate(-50%, -50%) translateY(${(1 - s) * 26}px) scale(${0.95 + 0.05 * s})`,
    }}>{text}</div>
  );
}

// Maths set as text, centred on x = 540 with its baseline near y. Limits stack beside ∫ and ] like a textbook.
export function MathRow({ y, size, children, opacity = 1 }: { y: number; size: number; children: React.ReactNode; opacity?: number }) {
  const P = usePalette();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: y - size * 0.95, display: 'flex', justifyContent: 'center', alignItems: 'center',
      opacity, ...hand(size), lineHeight: 1, color: P.ink, whiteSpace: 'pre' }}>{children}</div>
  );
}
function Stack({ lo, hi, size, color, gap }: { lo: string; hi: string; size: number; color?: string; gap: number }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'space-between', height: size * 1.25, marginLeft: gap,
      ...hand(Math.round(size * 0.5)), lineHeight: 1, color, whiteSpace: 'pre', alignSelf: 'center' }}>
      <span>{hi}</span><span>{lo}</span>
    </span>
  );
}
export function Int({ lo, hi, size, color }: { lo: string; hi: string; size: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color, marginRight: size * 0.08 }}>
      <span style={{ font: `${Math.round(size * 1.35)}px ${MATH_FONT}`, lineHeight: 1 }}>∫</span>
      <Stack lo={lo} hi={hi} size={size} color={color} gap={-size * 0.12} />
    </span>
  );
}
export const Limits = ({ lo, hi, size }: { lo: string; hi: string; size: number }) => <Stack lo={lo} hi={hi} size={size} gap={size * 0.04} />;
export const C = ({ color, children }: { color: string; children: React.ReactNode }) => <span style={{ color }}>{children}</span>;

// Answer options as pills centred on the page. From `at` the answer fills with the accent and pulses once;
// the wrong options step back so the eye lands on the answer.
// `until`: a looping reel (F27) un-lights the answer from then, so its last frame matches its first.
// `colors` (reel 028): each chip's letter and border in the colour of the line it names; `pulses`: when each one swells.
export function Chips({ t, labels, answer, at, top, w = 180, h = 72, gap = 20, size = 44, until = Infinity, colors, pulses }:
  { t: number; labels: string[]; answer: number; at: number; top: number; w?: number; h?: number; gap?: number; size?: number; until?: number;
    colors?: string[]; pulses?: number[] }) {
  const P = usePalette(), back = 1 - prog(t, until, 0.5);
  const on = prog(t, at, 0.6) * back, pulse = Math.sin(Math.PI * clamp01((t - at) / 0.7)), dim = 1 - 0.55 * prog(t, at + 0.3, 0.5) * back;
  const x0 = 540 - (labels.length * w + (labels.length - 1) * gap) / 2;
  return <>{labels.map((label, i) => {
    const hit = i === answer && on > 0, own = colors?.[i], swell = pulses ? Math.sin(Math.PI * clamp01((t - pulses[i]) / 0.6)) : 0;
    const s = (hit ? 1 + 0.07 * pulse : 1) * (1 + 0.12 * swell);
    return (
      <div key={label} style={{
        position: 'absolute', left: x0 + i * (w + gap), top, width: w, height: h, borderRadius: h / 2, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`,
        border: `${hit ? 2 + on : own ? 3 : 2}px solid ${hit ? tint(P.amber, 0.25 + 0.6 * on) : own ? tint(own, 0.7) : tint(P.ink, 0.14)}`,
        background: hit ? tint(P.amber, 0.12 * on) : own ? tint(own, 0.08 + 0.12 * swell) : 'transparent',
        boxShadow: hit ? `0 6px 22px ${tint(P.amber, 0.25 * on)}` : own && swell > 0 ? `0 4px 18px ${tint(own, 0.35 * swell)}` : 'none',
        opacity: i === answer ? 1 : dim, color: hit && on > 0.5 ? P.amber : own ?? P.ink, ...hand(size), fontWeight: own ? 700 : undefined, paddingTop: 2,
      }}>{label}</div>
    );
  })}</>;
}

// The opening title, as in reels/engine.js: held still on a card while a light runs ~1¼ times round its edge,
// then the card fades and the title glides up into a slim header (no slow zoom on text: it shimmers).
const TITLE_CARD = { x: 80, y: 620, w: 920, h: 360, r: 32 };
export function TitleCard({ t, label, lines, color, size = 78 }: { t: number; label: string; lines: [string, string]; color?: string; size?: number }) {
  const P = usePalette(), glow = color ?? P.blue;
  const k = prog(t, 2.6, 1.0), cardA = 1 - prog(t, 2.5, 0.5), s = 1 + (0.72 - 1) * k, cy = 847 + (350 - 847) * k;
  const ring = clamp01(t / 2.8), ringA = cardA * Math.min(1, t / 0.3 + 0.35, (1 - ring) / 0.18);
  const c = TITLE_CARD;
  return (
    <>
      {cardA > 0 && <div style={{ opacity: cardA }}><Card x={c.x} y={c.y} w={c.w} h={c.h} r={c.r} /></div>}
      {ringA > 0 && t < 2.8 && (
        <div style={{
          position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: c.r, padding: 4, boxSizing: 'border-box', opacity: ringA,
          background: `conic-gradient(from ${ring * 1.25 * 360}deg, transparent 0 60%, ${tint(glow, 0.95)} 98.5%, transparent 100%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          filter: `drop-shadow(0 0 8px ${tint(glow, 0.7)})`,
        }} />
      )}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: cy, transform: `translateY(-50%) scale(${s})`, textAlign: 'center' }}>
        <div style={{ font: `700 50px ${SOFT_UI}`, color: P.muted, marginBottom: 22, whiteSpace: 'pre' }}>{label}</div>
        {lines.map(l => <div key={l} style={{ ...hand(size), lineHeight: `${Math.round(size * 1.28)}px`, color: P.ink, whiteSpace: 'pre' }}>{l}</div>)}
      </div>
    </>
  );
}

// The predict-first opening (learnings L28, 2026-10-19): from frame 0 a question the viewer can answer in two seconds,
// with A/B/C pills and a nudge to comment a guess. No still title card (L29: viewers left within ~3–6 s). The right pill
// lights at `at`, when the picture has shown the answer.
// `brand` (F20, founder 2026-10-21): "PYQ Vault · pyqvault.com" under the chips from frame 0, for the whole reel, quieter
// than the question (muted: ≥ 4.5:1 on the board). `until` (F27): the card resets for a loop.
export function PredictHeader({ t, label, lines, options, answer, at, size = 58, chipW = 200, brand, until = Infinity, chipColors, chipPulses }:
  { t: number; label: string; lines: string[]; options: string[]; answer: number; at: number; size?: number; chipW?: number; brand?: string; until?: number;
    chipColors?: string[]; chipPulses?: number[] }) {
  const P = usePalette(), nudge = Math.max(1 - prog(t, at - 0.4, 0.4), prog(t, until, 0.5)), top = 150 + lines.length * size * 1.2;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 96, textAlign: 'center', font: `700 34px ${SOFT_UI}`, color: P.muted, whiteSpace: 'pre' }}>{label}</div>
      {lines.map((l, i) => (
        <div key={l} style={{ position: 'absolute', left: 0, width: 1080, top: 150 + i * size * 1.2, textAlign: 'center', ...hand(size), color: P.ink, whiteSpace: 'pre' }}>{l}</div>
      ))}
      <Chips t={t} labels={options} answer={answer} at={at} top={top + 26} w={chipW} h={76} gap={22} size={42} until={until} colors={chipColors} pulses={chipPulses} />
      {brand && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: top + 120, textAlign: 'center', font: `600 30px ${SOFT_UI}`, color: P.muted, letterSpacing: 0.5 }}>
          {brand}
        </div>
      )}
      {nudge > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: top + (brand ? 166 : 122), textAlign: 'center', opacity: nudge, font: `600 32px ${SOFT_UI}`, color: P.muted }}>
          comment your guess 👇
        </div>
      )}
    </>
  );
}

export type EndLine = { at: number; size: number; weight: number; color: string; text: string };
// The white end card: fades into the same soft board, then each line rises in on a spring.
// `platform` swaps the follow line for YouTube ("Subscribe for more"); Instagram is the default.
export function EndCard({ t, at, lines, platform = 'instagram' }: { t: number; at: number; lines: EndLine[]; platform?: Platform }) {
  const { fps } = useVideoConfig();
  const p = clamp01((t - at) / 0.5); if (p <= 0) return null;
  let y = 820;
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <Board watermark={false} />
      {lines.map(l => {
        const a = clamp01((t - at - l.at) / 0.35), s = spring({ frame: (t - at - l.at) * fps, fps, config: { damping: 16 } });
        const top = y; y += l.size * (l.size > 70 ? 2.0 : 1.75);
        return <div key={l.text} style={{ position: 'absolute', left: 0, width: 1080, top: top - l.size * 0.6, textAlign: 'center', opacity: a,
          font: `${l.weight} ${l.size}px/${l.size * 1.2}px ${SOFT_UI}`, color: l.color, transform: `translateY(${(1 - s) * 22}px)` }}>{endLineFor(l.text, platform)}</div>;
      })}
    </AbsoluteFill>
  );
}
