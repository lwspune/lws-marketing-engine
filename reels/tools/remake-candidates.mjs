// node reels/tools/remake-candidates.mjs
// Mine the saved competitor exports for proven, syllabus-relevant reels to remake.
// Keeps reels at ≥ 3× their own account's median, tags each with a Class 11–12 / NDA topic, drops spectacle.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('../../analytics/competitors/', import.meta.url));
const parse = s => { // minimal CSV with quoted fields
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
};
const TOPICS = [
  // [subject, chapter, regex]
  ['P', 'Collisions & momentum', /collision|momentum|newton.?s cradle|recoil/i],
  ['P', 'Projectile motion', /projectile|trajector/i],
  ['P', 'Forces, friction, slopes, tension', /friction|slope|incline|tension|pulley|forces on|resolving|vector component|lift vs/i],
  ['P', 'Circular motion', /centripetal|circular motion|banking/i],
  ['P', 'Rotation & angular momentum', /angular momentum|moment of inertia|torque|spinning|rotation|rolling/i],
  ['P', 'SHM & oscillations', /pendulum|spring|simple harmonic|\bshm\b|oscillat|damp/i],
  ['P', 'Waves & sound', /standing wave|wave on|doppler|resonan|interference|beats/i],
  ['P', 'Gravitation', /gravit|orbit|kepler|escape velocity|satellite/i],
  ['P', 'Fluids', /bernoulli|buoyan|archimed|viscous|viscosity|drag|terminal velocity|magnus|surface tension|capillar/i],
  ['P', 'Thermodynamics', /adiabatic|isothermal|entropy|heat flows|thermodynamic|carnot|heat engine|first law|second law/i],
  ['P', 'Kinetic theory & gas laws', /boyle|charles|ideal gas|pv ?= ?nrt|gas law|avogadro|kinetic theory|piston/i],
  ['P', 'Work, energy & power', /work vs|work and power|kinetic energy|potential energy|conservation of energy|energy trade|bouncing ball|restitution/i],
  ['P', 'Electrostatics & capacitors', /coulomb|electric field|gauss|capacitor|electrostatic/i],
  ['P', 'Current electricity', /ohm|circuit|resistor|current electricity|kirchhoff/i],
  ['P', 'Magnetism & induction', /magnetic|biot|ampere|faraday|lenz|induction|solenoid/i],
  ['P', 'Optics', /mirror|lens|refraction|total internal|prism|young|diffraction|tyndall|rainbow|optic/i],
  ['P', 'Modern physics', /photoelectric|bohr|radioactiv|half.?life|nuclear|de broglie/i],
  ['C', 'Periodic table', /periodic table|chemical famil|element/i],
  ['C', 'Atomic structure & bonding', /orbital|electron config|hybridi|vsepr|bond/i],
  ['C', 'Equilibrium, kinetics, acids', /equilibrium|le chatelier|reaction rate|activation|catalyst|\bph\b|acid|base/i],
  ['C', 'Electrochemistry & solutions', /electrolysis|electrochem|galvanic|osmosis|solution/i],
  ['M', 'Trigonometry', /trigonom|unit circle|sin|cos\b|tan\b|radian/i],
  ['M', 'Differentiation', /differentiat|derivative|tangent|gradient|optimi[sz]/i],
  ['M', 'Integration', /integrat|integral|area under/i],
  ['M', 'Logarithms & exponentials', /logarithm|exponential|\blog\b/i],
  ['M', 'Probability', /probabilit|dice|coin/i],
  ['M', 'Sequences & series', /series|sequence|sum of|odd numbers|triangular/i],
  ['M', 'Matrices & determinants', /matri|determinant/i],
  ['M', 'Coordinate geometry & conics', /circle equation|coordinate geometry|parabola|ellipse|hyperbola|conic/i],
  ['M', 'Vectors', /vector/i],
];
const SPECTACLE = /japan|multiplication|sonif|sound of|sounds? like|music|parametric|heart|lissajous|fourier|wave extrapolation|important numbers|number facts|trick|square ?root of|illusion|art\b/i;
const out = [];
for (const file of readdirSync(dir).filter(f => f.endsWith('.csv') && !f.startsWith('nda_defence'))) {
  const handle = file.replace(/-\d{4}-\d{2}-\d{2}\.csv$/, '');
  const [head, ...rows] = parse(readFileSync(dir + file, 'utf8').replace(/^\uFEFF/, ''));
  const ix = Object.fromEntries(head.map((h, i) => [h, i]));
  for (const r of rows) {
    if (r[ix.type] !== 'REELS') continue;
    const views = +r[ix.views] || 0, mult = +r[ix.x_their_median] || 0, cap = (r[ix.caption] || '').replace(/\s+/g, ' ');
    if (mult < 3 || views < 50000) continue;
    if (SPECTACLE.test(cap)) continue;
    const topic = TOPICS.find(([, , re]) => re.test(cap));
    if (!topic) continue;
    out.push({ handle, views, mult, subject: topic[0], chapter: topic[1], date: r[ix.posted_ist].slice(0, 10), link: r[ix.permalink], cap: cap.slice(0, 110) });
  }
}
out.sort((a, b) => b.views - a.views);
const by = {};
for (const o of out) (by[o.subject + ' · ' + o.chapter] ??= []).push(o);
const groups = Object.entries(by).sort((a, b) => b[1].reduce((s, o) => s + o.views, 0) - a[1].reduce((s, o) => s + o.views, 0));
for (const [k, list] of groups) {
  console.log(`\n## ${k} — ${list.length} proven reels, best ${list[0].views.toLocaleString('en-IN')}`);
  for (const o of list.slice(0, 5)) console.log(`  ${String(o.views).padStart(9)} (${o.mult.toFixed(0)}×) @${o.handle} ${o.date} ${o.link} | ${o.cap}`);
}
console.log(`\n${out.length} candidates from ${new Set(out.map(o => o.handle)).size} accounts`);
