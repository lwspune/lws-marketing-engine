// @pyqvault_ · Chemistry, visualised #2: the periodic table's 8 families. Dark lab look (background A/B test, L22).
// The 118 tiles drop onto a tilted 3D table, then each family lifts and glows in turn with one short trait (and its
// outer electrons where that's the reason); it ends on the why: same column → same outer electrons → same chemistry.
// House settings (reels/pyqvault-insta.md): short labels only, no exam question, pyqvault.com on the end card.
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LAB as P, tint, SOFT_UI } from './lib/palette.ts';
import { prog, clamp01, captionAt } from './lib/motion.ts';
import { ELEMENTS, FAMILIES, familyOf, cellOf, TABLE, END_AT, CAPTIONS, spotlight, tileRise, ALL_ON } from './lib/pc002.ts';
import { Board, Caption, EndCard, TitleCard, Theme, useFonts, type EndLine } from './board.tsx';

const COVER = { t: ALL_ON + 1.2, text: 'The periodic table’s\n8 families', y: 1560, size: 60 };
const TILE = TABLE.pitch - TABLE.gap, TOP = 560;
const rowY = (row: number) => (row <= 7 ? row - 1 : row - 2) * TABLE.pitch + (row >= 9 ? TABLE.rowGap : 0);
const colorOf = (id: string | null) => FAMILIES.find(f => f.id === id)?.color ?? '#3a4558';

function Tile({ x, y, label, small, lit, lift, color, drop, dim }:
  { x: number; y: number; label: string; small?: string; lit: number; lift: number; color: string; drop: number; dim: number }) {
  if (drop <= 0) return null;
  const bg = lit > 0 ? color : P.card;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: TILE, height: TILE, borderRadius: 9, boxSizing: 'border-box',
      transform: `translateZ(${(1 - drop) * 520 + lift * 46}px)`, opacity: drop * (1 - 0.62 * dim),
      background: lit > 0 ? `linear-gradient(160deg, ${tint(bg, 1)}, ${tint(bg, 0.78)})` : bg,
      border: `1.5px solid ${lit > 0 ? tint('#ffffff', 0.35) : tint(P.ink, 0.12)}`,
      boxShadow: lit > 0 ? `0 0 ${18 * lit}px ${tint(color, 0.75 * lit)}, 0 ${6 + 10 * lift}px 14px rgba(0,0,0,0.55)` : '0 4px 8px rgba(0,0,0,0.45)',
      color: lit > 0.5 ? '#0a0e15' : P.ink, textAlign: 'center',
    }}>
      {small && <div style={{ position: 'absolute', left: 5, top: 2, font: `600 11px ${SOFT_UI}`, opacity: 0.8 }}>{small}</div>}
      <div style={{ font: `700 ${label.length > 3 ? 13 : 24}px/${TILE}px ${SOFT_UI}`, paddingTop: label.length > 3 ? 0 : 3 }}>{label}</div>
    </div>
  );
}

function Table({ t }: { t: number }) {
  const spot = spotlight(t), all = prog(t, ALL_ON, 0.8);
  const tilt = 34 - 18 * prog(t, ALL_ON - 0.4, 1.4), sway = 2.2 * Math.sin((2 * Math.PI * t) / 18);
  const lightOf = (id: string | null) => {
    if (!id) return 0;
    const f = FAMILIES.find(x => x.id === id)!;
    const own = prog(t, f.t0, 0.35) * (1 - prog(t, f.t1 - 0.05, 0.3));      // its spotlight
    return Math.max(own, all, t >= f.t1 ? 0.0 : 0);
  };
  const liftOf = (id: string | null) => (id && spot?.id === id ? prog(t, spot.t0, 0.45) : 0) * (1 - all);
  const dimOf = (id: string | null) => (spot && spot.id !== id ? prog(t, FAMILIES[0].t0, 0.4) : 0) * (1 - all);
  const holders = [{ col: 3, row: 6, label: '57–71', fam: 'lanthanide' }, { col: 3, row: 7, label: '89–103', fam: 'actinide' }];
  return (
    <div style={{ position: 'absolute', left: 0, top: TOP, width: 1080, height: 620, perspective: 1500, perspectiveOrigin: '540px 120px' }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: '540px 300px',
        transform: `rotateX(${tilt}deg) rotateZ(${sway * 0.25}deg) rotateY(${sway}deg)` }}>
        {holders.map(h => (
          <Tile key={h.label} x={TABLE.left + (h.col - 1) * TABLE.pitch} y={rowY(h.row)} label={h.label} lit={lightOf(h.fam)}
            lift={liftOf(h.fam)} color={colorOf(h.fam)} drop={tileRise(57, t)} dim={dimOf(h.fam)} />
        ))}
        {ELEMENTS.map(e => {
          const c = cellOf(e.z), fam = familyOf(e.z);
          return <Tile key={e.z} x={TABLE.left + (c.col - 1) * TABLE.pitch} y={rowY(c.row)} label={e.sym} small={String(e.z)}
            lit={lightOf(fam)} lift={liftOf(fam)} color={colorOf(fam)} drop={tileRise(e.z, t)} dim={dimOf(fam)} />;
        })}
      </div>
    </div>
  );
}

