// CBM color tokens — dark: Figma 적용값 / light: 대응 설계값 / alpha: #RRGGBBAA

export type ThemeMode = 'light' | 'dark';
export type ModeValue<T = string> = Record<ThemeMode, T>;

// Primitive palette
export const palette = {
  'cyan/400': '#3BE3FF',
  'cyan/600': '#0EA5C6',
  'cyan/700': '#0B7F9A',
  'violet/400': '#8B6CFF',
  'violet/600': '#6B4EF0',
  'blue/500': '#4C8DFF',
  'indigo/500': '#6B5CFF',
  'mint/400': '#2EE6A0',
  'mint/600': '#0FA876',
  'amber/400': '#FFB547',
  'amber/600': '#D98A0B',
  'coral/400': '#FF4F6E',
  'coral/600': '#DC3C5B',
  'orange/400': '#FF8A3D',
  'yellow/400': '#FFD24D',
  'slate/400': '#7A86A8',
  'navy/950': '#04060E',
  'navy/900': '#070B18',
  'navy/850': '#0A1230',
  'navy/800': '#0F1838',
  'navy/750': '#111B3A',
  'navy/700': '#18234A',
  'navy/650': '#1E2B5A',
  'ink/100': '#EEF3FF',
  'ink/300': '#9AA6C8',
  'ink/500': '#5A6488',
  white: '#FFFFFF',
} as const;

