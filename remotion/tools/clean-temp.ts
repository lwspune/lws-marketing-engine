// Clear renders' stale temporary files by hand (each render already does this when it starts; see tempDir.ts).
//   npm run clean:temp
import { tmpdir } from 'node:os';
import { RENDER_TEMP, STALE_MINUTES, cleanStrayProfiles, cleanTempDir } from './tempDir.ts';

const report = (where: string, what: string, { removed, skipped, bytes }: { removed: number; skipped: number; bytes: number }) =>
  console.log(`${where}: removed ${removed} ${what} older than ${STALE_MINUTES} min, ${(bytes / 2 ** 20).toFixed(0)} MB freed` +
    (skipped ? `; ${skipped} still in use, left alone` : ''));
report(tmpdir(), 'stray browser profile(s)', cleanStrayProfiles());
report(RENDER_TEMP, 'item(s)', cleanTempDir());
