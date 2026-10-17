import { Composition, Still } from 'remotion';
import { Reel005 } from './Reel005.tsx';
import { Reel014 } from './Reel014.tsx';
import { Compare005 } from './Compare.tsx';
import { DURATION } from './lib/reel005.ts';
import { DURATION as DURATION_014 } from './lib/reel014.ts';

export const Root = () => (
  <>
    <Composition id="Reel005" component={Reel005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel005Cover" component={Reel005} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Compare005" component={Compare005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1040} />
    <Composition id="Reel014" component={Reel014} durationInFrames={Math.round(DURATION_014 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel014Cover" component={Reel014} width={1080} height={1920} defaultProps={{ cover: true }} />
  </>
);