// Semantic color tokens
export const colors = {
  // background
  'background/page':        { light: '#F3F6FC', dark: '#070B18' },
  'background/page-deep':   { light: '#E9EEF8', dark: '#04060E' },
  'background/rail':        { light: '#FFFFFF', dark: '#0F1838' },
  'background/dim':         { light: '#0F163373', dark: '#04060ED9' },

  // neutral surfaces
  'neutral/panel':          { light: '#FFFFFF', dark: '#111B3A' },
  'neutral/panel-end':      { light: '#F8FAFE', dark: '#0A112C' },
  'neutral/card':           { light: '#F7F9FD', dark: '#FFFFFF06' },
  'neutral/tile':           { light: '#FFFFFF', dark: '#18244A' },
  'neutral/sheet':          { light: '#FFFFFF', dark: '#111B3E' },
  'neutral/popover':        { light: '#FFFFFF', dark: '#17224AFA' },
  'neutral/table-header':   { light: '#EEF2FA', dark: '#18234A' },
  'neutral/table-group':    { light: '#E4EAF6', dark: '#1E2B5A' },
  'neutral/input':          { light: '#FFFFFF', dark: '#0508148C' },
  'neutral/control':        { light: '#F1F4FA', dark: '#FFFFFF0D' },
  'neutral/hover':          { light: '#0F16330A', dark: '#FFFFFF0F' },
  'neutral/skeleton':       { light: '#0F16330F', dark: '#FFFFFF14' },
  'neutral/track':          { light: '#0F163314', dark: '#FFFFFF14' },

  // border
  'border/subtle':          { light: '#0F16330F', dark: '#FFFFFF0F' },
  'border/default':         { light: '#0F16331A', dark: '#FFFFFF12' },
  'border/strong':          { light: '#0F163329', dark: '#FFFFFF1A' },
  'border/focus':           { light: '#0EA5C6', dark: '#3BE3FF' },
  'border/sheet':           { light: '#0EA5C64D', dark: '#3BE3FF4D' },
  'border/error':           { light: '#DC3C5B', dark: '#FF4F6E' },

  // text
  'text/primary':           { light: '#0E1633', dark: '#EEF3FF' },
  'text/secondary':         { light: '#4A5578', dark: '#9AA6C8' },
  'text/tertiary':          { light: '#7A84A6', dark: '#5A6488' },
  'text/disabled':          { light: '#AAB2CC', dark: '#5A648899' },
  'text/on-accent':         { light: '#FFFFFF', dark: '#06102A' },
  'text/on-primary':        { light: '#FFFFFF', dark: '#FFFFFF' },
  'text/link':              { light: '#0B7F9A', dark: '#3BE3FF' },

  // brand / accent
  'accent/cyan':            { light: '#0EA5C6', dark: '#3BE3FF' },
  'accent/violet':          { light: '#6B4EF0', dark: '#8B6CFF' },
  'accent/cyan-subtle':     { light: '#0EA5C61A', dark: '#3BE3FF1F' },
  'accent/violet-subtle':   { light: '#6B4EF01A', dark: '#8B6CFF1F' },
  'accent/cyan-glow':       { light: '#0EA5C640', dark: '#3BE3FF59' },

  // status
  'status/success':         { light: '#0FA876', dark: '#2EE6A0' },
  'status/success-subtle':  { light: '#0FA8761A', dark: '#2EE6A024' },
  'status/success-border':  { light: '#0FA87659', dark: '#2EE6A073' },
  'status/warning':         { light: '#D98A0B', dark: '#FFB547' },
  'status/warning-subtle':  { light: '#D98A0B1A', dark: '#FFB54714' },
  'status/warning-border':  { light: '#D98A0B59', dark: '#FFB54740' },
  'status/danger':          { light: '#DC3C5B', dark: '#FF4F6E' },
  'status/danger-subtle':   { light: '#DC3C5B1A', dark: '#FF4F6E1F' },
  'status/danger-border':   { light: '#DC3C5B59', dark: '#FF4F6E59' },
  'status/info':            { light: '#0EA5C6', dark: '#3BE3FF' },
  'status/info-subtle':     { light: '#0EA5C61A', dark: '#3BE3FF1F' },
  'status/neutral':         { light: '#7A84A6', dark: '#9AA6C8' },
  'status/neutral-subtle':  { light: '#0F16330D', dark: '#FFFFFF0F' },

  // button
  'button/secondary-bg':    { light: '#FFFFFF', dark: '#FFFFFF0D' },
  'button/secondary-border':{ light: '#0F163324', dark: '#FFFFFF1A' },
  'button/secondary-text':  { light: '#0E1633', dark: '#EEF3FF' },
  'button/ghost-text':      { light: '#4A5578', dark: '#9AA6C8' },
  'button/success-bg':      { light: '#0FA8761A', dark: '#2EE6A024' },
  'button/success-text':    { light: '#0FA876', dark: '#2EE6A0' },

  // alarm grade (A~D, W)
  'grade/a':                { light: '#DC3C5B', dark: '#FF4F6E' },
  'grade/b':                { light: '#E0701F', dark: '#FF8A3D' },
  'grade/c':                { light: '#C99A12', dark: '#FFD24D' },
  'grade/d':                { light: '#6B7596', dark: '#7A86A8' },
  'grade/w':                { light: '#6B4EF0', dark: '#8B6CFF' },

  // chart / data-viz
  'chart/series-1':         { light: '#0EA5C6', dark: '#3BE3FF' },
  'chart/series-2':         { light: '#6B4EF0', dark: '#8B6CFF' },
  'chart/series-3':         { light: '#0FA876', dark: '#2EE6A0' },
  'chart/series-4':         { light: '#D98A0B', dark: '#FFB547' },
  'chart/series-5':         { light: '#DC3C5B', dark: '#FF4F6E' },
  'chart/threshold':        { light: '#D98A0B', dark: '#FFB547' },
  'chart/over-threshold':   { light: '#DC3C5B', dark: '#FF4F6E' },
  'chart/grid':             { light: '#0F16330F', dark: '#FFFFFF0D' },
  'chart/axis':             { light: '#0F163329', dark: '#FFFFFF24' },
  'chart/axis-label':       { light: '#7A84A6', dark: '#5A6488' },
  'chart/heat-low':         { light: '#8B7CF0', dark: '#8B6CFF' },  // < 5%
  'chart/heat-mid':         { light: '#22B8D6', dark: '#3BE3FF' },  // 5 – 10%
  'chart/heat-high':        { light: '#E59A1F', dark: '#FFB547' },  // 10 – 20%
  'chart/heat-critical':    { light: '#E0476A', dark: '#FF4F6E' },  // ≥ 20%
  'chart/3d-top-highlight': { light: '#FFFFFFD9', dark: '#FFFFFF8C' },

  // calendar / date picker
  'calendar/range-bg':      { light: '#0EA5C61A', dark: '#3BE3FF1F' },
  'calendar/today-border':  { light: '#0EA5C699', dark: '#3BE3FF80' },
  'calendar/missing':       { light: '#D98A0B', dark: '#FFB547' },
  'calendar/sunday':        { light: '#DC3C5B', dark: '#FF4F6E' },

  // effect colors (shadow / glow)
  'effect/shadow-panel':    { light: '#0F163314', dark: '#00000073' },
  'effect/shadow-popover':  { light: '#0F163329', dark: '#00000099' },
  'effect/inner-highlight': { light: '#FFFFFFCC', dark: '#FFFFFF12' },
} as const satisfies Record<string, ModeValue>;

