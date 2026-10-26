// Where renders keep their temporary files, and how they're cleared. Remotion makes a browser profile
// (puppeteer_dev_chrome_profile-*) for every render and deletes it on close, but on Windows Edge still holds the files
// then, so the delete fails quietly: 693 of them, 7.6 GB, had piled up in the system temp folder by 2026-10-22.
// remotion.config.ts sends each render's temp files (profiles, bundles, frames) to RENDER_TEMP and clears what's stale
// there first; `npm run clean:temp` does the same by hand. Nothing outside RENDER_TEMP is touched.
import { lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const RENDER_TEMP = join(tmpdir(), 'remotion-lws-render');
/** Older than this, nothing is still using it: a reel renders in a few minutes. */
export const STALE_MINUTES = 30;

export type Entry = { name: string; mtimeMs: number };
export const staleEntries = (entries: Entry[], now: number) =>
  entries.filter((e) => now - e.mtimeMs > STALE_MINUTES * 60_000).map((e) => e.name);

function sizeOf(path: string): number {
  const s = lstatSync(path);
  if (!s.isDirectory()) return s.size;
  return readdirSync(path).reduce((n, name) => n + sizeOf(join(path, name)), 0);
}

/** Delete what's stale in `dir` (creating it if missing). Anything still locked is skipped and counted. */
export function cleanTempDir(dir = RENDER_TEMP, now = Date.now()) {
  mkdirSync(dir, { recursive: true });
  const entries = readdirSync(dir).map((name) => ({ name, mtimeMs: lstatSync(join(dir, name)).mtimeMs }));
  let removed = 0, skipped = 0, bytes = 0;
  for (const name of staleEntries(entries, now)) {
    const path = join(dir, name);
    try {
      const size = sizeOf(path);
      rmSync(path, { recursive: true, force: true });
      removed++; bytes += size;
    } catch {
      skipped++;
    }
  }
  return { removed, skipped, bytes };
}

// Remotion called from a script (tools/stills.ts) doesn't read remotion.config.ts, so until 2026-10-26 its profiles went to
// the system temp folder: 324 of them, 4.8 GB, with the disk at 0.6 GB free. Scripts now call useRenderTemp() too; as a
// backstop every clean also sweeps stale browser profiles out of the system temp folder, and nothing else (other apps' files).
const PROFILE = 'puppeteer_dev_chrome_profile-';
export const strayProfiles = (entries: Entry[], now: number) => staleEntries(entries.filter((e) => e.name.startsWith(PROFILE)), now);

/** Delete stale browser profiles from `dir` (the system temp folder). Anything still locked is skipped and counted. */
export function cleanStrayProfiles(dir = tmpdir(), now = Date.now()) {
  const entries = readdirSync(dir).filter((name) => name.startsWith(PROFILE)).map((name) => ({ name, mtimeMs: lstatSync(join(dir, name)).mtimeMs }));
  let removed = 0, skipped = 0, bytes = 0;
  for (const name of strayProfiles(entries, now)) {
    const path = join(dir, name);
    try {
      const size = sizeOf(path);
      rmSync(path, { recursive: true, force: true });
      removed++; bytes += size;
    } catch {
      skipped++;
    }
  }
  return { removed, skipped, bytes };
}

/** For remotion.config.ts and scripts that render: clear stale leftovers (ours, and stray profiles in the system temp
    folder), then point this process's temp files at RENDER_TEMP. Call it before anything launches a browser. */
export function useRenderTemp() {
  const strays = cleanStrayProfiles(), result = cleanTempDir();
  process.env.TEMP = process.env.TMP = process.env.TMPDIR = RENDER_TEMP;
  return { removed: result.removed + strays.removed, skipped: result.skipped + strays.skipped, bytes: result.bytes + strays.bytes };
}
