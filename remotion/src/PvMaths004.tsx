// @pyqvault_ · Maths, visualised #4 (framework v1.35, F40): the chain rule as a gear train, imitating @learnara.math's
// "Chain Rule visualized!" shot for shot. The timeline, the maths and every text's place are in lib/pm004.ts. Three gears
// on posts in the soft studio (F36): x (36 teeth) drives u (18), u drives y (6); counters under them count the turns, the
// card at the top keeps the score (dy/dx = ?, the wrong 3 + 2 = 5? that breaks into 6, then 3 × 2 = 6 and the chain rule).
import { useMemo } from 'react';
import { AbsoluteFill, Html5Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WHITE as P, SOFT_UI, tint } from './lib/palette.ts';
import {
  GEARS, GEAR_IDS, ADDENDUM, SET, COVER_T, angle, cameraAt, cardAt, counterBumpAt, mascotAt, textsAt, type GearId, type Text, type Card,
} from './lib/pm004.ts';
import { FULL } from './lib/layout.ts';
import { project } from './lib/inductionScene.ts';
import { clamp01 } from './lib/motion.ts';
import { Theme, useFonts } from './board.tsx';
import { StudioSet, ContactShadow } from './studio.tsx';

// wrong is a true red, apart from y's orange; a ✗ and a ✓ carry it for colour-blind viewers (Colour, Drama, pass 1)
const DEPTH = 0.16, POST = '#c9c2b6', ACCENT = GEARS.y.colour, RIGHT = GEARS.u.colour, WRONG = '#dc2626', SUB = '#4a5368';

function Rig({ t }: { t: number }) {
  const { camera } = useThree(), cam = camera as THREE.PerspectiveCamera, c = cameraAt(t);
  cam.position.set(...c.position); cam.up.set(...c.up); cam.fov = c.fov; cam.aspect = c.aspect;
  cam.lookAt(...c.target); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return null;
}

/** A spur gear's outline: N teeth on the pitch circle, root circle 1.25 modules in, tips one module out. Tooth k is
 *  centred on angle k·2π/N (lib/pm004.ts meshes them on that). */
function gearShape(teeth: number, r: number, hole: number) {
  const m = ADDENDUM, rr = r - 1.25 * m, ra = r + m, p = (2 * Math.PI) / teeth, s = new THREE.Shape();
  const pt = (rad: number, a: number) => [rad * Math.cos(a), rad * Math.sin(a)] as const;
  for (let k = 0; k < teeth; k++) {
    const a = k * p, seq = [pt(rr, a - 0.5 * p), pt(rr, a - 0.3 * p), pt(ra, a - 0.16 * p), pt(ra, a + 0.16 * p), pt(rr, a + 0.3 * p)];
    seq.forEach(([x, y], i) => (k === 0 && i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  }
  s.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h);
  return s;
}

function Gear({ id, t }: { id: GearId; t: number }) {
  const g = GEARS[id];
  const geo = useMemo(() => new THREE.ExtrudeGeometry(gearShape(g.teeth, g.r, g.r * 0.2), {
    depth: DEPTH, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 24 }), [g]);
  const face = g.colour;
  const hub = id === 'y' ? 0.13 : Math.max(0.085, g.r * 0.26), hand = g.r - 1.6 * ADDENDUM;
  return (
    <group position={[g.cx, g.cy, 0]}>
      {/* the post and its foot, behind the gear */}
      <mesh position={[0, -g.cy / 2, -0.16]} castShadow><cylinderGeometry args={[0.05, 0.06, g.cy, 24]} /><meshStandardMaterial color={POST} roughness={0.6} /></mesh>
      <mesh position={[0, -g.cy + 0.03, -0.16]} castShadow receiveShadow><cylinderGeometry args={[0.22, 0.24, 0.06, 36]} /><meshStandardMaterial color={POST} roughness={0.6} /></mesh>
      <group rotation={[0, 0, angle(id, t)]}>
        <mesh geometry={geo} position={[0, 0, -DEPTH / 2]} castShadow receiveShadow>
          <meshPhysicalMaterial color={face} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.4} envMapIntensity={0.35} />
        </mesh>
        {/* the hand: a dark bar from the hub to the rim, so every turn can be counted (theirs has one too) */}
        <mesh position={[0, (hub + hand) / 2, DEPTH / 2 + 0.02]}><boxGeometry args={[Math.max(0.035, g.r * 0.07), hand - hub, 0.02]} />
          <meshStandardMaterial color="#2b3242" roughness={0.5} /></mesh>
      </group>
      {/* a flat white hub, unlit: a lit disc showed a grey seam through the letter (Colour, pass 1) */}
      <mesh position={[0, 0, DEPTH / 2 + 0.04]}><circleGeometry args={[hub, 48]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <ContactShadow x={0} z={-0.16} rx={0.42} opacity={0.35} />
    </group>
  );
}

function Scene({ t }: { t: number }) {
  return (
    <>
      <Rig t={t} />
      <StudioSet colour={SET} />
      <directionalLight position={[-3, 6, 5]} intensity={1.1} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={4} shadow-camera-bottom={-1} />
      {GEAR_IDS.map(id => <Gear key={id} id={id} t={t} />)}
    </>
  );
}

/** "dy/du" as a stacked fraction; anything else as it is. */
function MathText({ text, size, colour }: { text: string; size: number; colour: string }) {
  const parts = text.split(/(d[a-z]\/d[a-z])/);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.12, color: colour, whiteSpace: 'pre' }}>
      {parts.filter(Boolean).map((p, i) => /^d[a-z]\/d[a-z]$/.test(p)
        ? <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontSize: size * 0.62 }}>
            <span style={{ padding: '0 0.12em 0.06em' }}>{p.slice(0, 2)}</span>
            <span style={{ borderTop: `${Math.max(2, size * 0.05)}px solid ${colour}`, padding: '0.06em 0.12em 0', alignSelf: 'stretch', textAlign: 'center' }}>{p.slice(3)}</span>
          </span>
        : <span key={i}>{p}</span>)}
    </span>
  );
}

