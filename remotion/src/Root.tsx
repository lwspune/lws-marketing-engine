import React from 'react';
import { Composition, Still } from 'remotion';
import { Reel005 } from './Reel005.tsx';
import { Compare005 } from './Compare.tsx';
import { DURATION } from './lib/reel005.ts';

export const Root = () => (
  <>
    <Composition id="Reel005" component={Reel005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel005Cover" component={Reel005} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Compare005" component={Compare005} durationInFrames={Math.round(DURATION * 30)} fps={30} width={1080} height={1040} />
  </>
);