// The family in the spotlight: its name, one trait, and (for groups 1, 2, 17, 18) its outer shell.
function FamilyLabel({ t }: { t: number }) {
  const f = spotlight(t); if (!f) return null;
  const a = prog(t, f.t0, 0.3) * (1 - prog(t, f.t1 - 0.3, 0.3)), s = 0.94 + 0.06 * prog(t, f.t0, 0.4);
  return (
    <div style={{ position: 'absolute', left: 0, width: 1080, top: 1210, textAlign: 'center', opacity: a, transform: `scale(${s})` }}>
      <div style={{ font: `700 64px ${SOFT_UI}`, color: f.color, textShadow: `0 0 24px ${tint(f.color, 0.45)}` }}>{f.name}</div>
      <div style={{ font: `600 42px ${SOFT_UI}`, color: P.ink, marginTop: 14 }}>{f.trait}</div>
      {f.outer && <Shell n={f.outer} color={f.color} t={t - f.t0} />}
    </div>
  );
}
function Shell({ n, color, t }: { n: number; color: string; t: number }) {
  const R = 74, spin = t * 0.6;
  return (
    <svg width={260} height={220} style={{ marginTop: 18 }} aria-hidden>
      <circle cx={130} cy={110} r={R} fill="none" stroke={tint(P.ink, 0.35)} strokeWidth={2.5} />
      <circle cx={130} cy={110} r={22} fill={tint(P.ink, 0.2)} stroke={tint(P.ink, 0.5)} strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => {
        const a = spin + (2 * Math.PI * i) / n, show = clamp01((t - 0.25 - i * 0.08) / 0.2);
        return <circle key={i} cx={130 + R * Math.cos(a)} cy={110 + R * Math.sin(a)} r={11 * show} fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${tint(color, 0.8)})` }} />;
      })}
    </svg>
  );
}

const END: EndLine[] = [
  { at: 0.2, size: 48, weight: 400, color: P.muted, text: 'Same column, same chemistry.' },
  { at: 0.5, size: 60, weight: 600, color: P.ink, text: 'That’s the chemistry.' },
  { at: 0.9, size: 44, weight: 600, color: P.muted, text: 'Follow for #3' },
  { at: 1.2, size: 80, weight: 700, color: P.green, text: 'pyqvault.com' },
];

export function PvChem002({ cover = false }: { cover?: boolean }) {
  useFonts();
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = cover ? COVER.t : frame / fps, cap = cover ? null : captionAt(CAPTIONS, t);
  return (
    <Theme value={P}>
      <AbsoluteFill>
        <Board watermark={false} />
        <TitleCard t={t} label={'CHEMISTRY, VISUALISED  #2'} lines={['Why does the periodic', 'table have families?']} size={70} color={P.green} />
        <Table t={t} />
        {!cover && <FamilyLabel t={t} />}
        {cover
          ? <Caption text={COVER.text} alpha={1} age={0} size={COVER.size} y={COVER.y} rise={false} />
          : cap && <Caption text={cap.caption.text} alpha={cap.alpha} age={cap.age} size={cap.caption.size ?? 50} y={cap.caption.y ?? 1330} />}
        {!cover && <EndCard t={t} at={END_AT} lines={END} />}
        {!cover && <Html5Audio src={staticFile('pv-chem-002-families.wav')} />}
      </AbsoluteFill>
    </Theme>
  );
}
