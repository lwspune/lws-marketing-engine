import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Windows PowerShell 5.1 reads a file as ANSI unless told otherwise (`Get-Content -Raw` with no `-Encoding utf8`), so a
// scripted edit written back as UTF-8 turns "·" into "Â·" and "×" into "Ã—". It reached a reel's on-screen words on
// 2026-10-28 (Maths #4: "PYQ Vault Â· pyqvault.com") and every test still passed. This catches it in any source file.
const MOJIBAKE = /Ã[\u0080-¿—–]|Â[· -¿]|â€[\u0080-¿"™œ”“˜]/;

function* files(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(ts|tsx|json)$/.test(name)) yield p;
  }
}

test('no source file carries UTF-8 read back as ANSI (mojibake)', () => {
  const bad: string[] = [];
  for (const dir of ['src', 'tests', 'music']) for (const f of files(join(import.meta.dirname, '..', dir))) {
    if (f === import.meta.filename) continue;                         // this file quotes the examples
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => { if (MOJIBAKE.test(l)) bad.push(`${f}:${i + 1}`); });
  }
  assert.deepEqual(bad, []);
});
