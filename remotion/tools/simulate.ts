// Work out realism demo 4's two runs once (Remotion draws frames out of order, so physics can't run while rendering):
//   node tools/simulate.ts  →  public/demo-physics.json  { plain, rapier }: [frame][molecule] = [x, y, z]
import { writeFileSync } from 'node:fs';
import RAPIER from '@dimforge/rapier3d-compat';
import { simulatePlain, simulateRapier } from '../src/lib/demoPhysics.ts';

await RAPIER.init();
writeFileSync('public/demo-physics.json', JSON.stringify({ plain: simulatePlain(), rapier: simulateRapier(RAPIER) }));
console.log('public/demo-physics.json written');
