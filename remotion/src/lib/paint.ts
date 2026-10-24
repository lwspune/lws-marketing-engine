// "Painted 2D" (founder, 2026-10-24): the look of Sound Mind pause reel #2. No black ink outlines (the founder read them
// as "kids drawing"): every colour has a light side, a shadow side and an edge that is a darker shade of itself. A painted
// reel's palette goes through paintProblems() in its test; [] means it is painted, not outlined.

export type Paint = { fill: string; light: string; shade: string; edge: string };

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
export const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hue = (hex: string) => {
  const [r, g, b] = rgb(hex), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
const chroma = (hex: string) => { const c = rgb(hex); return Math.max(...c) - Math.min(...c); };
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Everything that keeps a palette from being "painted"; [] when it is. */
export function paintProblems(palette: Record<string, Paint>): string[] {
  const out: string[] = [];
  for (const [name, p] of Object.entries(palette)) {
    if (!(luminance(p.light) > luminance(p.fill) && luminance(p.fill) > luminance(p.shade))) out.push(`${name}: shading out of order (light → fill → shade)`);
    if (luminance(p.edge) >= luminance(p.fill)) out.push(`${name}: edge not darker than the fill`);
    if (luminance(p.edge) <= 0.006) out.push(`${name}: edge is black ink`);
    else if (chroma(p.fill) > 0.08 && hueGap(hue(p.edge), hue(p.fill)) > 30) out.push(`${name}: edge is another colour`);
  }
  return out;
}
