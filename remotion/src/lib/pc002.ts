// @pyqvault_ · Chemistry, visualised #2: the periodic table's 8 families (Class 11, Classification of Elements).
// The table builds tile by tile, then each family lights up in turn with one short trait; it ends on the why:
// same column, same outer electrons, same chemistry. Proven idea: @sciencevisualised 4.45M (remake-backlog C2).
// Pure data and timing as functions of t (seconds).
import { prog, type Caption } from './motion.ts';

export const DURATION = 33.0, END_AT = 29.4;

const SYMBOLS = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr '
  + 'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W '
  + 'Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg '
  + 'Cn Nh Fl Mc Lv Ts Og').split(' ');
export const ELEMENTS = SYMBOLS.map((sym, i) => ({ z: i + 1, sym }));

// Where an element sits: group (col 1–18) and period (row 1–7); lanthanides and actinides in rows 9 and 10.
export function cellOf(z: number): { col: number; row: number } {
  if (z === 1) return { col: 1, row: 1 };
  if (z === 2) return { col: 18, row: 1 };
  const short = (start: number, row: number) => { const i = z - start; return { col: i < 2 ? i + 1 : i + 11, row }; };
  if (z <= 10) return short(3, 2);
  if (z <= 18) return short(11, 3);
  if (z <= 36) return { col: z - 18, row: 4 };
  if (z <= 54) return { col: z - 36, row: 5 };
  if (z <= 56) return { col: z - 54, row: 6 };
  if (z <= 71) return { col: 3 + z - 57, row: 9 };
  if (z <= 86) return { col: z - 68, row: 6 };
  if (z <= 88) return { col: z - 86, row: 7 };
  if (z <= 103) return { col: 3 + z - 89, row: 10 };
  return { col: z - 100, row: 7 };
}

const METALLOIDS = new Set([5, 14, 32, 33, 51, 52]);
export type FamilyId = 'alkali' | 'alkaline' | 'transition' | 'lanthanide' | 'actinide' | 'metalloid' | 'halogen' | 'noble';
export function familyOf(z: number): FamilyId | null {
  const { col, row } = cellOf(z);
  if (row === 9) return 'lanthanide';
  if (row === 10) return 'actinide';
  if (col === 1) return z === 1 ? null : 'alkali';
  if (col === 2) return 'alkaline';
  if (col === 17) return 'halogen';
  if (col === 18) return 'noble';
  if (METALLOIDS.has(z)) return 'metalloid';
  if (col >= 3 && col <= 12 && row >= 4) return 'transition';
  return null;
}

// The families in the order they take the spotlight: colour, one trait (≤ 7 words), outer electrons where it's simple.
const F0 = 6.4, STEP = 2.55;
const LIST: { id: FamilyId; name: string; trait: string; color: string; outer?: number }[] = [
  { id: 'alkali', name: 'Alkali metals', trait: '1 outer electron: fizz in water', color: '#ff7a6b', outer: 1 },
  { id: 'alkaline', name: 'Alkaline earth metals', trait: '2 outer electrons', color: '#ffb35c', outer: 2 },
  { id: 'transition', name: 'Transition metals', trait: 'coloured compounds, great catalysts', color: '#86a8ff' },
  { id: 'lanthanide', name: 'Lanthanides', trait: 'the rare earths', color: '#c9a7ff' },
  { id: 'actinide', name: 'Actinides', trait: 'every one is radioactive', color: '#ff8fc7' },
  { id: 'metalloid', name: 'Metalloids', trait: 'half metal, half non-metal', color: '#9fd7e8' },
  { id: 'halogen', name: 'Halogens', trait: '7 outer electrons: salt makers', color: '#e9e27a', outer: 7 },
  { id: 'noble', name: 'Noble gases', trait: 'full outer shell: they don’t react', color: '#4fd1a5', outer: 8 },
];
export const FAMILIES = LIST.map((f, i) => ({ ...f, t0: F0 + i * STEP, t1: F0 + (i + 1) * STEP }));
export const spotlight = (t: number) => FAMILIES.find(f => t >= f.t0 && t < f.t1) ?? null;
export const ALL_ON = F0 + FAMILIES.length * STEP;            // 26.8 s: every family coloured at once

// The build: tiles rise in atomic-number order from 3.2 s; the last is up by 5.95 s.
export const tileRise = (z: number, t: number) => prog(t, 3.2 + (z - 1) * (2.4 / 118), 0.35);

// Layout of the flat table (before the 3D tilt): 18 columns of 54 px tiles.
export const TABLE = { left: 36, top: 0, pitch: 56.5, gap: 4.5, rowGap: 14 };

export const CAPTIONS: Caption[] = [
  { t0: 3.0, t1: F0, text: '118 elements' },
  { t0: ALL_ON, t1: END_AT, text: 'Same column → same outer electrons\n→ same chemistry' },
];
export const MUSIC_HITS = [F0, FAMILIES[6].t0, ALL_ON];