// Gradient tokens
export type GradientStop = { color: string; position: number };
export type Gradient = { angle: number; stops: GradientStop[] };

export const gradients = {
  'gradient/page': {
    light: { angle: 180, stops: [{ color: '#F6F8FD', position: 0 }, { color: '#EEF2FA', position: 1 }] },
    dark:  { angle: 180, stops: [{ color: '#0A1230', position: 0 }, { color: '#070B18', position: 0.5 }, { color: '#04060E', position: 1 }] },
  },
  'gradient/panel': {
    light: { angle: 180, stops: [{ color: '#FFFFFF', position: 0 }, { color: '#F8FAFE', position: 1 }] },
    dark:  { angle: 180, stops: [{ color: '#111B3A', position: 0 }, { color: '#0A112C', position: 1 }] },
  },
  'gradient/sheet': {
    light: { angle: 180, stops: [{ color: '#FFFFFF', position: 0 }, { color: '#F6F8FD', position: 1 }] },
    dark:  { angle: 180, stops: [{ color: '#111B3E', position: 0 }, { color: '#0A1130', position: 1 }] },
  },
  'gradient/dialog': {
    light: { angle: 180, stops: [{ color: '#FFFFFF', position: 0 }, { color: '#F4F7FC', position: 1 }] },
    dark:  { angle: 180, stops: [{ color: '#17244D', position: 0 }, { color: '#0B1331', position: 1 }] },
  },
  'gradient/primary': {
    light: { angle: 90, stops: [{ color: '#3B7BF5', position: 0 }, { color: '#5B4CF0', position: 1 }] },
    dark:  { angle: 90, stops: [{ color: '#4C8DFF', position: 0 }, { color: '#6B5CFF', position: 1 }] },
  },
  'gradient/danger': {
    light: { angle: 90, stops: [{ color: '#EF5A77', position: 0 }, { color: '#C9354F', position: 1 }] },
    dark:  { angle: 90, stops: [{ color: '#FF6984', position: 0 }, { color: '#D9435E', position: 1 }] },
  },
  'gradient/accent': {
    light: { angle: 90, stops: [{ color: '#0EA5C6', position: 0 }, { color: '#6B4EF0', position: 1 }] },
    dark:  { angle: 90, stops: [{ color: '#3BE3FF', position: 0 }, { color: '#8B6CFF', position: 1 }] },
  },
  'gradient/selected-row': {
    light: { angle: 90, stops: [{ color: '#0EA5C61F', position: 0 }, { color: '#6B4EF00F', position: 1 }] },
    dark:  { angle: 90, stops: [{ color: '#3BE3FF29', position: 0 }, { color: '#8B6CFF14', position: 1 }] },
  },
  'gradient/dim': {
    light: { angle: 180, stops: [{ color: '#0F163340', position: 0 }, { color: '#0F16338C', position: 1 }] },
    dark:  { angle: 180, stops: [{ color: '#04060E59', position: 0 }, { color: '#04060ED9', position: 1 }] },
  },
} as const satisfies Record<string, ModeValue<Gradient>>;

// Helpers
export type ColorToken = keyof typeof colors;
export type GradientToken = keyof typeof gradients;

// 단일 색상 조회
export const getColor = (token: ColorToken, mode: ThemeMode): string => colors[token][mode];

// CSS linear-gradient 변환
export const toCssGradient = (token: GradientToken, mode: ThemeMode): string => {
  const g = gradients[token][mode];
  const stops = g.stops.map((s) => `${s.color} ${Math.round(s.position * 100)}%`).join(', ');
  return `linear-gradient(${g.angle}deg, ${stops})`;
};

// 모드별 토큰 맵
export const resolveTheme = (mode: ThemeMode): Record<ColorToken, string> =>
  Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, v[mode]])) as Record<ColorToken, string>;

// CSS 변수 맵 (--neutral-card)
export const toCssVariables = (mode: ThemeMode): Record<string, string> =>
  Object.fromEntries(Object.entries(resolveTheme(mode)).map(([k, v]) => [`--${k.replace('/', '-')}`, v]));
