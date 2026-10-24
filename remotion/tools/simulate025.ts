// Work out reel 025's bins once (Remotion draws frames out of order, so physics can't run while rendering):
//   node tools/simulate025.ts  →  public/nda-maths-025-physics.json  { start, frames, tops, fit, restAt }
import { writeFileSync } from 'node:fs';
import RAPIER from '@dimforge/rapier3d-compat';
import { simulate } from '../src/lib/reel025Physics.ts';

await RAPIER.init();
const { start, frames, tops, fit, restAt } = simulate(RAPIER);
writeFileSync('public/nda-maths-025-physics.json', JSON.stringify({ start, frames, tops, fit, restAt }));
console.log(`public/nda-maths-025-physics.json written (all at rest by ${restAt.toFixed(2)} s)`);
