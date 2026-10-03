import { gradients, palette, toCssGradient, toCssVariables, type ColorToken, type ThemeMode } from "./colorTokens";

export * from "./colorTokens";

// 디자인 기본값인 다크 모드로 시작
export const DEFAULT_MODE: ThemeMode = "dark";

const cssName = (token: string) => `--${token.replace("/", "-")}`;

// 토큰 이름을 CSS 변수 참조로 변환
export const tokenVar = (token: ColorToken) => `var(${cssName(token)})`;

// 모드별 색·팔레트·그라데이션 CSS 변수 생성
function modeBlock(mode: ThemeMode) {
  const vars = {
    ...Object.fromEntries(Object.entries(palette).map(([k, v]) => [cssName(k), v])),
    ...toCssVariables(mode),
    ...Object.fromEntries(Object.keys(gradients).map((k) => [cssName(k), toCssGradient(k as keyof typeof gradients, mode)])),
  };
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
}

// 다크는 기본값과 data-theme="dark", 라이트는 data-theme="light" 에 적용
export const themeCss = `:root,[data-theme="dark"]{${modeBlock("dark")}}[data-theme="light"]{${modeBlock("light")}}`;
