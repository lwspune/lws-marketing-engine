// @lws.pune · reel 027 (3D, predict-first): unroll each ring of a circle and stack them: what shape? A triangle (B). A
// thick disc of 10 glossy rings (cyan / blue) turns in a tilted orbit (F22) while a ripple runs through it; a red line
// marks the bottom radius and a white slit cuts the top; every ring straightens (each band's shape is rebuilt every frame
// from the tested map `unroll`) into a triangle; a dashed 2πr × r rectangle shows it is half; the rim glows orange with a
// "2πr" brace; the red radius is the height; ½ × 2πr × r = πr²; the rings light from the apex as the area counts up; the
// triangle rolls back into the disc. Timeline: lib/reel027.ts.
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { StrikeThrough } from '@remotion/rough-notation';
import * as THREE from 'three';
import { WHITE as P, tint } from './lib/palette.ts';
import { captionAt, prog } from './lib/motion.ts';
import {
  END_AT, ANSWER_AT, CAPTIONS, OPTIONS, ANSWER, COVER_T, COLORS, R, N_RINGS, RING_W, DEPTH, BAND, FRONT_Z, RADIUS, SLIT,
  UNROLL, ROLLBACK, TRAP, RIM, HEIGHT, FORMULA, SWEEP, INTEGRAL_AT, FORMULA_Y, FORMULA_SIZE, unroll, sAt, liftAt,
  cameraAt, labelsAt, labelBox, type V3,
} from './lib/reel027.ts';
import { Board, Caption, EndCard, Int, MathRow, PredictHeader, Theme, hand, useFonts, type EndLine } from './board.tsx';
import { RealLight } from './realism.tsx';
import { softEdges } from './shapes.tsx';

const COVER = { text: 'Area = πr². Here\'s why.', y: 1590, size: 60 };
const SEGS = 96, VERTS = SEGS * 24 + 12, SEED = 27;

function CameraRig({ t }: { t: number }) {
  const { camera } = useThree(), c = cameraAt(t), cam = camera as THREE.PerspectiveCamera;
  cam.up.set(...c.up); cam.position.set(...c.position); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix();
  return null;
}

/** Ring k at unroll s as triangles: front and back faces, outer and inner walls, and the two cut ends. */
function fillRing(pos: Float32Array, nor: Float32Array, k: number, s: number, lift: number) {
  const r0 = k * RING_W, r1 = (k + 1) * RING_W, zf = DEPTH / 2 + lift, zb = -DEPTH / 2 + lift, a = 1 - s;
  const out = (phi: number): [number, number] => (s >= 1 ? [0, -1] : [Math.sin(a * phi), -Math.cos(a * phi)]);
  const along = (phi: number): [number, number] => (s >= 1 ? [1, 0] : [Math.cos(a * phi), Math.sin(a * phi)]);
  let v = 0;
  const put = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
    pos[3 * v] = x; pos[3 * v + 1] = y; pos[3 * v + 2] = z; nor[3 * v] = nx; nor[3 * v + 1] = ny; nor[3 * v + 2] = nz; v++;
  };
  const quad = (p: [number, number, number][], n: [number, number, number][]) =>
    [0, 1, 2, 0, 2, 3].forEach(i => put(...p[i], ...n[i]));
  for (let i = 0; i < SEGS; i++) {
    const f0 = -Math.PI + (2 * Math.PI * i) / SEGS, f1 = -Math.PI + (2 * Math.PI * (i + 1)) / SEGS;
    const [ox0, oy0] = unroll(r1, f0, s), [ox1, oy1] = unroll(r1, f1, s), [ix0, iy0] = unroll(r0, f0, s), [ix1, iy1] = unroll(r0, f1, s);
    const n0 = out(f0), n1 = out(f1);
    quad([[ix0, iy0, zf], [ox0, oy0, zf], [ox1, oy1, zf], [ix1, iy1, zf]], Array(4).fill([0, 0, 1]));
    quad([[ix0, iy0, zb], [ix1, iy1, zb], [ox1, oy1, zb], [ox0, oy0, zb]], Array(4).fill([0, 0, -1]));
    quad([[ox0, oy0, zb], [ox1, oy1, zb], [ox1, oy1, zf], [ox0, oy0, zf]], [[...n0, 0], [...n1, 0], [...n1, 0], [...n0, 0]]);
    quad([[ix0, iy0, zb], [ix0, iy0, zf], [ix1, iy1, zf], [ix1, iy1, zb]], [[-n0[0], -n0[1], 0], [-n0[0], -n0[1], 0], [-n1[0], -n1[1], 0], [-n1[0], -n1[1], 0]]);
  }
  for (const phi of [-Math.PI, Math.PI]) {
    const [ox, oy] = unroll(r1, phi, s), [ix, iy] = unroll(r0, phi, s), d = along(phi), sg = phi < 0 ? -1 : 1, n: [number, number, number] = [sg * d[0], sg * d[1], 0];
    quad([[ix, iy, zb], [ox, oy, zb], [ox, oy, zf], [ix, iy, zf]], Array(4).fill(n));
  }
}

