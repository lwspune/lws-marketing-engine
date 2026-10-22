import test from 'node:test';
import assert from 'node:assert/strict';
import { COIL, MAGNET, MU0, linkage, dLinkage, emf, filament, fieldLine } from '../src/lib/induction.ts';

// The physics both induction reels share (the framework-2 test, L61): a bar magnet (a point dipole on the coil's axis)
// moving through a 2,000-turn coil. Flux linkage Λ(u), u = the magnet's distance from the coil's centre; Faraday:
// ℰ = −dΛ/dt = −Λ′(u)·du/dt. Re-derived here, never taken from the animation (F10).
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test('flux through one loop of a dipole on its axis is μ0·m·a²/(2(a²+z²)^1.5); the coil adds N/L of them per metre', () => {
  // Sum the loops one by one and compare with the closed form linkage() uses.
  const loops = 4000, { a, L, N } = COIL, m = MAGNET.moment;
  for (const u of [0, 0.01, 0.03, 0.06, -0.045]) {
    let sum = 0;
    for (let i = 0; i < loops; i++) {
      const z = u - (-L / 2 + (i + 0.5) * (L / loops));
      sum += (N / loops) * (MU0 * m * a * a) / (2 * (a * a + z * z) ** 1.5);
    }
    near(linkage(u), sum, 1e-5);
  }
});

test('the linkage peaks with the magnet at the centre and is symmetric; far away it falls to almost nothing', () => {
  near(linkage(0.02), linkage(-0.02));
  assert.ok(linkage(0) > linkage(0.01) && linkage(0.01) > linkage(0.05));
  assert.ok(linkage(0.5) < 0.01 * linkage(0));
});

test('dΛ/du matches a numerical derivative, and is zero at the centre (no change of flux there)', () => {
  for (const u of [-0.08, -0.03, -0.01, 0.005, 0.02, 0.07]) near(dLinkage(u), (linkage(u + 1e-7) - linkage(u - 1e-7)) / 2e-7, 1e-5);
  near(dLinkage(0), 0, 1e-12);
});

test('Faraday: no motion, no EMF, wherever the magnet sits (the hook: a still magnet lights nothing)', () => {
  for (const u of [-0.1, -0.03, 0, 0.02]) assert.equal(emf(u, 0), 0);
});

test('Lenz: pushing in and pulling out give opposite EMFs; faster gives more, in proportion', () => {
  const inward = emf(-0.04, 1), outward = emf(-0.04, -1);
  assert.ok(inward !== 0);
  near(inward, -outward);
  near(emf(-0.04, 2), 2 * inward);
  // Moving the same way, entering (flux rising) and leaving (flux falling) give opposite EMFs.
  assert.ok(Math.sign(emf(-0.04, 1)) === -Math.sign(emf(0.04, 1)));
});

test('the size is real for a desk demo: a neodymium magnet pushed in at 20 cm/s makes about 2 V, enough for a torch bulb', () => {
  let peak = 0;
  for (let u = -0.15; u <= 0.15; u += 0.0005) peak = Math.max(peak, Math.abs(emf(u, 0.2)));
  assert.ok(peak > 1 && peak < 3, `peak ${peak.toFixed(2)} V at 0.2 m/s`);
  assert.ok(MAGNET.radius < COIL.a, 'the magnet fits inside the coil');
});

test('the bulb filament warms and cools with the power (thermal lag ~0.08 s), never negative, 0 with no current', () => {
  const dt = 1 / 30;
  assert.equal(filament([0, 0, 0], dt).at(-1), 0);
  const on = filament(Array(30).fill(1), dt);
  assert.ok(on[1] < on[29] && on[29] > 0.98 && on.every(v => v >= 0 && v <= 1));
  const off = filament([...Array(30).fill(1), ...Array(30).fill(0)], dt);
  assert.ok(off[59] < 0.01, 'dark again within a second of the current stopping');
});

test('a dipole field line follows r = r0·sin²θ', () => {
  const pts = fieldLine(0.05, 40);
  for (const [x, y] of pts) {
    const r = Math.hypot(x, y), s = Math.abs(x) / r;      // x across the axis, y along it: sin θ = |x| / r
    near(r, 0.05 * s * s, 1e-9);
  }
});
