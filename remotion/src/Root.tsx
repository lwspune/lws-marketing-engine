import { Composition, Still } from 'remotion';
import { Reel005 } from './Reel005.tsx';
import { Reel014 } from './Reel014.tsx';
import { Compare005 } from './Compare.tsx';
import { PvPhysics002 } from './PvPhysics002.tsx';
import { PvChem002 } from './PvChem002.tsx';
import { PvMaths001 } from './PvMaths001.tsx';
import { DURATION } from './lib/reel005.ts';
import { DURATION as DURATION_014 } from './lib/reel014.ts';
import { DURATION as DURATION_PV002 } from './lib/pv002.ts';
import { DURATION as DURATION_PC002 } from './lib/pc002.ts';
import { DURATION as DURATION_PM001 } from './lib/pm001.ts';

export const Root = () => (
  <>
    <Composition id="Reel005" component={Reel005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel005Cover" component={Reel005} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Compare005" component={Compare005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1040} />
    <Composition id="Reel014" component={Reel014} durationInFrames={Math.round(DURATION_014 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel014Cover" component={Reel014} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvPhysics002" component={PvPhysics002} durationInFrames={Math.round(DURATION_PV002 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics002Cover" component={PvPhysics002} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvChem002" component={PvChem002} durationInFrames={Math.round(DURATION_PC002 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvChem002Cover" component={PvChem002} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvMaths001" component={PvMaths001} durationInFrames={Math.round(DURATION_PM001 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvMaths001Cover" component={PvMaths001} width={1080} height={1920} defaultProps={{ cover: true }} />
  </>
);
