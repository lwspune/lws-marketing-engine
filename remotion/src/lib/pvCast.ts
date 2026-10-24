// @pyqvault_ character cast, first sketch (founder, 2026-10-24): physics quantities as characters that act out a law,
// after studying @qubit.exe's hits. Our own designs, each drawn from its circuit symbol so the look carries the physics:
// Volt is a battery cell (the push), Amp a spark (the flow), Ohm a resistor with its colour bands (the blocker, and it
// heats up when current is forced through it: P = I²R). Painted, not outlined. Tests: tests/pvCast.test.ts.

export type Pose = { id: string; label: string };
export type Character = { id: 'volt' | 'amp' | 'ohm'; name: string; role: string; poses: Pose[] };

export const CAST: Character[] = [
  { id: 'volt', name: 'Volt', role: 'the push · voltage', poses: [{ id: 'ready', label: 'ready' }, { id: 'push', label: 'pushing hard' }, { id: 'charged', label: 'charged up' }] },
  { id: 'amp', name: 'Amp', role: 'the flow · current', poses: [{ id: 'zoom', label: 'zooming' }, { id: 'squeezed', label: 'squeezed' }, { id: 'race', label: 'racing through' }] },
  { id: 'ohm', name: 'Ohm', role: 'the blocker · resistance', poses: [{ id: 'arms', label: 'arms crossed' }, { id: 'block', label: 'blocking' }, { id: 'hot', label: 'getting hot' }] },
];

export const BOARD = '#141A2E', TEXT = '#FFFFFF', SUBTEXT = '#C9D2EA';

type Paint = { fill: string; light: string; shade: string; edge: string };
export const PAINT: Record<string, Paint> = {
  cell: { fill: '#2E62B0', light: '#5A8FDB', shade: '#1F477F', edge: '#183A68' },
  copper: { fill: '#D2834A', light: '#F0AD78', shade: '#A6622F', edge: '#844C22' },
  spark: { fill: '#FFC93F', light: '#FFE79A', shade: '#F0A21C', edge: '#C47F12' },
  ceramic: { fill: '#E3CB9C', light: '#F4E4C2', shade: '#C2A673', edge: '#9C8150' },
  lead: { fill: '#A9B1BA', light: '#D5DBE1', shade: '#7E8790', edge: '#646C75' },
  bandBrown: { fill: '#8A5A2E', light: '#AE7A4A', shade: '#6A4420', edge: '#56361A' },
  bandRed: { fill: '#C8412F', light: '#E26A57', shade: '#9E3020', edge: '#7F2618' },
  bandGold: { fill: '#D8B04A', light: '#EDD07E', shade: '#AE8A2E', edge: '#8C6E22' },
  bandViolet: { fill: '#7A4FB0', light: '#9C76D0', shade: '#5C3989', edge: '#4A2D70' },
  heat: { fill: '#FF6A3D', light: '#FF9D7A', shade: '#D94A22', edge: '#B23B18' },
  eyeWhite: { fill: '#F4F6FB', light: '#FFFFFF', shade: '#D5DBE8', edge: '#A9B3C7' },
};
