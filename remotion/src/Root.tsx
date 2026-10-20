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
import { PvPhysics005 } from './PvPhysics005.tsx';
import { PvPhysics006 } from './PvPhysics006.tsx';
import { PvPhysics007 } from './PvPhysics007.tsx';
import { PvPhysics008 } from './PvPhysics008.tsx';
import { PvChem006 } from './PvChem006.tsx';
import { PvChem007 } from './PvChem007.tsx';
import { Reel016 } from './Reel016.tsx';
import { DemoPhysics } from './DemoPhysics.tsx';
import { DemoParticles } from './DemoParticles.tsx';
import { PvChem005 } from './PvChem005.tsx';
import { Reel015 } from './Reel015.tsx';
import { Reel010 } from './Reel010.tsx';
import { Reel011 } from './Reel011.tsx';
import { Reel012 } from './Reel012.tsx';
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
import { DURATION as DURATION_PP005 } from './lib/pp005.ts';
import { DURATION as DURATION_PP006 } from './lib/pp006.ts';
import { DURATION as DURATION_PP007 } from './lib/pp007.ts';
import { DURATION as DURATION_PP008 } from './lib/pp008.ts';
import { DURATION as DURATION_PC006 } from './lib/pc006.ts';
import { DURATION as DURATION_PC007 } from './lib/pc007.ts';
import { DURATION as DURATION_016 } from './lib/reel016.ts';
import { DURATION as DURATION_PC005 } from './lib/pc005.ts';
import { DURATION as DURATION_015 } from './lib/reel015.ts';
import { DURATION as DURATION_010 } from './lib/reel010.ts';
import { DURATION as DURATION_011 } from './lib/reel011.ts';
import { DURATION as DURATION_012 } from './lib/reel012.ts';
import { DURATION as DURATION_PM003 } from './lib/pm003.ts';
import { SoundMind001 } from './SoundMind001.tsx';
import { DURATION as DURATION_SM001 } from './lib/sm001.ts';
import { SoundMind002 } from './SoundMind002.tsx';
import { DURATION as DURATION_SM002 } from './lib/sm002.ts';
import { SoundMind003 } from './SoundMind003.tsx';
import { SoundMind004 } from './SoundMind004.tsx';
import { DURATION as DURATION_SM003 } from './lib/sm003.ts';
import { DURATION as DURATION_SM004 } from './lib/sm004.ts';

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
    <Composition id="PvPhysics005" component={PvPhysics005} durationInFrames={Math.round(DURATION_PP005 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics005Cover" component={PvPhysics005} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvPhysics006" component={PvPhysics006} durationInFrames={Math.round(DURATION_PP006 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics006Cover" component={PvPhysics006} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvPhysics007" component={PvPhysics007} durationInFrames={Math.round(DURATION_PP007 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvPhysics007Cover" component={PvPhysics007} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvPhysics008" component={PvPhysics008} durationInFrames={Math.round(DURATION_PP008 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false, voice: false }} />
    <Composition id="PvPhysics008Voice" component={PvPhysics008} durationInFrames={Math.round(DURATION_PP008 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false, voice: true }} />
    <Still id="PvPhysics008Cover" component={PvPhysics008} width={1080} height={1920} defaultProps={{ cover: true, voice: false }} />
    <Composition id="PvChem006" component={PvChem006} durationInFrames={Math.round(DURATION_PC006 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvChem006Cover" component={PvChem006} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="PvChem007" component={PvChem007} durationInFrames={Math.round(DURATION_PC007 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false, voice: false }} />
    <Composition id="PvChem007Voice" component={PvChem007} durationInFrames={Math.round(DURATION_PC007 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false, voice: true }} />
    <Still id="PvChem007Cover" component={PvChem007} width={1080} height={1920} defaultProps={{ cover: true, voice: false }} />
    <Composition id="Reel016" component={Reel016} durationInFrames={Math.round(DURATION_016 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel016Cover" component={Reel016} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="DemoPhysics" component={DemoPhysics} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="DemoParticles" component={DemoParticles} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="PvChem005" component={PvChem005} durationInFrames={Math.round(DURATION_PC005 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="PvChem005Cover" component={PvChem005} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Reel015" component={Reel015} durationInFrames={Math.round(DURATION_015 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel015Cover" component={Reel015} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Reel010" component={Reel010} durationInFrames={Math.round(DURATION_010 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel010Cover" component={Reel010} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Reel011" component={Reel011} durationInFrames={Math.round(DURATION_011 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel011Cover" component={Reel011} width={1080} height={1920} defaultProps={{ cover: true }} />
    <Composition id="Reel012" component={Reel012} durationInFrames={Math.round(DURATION_012 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="Reel012Cover" component={Reel012} width={1080} height={1920} defaultProps={{ cover: true }} />
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
    <Composition id="SoundMind004" component={SoundMind004} durationInFrames={Math.round(DURATION_SM004 * 30)} fps={30} width={1080} height={1920} defaultProps={{ cover: false }} />
    <Still id="SoundMind004Cover" component={SoundMind004} width={1080} height={1920} defaultProps={{ cover: true }} />
  </>
);
