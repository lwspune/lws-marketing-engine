// White-board building blocks shared by every reel: the board, floating cards, captions and maths,
// drawn to match reels/engine.js ('white' theme) at 1080×1920.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, spring, useVideoConfig } from 'remotion';
import { WHITE as P, tint, TEXT_FONT, MATH_FONT, SOFT_UI, UI } from './lib/palette.ts';

// System fonts are not loaded until first used: hold the render until they are, as engine.js does.
const FONTS = ['600 40px Cambria', '40px "Cambria Math"', '800 40px "Segoe UI"', '600 40px "Segoe UI"',
  '400 40px "Segoe UI Variable Display"', '600 40px "Segoe UI Variable Display"', '700 40px "Segoe UI Variable Display"'];
export function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(FONTS.map(f => document.fonts.load(f))).then(() => continueRender(handle)); }, [handle]);
}

export const hand = (size: number) => ({ font: `600 ${size}px ${TEXT_FONT}` });

// Warm paper-white, a touch darker towards the edges, with the account's watermark.
export function Board({ watermark = true }: { watermark?: boolean }) {
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
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: '#fff', boxShadow: `0 16px 48px ${tint(P.ink, shade)}` }} />;
}

// A caption on a floating white card centred on (540, y). From `age` = 0 it rises into place on a spring;
// the opening caption (rise = false) is already in place on frame 0, because it is the hook.
export function Caption({ text, alpha, age, size = 56, y = 300, rise = true }: { text: string; alpha: number; age: number; size?: number; y?: number; rise?: boolean }) {
  const { fps } = useVideoConfig();
  const s = rise ? spring({ frame: age * fps, fps, config: { damping: 15, mass: 0.7 } }) : 1;
  if (alpha <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: 540, top: y, maxWidth: 860 + 96, padding: '30px 48px', borderRadius: 34, background: '#fff',
      boxShadow: `0 16px 48px ${tint(P.ink, 0.14)}`, opacity: alpha, textAlign: 'center', whiteSpace: 'pre-line',
      font: `600 ${size}px/${size * 1.22}px ${SOFT_UI}`, color: P.ink, width: 'max-content',
      transform: `translate(-50%, -50%) translateY(${(1 - s) * 26}px) scale(${0.95 + 0.05 * s})`,
    }}>{text}</div>
  );
}

// Maths set as text, centred on x = 540 with its baseline near y. Limits stack beside ∫ and ] like a textbook.
export function MathRow({ y, size, children, opacity = 1 }: { y: number; size: number; children: React.ReactNode; opacity?: number }) {
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
