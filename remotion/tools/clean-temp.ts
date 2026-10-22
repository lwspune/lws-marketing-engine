// Clear renders' stale temporary files by hand (each render already does this when it starts; see tempDir.ts).
//   npm run clean:temp
import { RENDER_TEMP, STALE_MINUTES, cleanTempDir } from './tempDir.ts';

const { removed, skipped, bytes } = cleanTempDir();
console.log(`${RENDER_TEMP}: removed ${removed} item(s) older than ${STALE_MINUTES} min, ${(bytes / 2 ** 20).toFixed(0)} MB freed` +
  (skipped ? `; ${skipped} still in use, left alone` : ''));
