// Old engine reel (left) beside its Remotion remake (right), playing together, for judging the trial on a phone.
// Both MP4s are copied into public/ by `npm run compare:files`; the sound is the remake's (the same music).
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { SOFT_UI } from './lib/palette.ts';

const Side = ({ x, label, color, src, muted }: { x: number; label: string; color: string; src: string; muted: boolean }) => (
  <div style={{ position: 'absolute', left: x, top: 0, width: 540 }}>
    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 36px ${SOFT_UI}`, color }}>{label}</div>
    <OffthreadVideo src={staticFile(src)} muted={muted} style={{ width: 540, height: 960, display: 'block' }} />
  </div>
);

export const Compare005 = () => (
  <AbsoluteFill style={{ background: '#222' }}>
    <Side x={0} label="OLD (engine)" color="#ffffff" src="nda-maths-005-area.mp4" muted />
    <Side x={540} label="NEW (Remotion)" color="#4fd1a5" src="nda-maths-005-area-remotion.mp4" muted={false} />
  </AbsoluteFill>
);

// @pyqvault_ Physics #8 as queued (left) beside its remake under framework F24, bright objects (right), founder 2026-10-21.
export const Compare008 = () => (
  <AbsoluteFill style={{ background: '#222' }}>
    <Side x={0} label="FIRST (queued)" color="#ffffff" src="pv-physics-008-spoon-voice.mp4" muted />
    <Side x={540} label="VIVID (F24)" color="#4fd1a5" src="pv-physics-008-spoon-vivid-voice.mp4" muted={false} />
  </AbsoluteFill>
);
