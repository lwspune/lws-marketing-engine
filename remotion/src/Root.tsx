import { Composition, Still } from 'remotion';
import { Reel005 } from './Reel005.tsx';
import { Reel014 } from './Reel014.tsx';
import { Compare005 } from './Compare.tsx';
import { PvPhysics002 } from './PvPhysics002.tsx';
import { PvChem002 } from './PvChem002.tsx';
import { PvMaths001 } from './PvMaths001.tsx';
import { PvPhysics003 } from './PvPhysics003.tsx';
import { PvChem003 } from './PvChem003.tsx';
import { PvMaths002 } from './PvMaths002.tsx';
import { PvPhysics004 } from './PvPhysics004.tsx';
import { PvChem004 } from './PvChem004.tsx';
import { PvMaths003 } from './PvMaths003.tsx';
import { DURATION } from './lib/reel005.ts';
import { DURATION as DURATION_014 } from './lib/reel014.ts';
import { DURATION as DURATION_PV002 } from './lib/pv002.ts';
import { DURATION as DURATION_PC002 } from './lib/pc002.ts';
import { DURATION as DURATION_PM001 } from './lib/pm001.ts';
import { DURATION as DURATION_PP003 } from './lib/pp003.ts';
import { DURATION as DURATION_PC003 } from './lib/pc003.ts';
import { DURATION as DURATION_PM002 } from './lib/pm002.ts';
import { DURATION as DURATION_PP004 } from './lib/pp004.ts';
import { DURATION as DURATION_PC004 } from './lib/pc004.ts';
import { DURATION as DURATION_PM003 } from './lib/pm003.ts';
import { SoundMind001 } from './SoundMind001.tsx';
import { DURATION as DURATION_SM001 } from './lib/sm001.ts';
import { SoundMind002 } from './SoundMind002.tsx';
import { DURATION as DURATION_SM002 } from './lib/sm002.ts';
import { SoundMind003 } from './SoundMind003.tsx';
import { DURATION as DURATION_SM003 } from './lib/sm003.ts';

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
    <Composition id="PvPhysics003" component={PvPhysics003} durationInFrames={Math.round(DURATION_PP003 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics003Cover" component={PvPhysics003} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvChem003" component={PvChem003} durationInFrames={Math.round(DURATION_PC003 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvChem003Cover" component={PvChem003} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvMaths002" component={PvMaths002} durationInFrames={Math.round(DURATION_PM002 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvMaths002Cover" component={PvMaths002} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvPhysics004" component={PvPhysics004} durationInFrames={Math.round(DURATION_PP004 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics004Cover" component={PvPhysics004} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvChem004" component={PvChem004} durationInFrames={Math.round(DURATION_PC004 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvChem004Cover" component={PvChem004} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvMaths003" component={PvMaths003} durationInFrames={Math.round(DURATION_PM003 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvMaths003Cover" component={PvMaths003} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="SoundMind001" component={SoundMind001} durationInFrames={Math.round(DURATION_SM001 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="SoundMind001Cover" component={SoundMind001} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="SoundMind002" component={SoundMind002} durationInFrames={Math.round(DURATION_SM002 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="SoundMind002Cover" component={SoundMind002} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="SoundMind003" component={SoundMind003} durationInFrames={Math.round(DURATION_SM003 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="SoundMind003Cover" component={SoundMind003} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="SoundMind003V" component={SoundMind003} durationInFrames={Math.round(DURATION_SM003 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false, vivid: true }} />
    <Still id="SoundMind003VCover" component={SoundMind003} width={1080} height={1920} defaultProps={{ cover: true, vivid: true }} />
  </>
);