const SHARDS = Array.from({ length: 16 }, (_, i) => ({ x0: (i - 7.5) * 26, a: (i * 2.399) % (2 * Math.PI),
  w: 14 + ((i * 7) % 18), h: 6 + ((i * 5) % 9), spin: ((i * 0.37) % 1) - 0.5 }));

function CardBox({ x, card }: { x: Text; card: Card }) {
  const ink = card.tone === 'wrong' ? WRONG : card.tone === 'right' ? RIGHT : P.ink;
  const b = x.box, border = card.tone === 'right' ? tint(RIGHT, 0.55) : card.tone === 'wrong' ? tint(WRONG, 0.45) : tint(P.ink, 0.12);
  const s = card.shatter;
  return (
    <div style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, opacity: x.alpha, borderRadius: 34, background: '#ffffff',
      border: `3px solid ${border}`, boxShadow: '0 18px 40px rgba(35,48,74,0.12)', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', left: 34, top: 20, font: `700 30px ${SOFT_UI}`, color: card.label === 'CHAIN RULE' ? RIGHT : P.muted, letterSpacing: card.label === 'CHAIN RULE' ? 2 : 0 }}>
        {card.label === 'CHAIN RULE' ? card.label : <MathText text={card.label} size={80} colour={SUB} />}
      </div>
      {card.tone !== 'plain' && <div style={{ position: 'absolute', right: 26, top: 20, width: 56, height: 56, borderRadius: 28, background: card.tone === 'right' ? RIGHT : WRONG,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 36px ${SOFT_UI}` }}>{card.tone === 'right' ? '✓' : '✗'}</div>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 58, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: `800 ${x.size}px ${SOFT_UI}`, transform: s > 0 ? `scale(${1 + 0.9 * (1 - clamp01(s * 2))})` : undefined }}>
        <MathText text={card.text} size={card.text.length > 12 ? 74 : x.size} colour={ink} />
      </div>
      {/* the wrong sum shatters into shards, never into glyphs (a piece of "5?" read as a 9: Drama, pass 1) */}
      {s > 0 && s < 1 && SHARDS.map((sh, i) => {
        const d = 40 + 340 * s;
        return <div key={i} style={{ position: 'absolute', left: b.w / 2 + sh.x0 + Math.cos(sh.a) * d, top: 110 + Math.sin(sh.a) * d * 0.6 + 260 * s * s,
          width: sh.w, height: sh.h, borderRadius: 4, background: WRONG, opacity: clamp01(1 - 1.4 * s), transform: `rotate(${sh.spin * 400 * s}deg)` }} />;
      })}
    </div>
  );
}

function Words({ t }: { t: number }) {
  const card = cardAt(t);
  const line = (x: Text, font: React.CSSProperties, colour: string) => (
    <div key={x.name} style={{ position: 'absolute', left: 0, width: 1080, top: x.y, transform: 'translateY(-50%)', textAlign: 'center', opacity: x.alpha, color: colour, whiteSpace: 'pre', ...font }}>{x.text}</div>
  );
  return (
    <>
      {textsAt(t).map(x => {
        switch (x.kind) {
          case 'label': return <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, font: `700 28px ${SOFT_UI}`, letterSpacing: 1.5, color: P.muted }}>{x.text}</div>;
          case 'tag': return <div key={x.name} style={{ position: 'absolute', right: 1080 - (x.box.x + x.box.w), top: x.box.y, font: `600 28px ${SOFT_UI}`, color: P.muted }}>{x.text}</div>;
          case 'title': {
            const pop = 0.6 + 0.4 * x.alpha;
            return <div key={x.name} style={{ position: 'absolute', left: 0, width: 1080, top: x.y, transform: `translateY(-50%) scale(${pop})`, textAlign: 'center', opacity: x.alpha,
              font: `800 ${x.size}px ${SOFT_UI}`, color: x.name === 'title 2' ? ACCENT : P.ink, letterSpacing: -2 }}>{x.text}</div>;
          }
          case 'headline': return line(x, { font: `800 ${x.size}px ${SOFT_UI}`, letterSpacing: -1 }, P.ink);
          case 'sub': return line(x, { font: `600 ${x.size}px ${SOFT_UI}` }, SUB);
          case 'card': return card && <CardBox key={x.name} x={x} card={card} />;
          case 'hub': return <div key={x.name} style={{ position: 'absolute', left: x.x, top: x.y, transform: 'translate(-50%, -54%)', font: `800 ${x.size}px ${SOFT_UI}`,
            color: GEARS[x.name.slice(4) as GearId].colour }}>{x.text}</div>;
          case 'counter': {
            const id = x.name.slice(8) as GearId, bump = counterBumpAt(id, t);
            return <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, width: x.box.w, height: x.box.h, borderRadius: x.box.w / 2, opacity: x.alpha,
              background: '#ffffff', border: `5px solid ${GEARS[id].colour}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: `800 ${x.size}px ${SOFT_UI}`, color: P.ink, boxShadow: '0 8px 18px rgba(35,48,74,0.12)', transform: `scale(${1 + 0.3 * bump})` }}>{x.text}</div>;
          }
          case 'rate': {
            const id: GearId = x.name.endsWith('dx') ? 'u' : 'y';
            return <div key={x.name} style={{ position: 'absolute', left: x.box.x, top: x.box.y, width: x.box.w, height: x.box.h, borderRadius: 24, opacity: x.alpha,
              background: '#ffffff', border: `3px solid ${tint(GEARS[id].colour, 0.6)}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: `800 ${x.size}px ${SOFT_UI}`, transform: `scale(${0.8 + 0.2 * x.alpha})` }}><MathText text={x.text} size={52} colour={P.ink} /></div>;
          }
        }
      })}
    </>
  );
}

function Mascot({ t }: { t: number }) {
  const m = mascotAt(t), p = project(m.at, cameraAt(t), FULL), size = 150;
  return <Img src={staticFile(`mascot/v-${m.pose}.png`)} style={{ position: 'absolute', left: p.x - size / 2, top: p.y - size / 2 + 8 * m.bob, width: size,
    filter: 'drop-shadow(0 14px 16px rgba(35,48,74,0.22))' }} />;
}

export function PvMaths004({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER_T : frame / fps;
  return (
    <Theme value={P}>
      <AbsoluteFill style={{ background: SET }}>
        <ThreeCanvas width={FULL.width} height={FULL.height} shadows gl={{ antialias: true }}><Scene t={t} /></ThreeCanvas>
        <Mascot t={t} />
        <Words t={t} />
        {!cover && <Html5Audio src={staticFile('pv-maths-004-chain-rule-mix.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