function Ring({ k, t }: { k: number; t: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(VERTS * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(VERTS * 3), 3));
    return g;
  }, []);
  const s = sAt(t), lift = liftAt(k, t);
  fillRing(geo.attributes.position.array as Float32Array, geo.attributes.normal.array as Float32Array, k, s, lift);
  geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere();
  // the rim turns orange from its beat on (it rolls back as the rim); in the sweep every ring fades back, then each
  // returns to full colour, with a flash, as it is added
  const base = k % 2 ? COLORS.ringB : COLORS.ringA, rim = k === N_RINGS - 1 ? prog(t, RIM.t, RIM.dur) : 0;
  const litAt = SWEEP.t + (k * SWEEP.dur) / N_RINGS, flash = t >= litAt ? Math.max(0, 1 - (t - litAt) / 0.35) : 0;
  const faded = prog(t, SWEEP.t - 0.4, 0.4) * (1 - prog(t, litAt, 0.15));
  const color = new THREE.Color(base).lerp(new THREE.Color(COLORS.rim), rim).lerp(new THREE.Color(P.board), 0.4 * faded);
  const glow = 0.45 * flash * (1 - prog(t, ROLLBACK.t, 0.6)) + 0.25 * rim * (1 - prog(t, RIM.t + 1.2, 0.8));
  // not tone-mapped: the renderer's film curve turned the VIVID cyan and blue pastel (F24)
  return <mesh geometry={geo} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.55} metalness={0} envMapIntensity={0.45} side={THREE.DoubleSide} toneMapped={false}
      emissive={k === N_RINGS - 1 && rim > 0 ? COLORS.rim : '#ffffff'} emissiveIntensity={glow} />
  </mesh>;
}

/** A rod from a to b (drawn from a towards b up to fraction p). */
function Rod({ a, b, p = 1, r, color, glow = 0, opacity = 1 }: { a: V3; b: V3; p?: number; r: number; color: string; glow?: number; opacity?: number }) {
  if (p <= 0.001 || opacity <= 0.01) return null;
  const e: V3 = [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
  const len = Math.hypot(e[0] - a[0], e[1] - a[1], e[2] - a[2]), mid: V3 = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2, (a[2] + e[2]) / 2];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(e[0] - a[0], e[1] - a[1], e[2] - a[2]).normalize());
  return <mesh position={mid} quaternion={q}>
    <cylinderGeometry args={[r, r, len, 14]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25 + glow} roughness={0.3} transparent={opacity < 1} opacity={opacity} />
  </mesh>;
}

function Marks({ t }: { t: number }) {
  const z = FRONT_Z;
  const heightGlow = prog(t, HEIGHT.t, 0.4) * (1 - prog(t, HEIGHT.t + HEIGHT.dur, 0.4));
  const slitA = 1 - prog(t, UNROLL.t, 0.4), brace = prog(t, RIM.t, RIM.dur), braceA = 1 - prog(t, HEIGHT.t, 0.4), by = -R - 0.16;
  // the trap: a dashed rectangle 2πR × R drawn round the triangle, its empty halves lightly shaded
  const W = Math.PI * R, per = 4 * W + 2 * R, drawn = prog(t, TRAP.t, TRAP.dur) * per, trapA = 1 - prog(t, TRAP.out, 0.4);
  const corners: [number, number][] = [[-W, -R], [W, -R], [W, 0], [-W, 0], [-W, -R]];
  const dashes: { a: V3; b: V3 }[] = [];
  let run = 0;
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = corners[i], [x1, y1] = corners[i + 1], len = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 0; d < len; d += 0.3) {
      const e = Math.min(len, d + 0.18);
      if (run + e > drawn) break;
      dashes.push({ a: [x0 + ((x1 - x0) * d) / len, y0 + ((y1 - y0) * d) / len, z], b: [x0 + ((x1 - x0) * e) / len, y0 + ((y1 - y0) * e) / len, z] });
    }
    run += len;
  }
  return (
    <>
      <Rod a={[0, 0, z]} b={[0, -R, z]} p={prog(t, RADIUS.t, RADIUS.dur)} r={0.035} color={COLORS.radius} glow={0.6 * heightGlow} />
      <Rod a={[0, R, z]} b={[0, 0, z]} p={prog(t, SLIT.t, SLIT.dur)} r={0.028} color="#ffffff" glow={0.8} opacity={slitA} />
      {t >= TRAP.t && trapA > 0 && <>
        {dashes.map((d, i) => <Rod key={i} a={d.a} b={d.b} r={0.025} color={P.muted} opacity={trapA} />)}
        <mesh position={[0, -R / 2, -DEPTH / 2 - 0.03]}>
          <planeGeometry args={[2 * W, R]} />
          <meshBasicMaterial color={P.muted} transparent opacity={0.12 * trapA * prog(t, TRAP.t + TRAP.dur, 0.3)} depthWrite={false} />
        </mesh>
      </>}
      {brace > 0 && braceA > 0 && <>
        <Rod a={[0, by, z]} b={[W, by, z]} p={brace} r={0.03} color={COLORS.rim} opacity={braceA} />
        <Rod a={[0, by, z]} b={[-W, by, z]} p={brace} r={0.03} color={COLORS.rim} opacity={braceA} />
        {brace >= 1 && [-W, W].map(x => <Rod key={x} a={[x, by, z]} b={[x, -R + 0.02, z]} r={0.03} color={COLORS.rim} opacity={braceA} />)}
      </>}
    </>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <CameraRig t={t} />
      <RealLight env={0.9} at={[-4, 9, 12]} span={6} />
      {Array.from({ length: N_RINGS }, (_, k) => <Ring key={k} k={k} t={t} />)}
      <Marks t={t} />
    </>
  );
}

