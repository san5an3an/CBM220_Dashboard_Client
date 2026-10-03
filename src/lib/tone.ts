// 컴포넌트 톤 이름을 색 토큰 CSS 변수로 연결
export const TONE = {
  cyan: "--accent-cyan",
  violet: "--accent-violet",
  mint: "--status-success",
  amber: "--status-warning",
  coral: "--status-danger",
  slate: "--grade-d",
} as const;

export type Tone = keyof typeof TONE;

// 운행 상태 이름을 색 토큰 CSS 변수로 연결
export const STATUS = {
  run: "--status-success",
  inspect: "--status-warning",
  fault: "--status-danger",
  base: "--blue-500",
  end: "--grade-d",
  normal: "--accent-cyan",
} as const;

export type Status = keyof typeof STATUS;

// 운행 상태 이름 지정
export const STATUS_NAME: Record<Status, string> = { run: "운행", inspect: "점검", fault: "고장", base: "기지", end: "종료", normal: "정상" };

// 경보 등급을 색 토큰 CSS 변수로 연결
export const GRADE = {
  A: "--grade-a",
  B: "--grade-b",
  C: "--grade-c",
  D: "--grade-d",
  W: "--grade-w",
} as const;

export type Grade = keyof typeof GRADE;

// 색 토큰에 투명도를 섞은 CSS 색 생성
export const tint = (token: string, percent: number) => `color-mix(in srgb, var(${token}) ${percent}%, transparent)`;

// 색 토큰에 흰색이나 검은색을 섞어 밝기를 바꾼 CSS 색 생성
export const shade = (token: string, mix: "white" | "black", percent: number) =>
  `color-mix(in srgb, var(${token}), ${mix} ${percent}%)`;
