// Sound Mind "ME" reel palettes. MUTED is the original look (cream paper, sage, beige); VIVID is the brighter one the
// founder asked for on 2026-10-20 (morning-blue sky, fresh greens, terracotta pot, coral bloom, candy-coloured remarks).
// Text is always the green-grey ink; tests/smPalette.test.ts keeps it readable (WCAG AA) on every background.

export type SmPalette = {
  paper: string; ink: string; soft: string; sage: string; leaf: string; hill: string; grass: string; drop: string; cloud: string;
  warm: string; white: string; pot: string;
  skyTop: string; skyBottom: string; sunFill: string; sunStroke: string; sunGlow: string;
  cheek: string; petal: string; flowerCenter: string; bloomPetal: string; bloomCenter: string;
  card: string; cardSolid: string; cardBorder: string;
  can: string; water: string; crow: string; crowWing: string; beak: string; pills: string[];
  mood: string; moodOpacity: number;
};

export const MUTED: SmPalette = {
  paper: '#F6F1E7', ink: '#2F3A33', soft: '#5E6B62', sage: '#8FAE8B', leaf: '#DCE8D3', hill: '#C9D8C2', grass: '#B3CBA9',
  drop: '#E4EAEE', cloud: '#CDD3D8', warm: '#EBC097', white: '#FFFFFF', pot: '#D9C7AE',
  skyTop: '#F6F1E7', skyBottom: '#EEE6D4', sunFill: '#EBC097', sunStroke: '#2F3A33', sunGlow: '#EBC097',
  cheek: '#EBC097', petal: '#FFFFFF', flowerCenter: '#EBC097', bloomPetal: '#EBC097', bloomCenter: '#F3D9A4',
  card: 'rgba(246,241,231,0.92)', cardSolid: '#F6F1E7', cardBorder: '#8FAE8B',
  can: '#DCE8D3', water: '#CFE0EA', crow: '#3B4540', crowWing: '#4A5550', beak: '#EBC097', pills: ['#FFFFFF'],
  mood: '#8E9AA3', moodOpacity: 0.16,
};

export const VIVID: SmPalette = {
  ...MUTED,
  paper: '#FFF7EE', soft: '#4E5A52', sage: '#3FA34D', leaf: '#8BD17C', hill: '#8FD6AE', grass: '#6CC58A', pot: '#E2724A',
  skyTop: '#A9DDF3', skyBottom: '#FFE2C2', sunFill: '#FFC93C', sunStroke: '#E07A1F', sunGlow: '#FFD9A0',
  cheek: '#FF8FA3', petal: '#FFFFFF', flowerCenter: '#FFD23F', bloomPetal: '#FF6F91', bloomCenter: '#FFD23F',
  card: 'rgba(255,255,255,0.94)', cardSolid: '#FFFFFF', cardBorder: '#FF6F91',
  can: '#2EC4B6', water: '#7FD3F7', crow: '#2B2D42', crowWing: '#3D405B', beak: '#FF9F1C',
  pills: ['#FFD6E0', '#FFF1B5', '#CDEFFF', '#D8F5C9', '#E9D7FF'],
  mood: '#7D8CA3', moodOpacity: 0.1,
};