// Labels: HTML in Cambria on top of the canvas, placed with project(); the formula line is drawn by Formula.
function Labels({ t }: { t: number }) {
  const cam = cameraAt(t);
  return <>{labelsAt(t).filter(l => l.alpha > 0.01 && l.role !== 'formula').map((l, i) => {
    const b = labelBox(l, cam), pill = l.role !== 'base';
    const color = l.role === 'r' ? COLORS.radius : l.role === 'base' ? COLORS.rim : P.ink;
    return <div key={i} style={{ position: 'absolute', left: b.x0 - (pill ? 10 : 0), top: b.y0 - (pill ? 2 : 0), width: b.x1 - b.x0 + (pill ? 20 : 0),
      height: b.y1 - b.y0 + (pill ? 4 : 0), display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: l.alpha,
      ...hand(l.size), fontWeight: l.role === 'r' || l.role === 'base' ? 800 : 600, color, whiteSpace: 'pre',
      background: pill ? tint('#ffffff', l.role === 'readout' ? 0.8 : 0.92) : undefined, borderRadius: 999,
      boxShadow: l.role === 'length' ? `0 3px 8px ${tint(P.ink, 0.15)}` : undefined }}>{l.text}</div>;
  })}</>;
}

/** "Area = ½ × 2πr × r", term by term; the ½ and the 2 struck through by hand; "= πr²"; then "∫₀ʳ 2πx dx = πr²". */
function Formula({ t }: { t: number }) {
  const [a, b, c] = FORMULA.terms, first = 1 - prog(t, INTEGRAL_AT, 0.25), second = prog(t, INTEGRAL_AT + 0.25, 0.3);
  const show = (t0: number) => ({ opacity: prog(t, t0, 0.3) });
  const strike = (d: number) => Math.min(1, Math.max(0, (t - FORMULA.strike - d) / 0.4));
  return (
    <>
      <MathRow y={FORMULA_Y + FORMULA_SIZE * 0.35} size={FORMULA_SIZE} opacity={first * prog(t, a, 0.3)}>
        <span>Area = </span>
        <span><StrikeThrough progress={strike(0)} seed={SEED} color={P.ink} strokeWidth={5}>½</StrikeThrough></span>
        <span style={show(b)}> × <StrikeThrough progress={strike(0.15)} seed={SEED + 1} color={P.ink} strokeWidth={5}>2</StrikeThrough>πr</span>
        <span style={show(c)}> × r</span>
        <span style={{ ...show(FORMULA.result), color: P.green, fontWeight: 700 }}> = πr²</span>
      </MathRow>
      <MathRow y={FORMULA_Y + FORMULA_SIZE * 0.35} size={FORMULA_SIZE} opacity={second}>
        <Int lo="0" hi="r" size={FORMULA_SIZE} />
        <span>2πx dx = </span><span style={{ color: P.green, fontWeight: 700 }}>πr²</span>
      </MathRow>
    </>
  );
}

const END: EndLine[] = [
  { at: 0.3, size: 58, weight: 600, color: P.ink, text: 'A circle is a' },
  { at: 0.6, size: 62, weight: 600, color: P.ink, text: 'rolled-up triangle.' },
  { at: 1.3, size: 80, weight: 700, color: P.green, text: 'Follow for more' },
];

export function Reel027({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <PredictHeader t={t} label={'NDA MATHS  ·  AREA'} lines={['Unroll each ring, stack them.', 'What shape do they make?']}
          options={OPTIONS} answer={ANSWER} at={ANSWER_AT} size={54} chipW={270} />
        <div style={{ position: 'absolute', left: 0, top: BAND.top, width: BAND.width, height: BAND.height, ...softEdges({ top: 0.03, bottom: 0.03 }) }}>
          <ThreeCanvas width={BAND.width} height={BAND.height} shadows gl={{ antialias: true, alpha: true }}>
            <Scene t={t} />
          </ThreeCanvas>
        </div>
        <Labels t={t} />
        {!cover && <Formula t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1580} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('nda-maths-027-circle-area-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
