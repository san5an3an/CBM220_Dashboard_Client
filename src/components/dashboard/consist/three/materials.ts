import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import type { CarState } from "../data";

// 차량 상태별 색 토큰 지정
export const STATE_TOKEN: Record<CarState, string> = {
  normal: "--status-success",
  warning: "--status-warning",
  danger: "--status-danger",
  selected: "--accent-cyan",
};

// 화면에 적용된 색 토큰 값 조회
export function cssColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#ffffff";
}

const std = (color: string, extra: Partial<MeshStandardMaterial> = {}) =>
  Object.assign(new MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.45 }), extra);

// 스테인리스 차체와 부품 재질 정의
export const MAT = {
  body: std("#d3dbeb", { metalness: 0.15, roughness: 0.45 }),
  roofEquip: std("#8c98b6"),
  door: std("#e8edf8", { metalness: 0.15, roughness: 0.4 }),
  seam: std("#5f6b8c"),
  glass: std("#1c3160", { metalness: 0.2, roughness: 0.15, emissive: new Color("#12306a"), emissiveIntensity: 0.35 }),
  mullion: std("#d6deee"),
  under: std("#161c36", { metalness: 0.2, roughness: 0.8 }),
  skirt: std("#1b2244", { metalness: 0.2, roughness: 0.7 }),
  wheel: std("#3a4468", { metalness: 0.6, roughness: 0.4 }),
  hub: std("#afc0e8", { metalness: 0.6, roughness: 0.3 }),
  gangway: std("#1a2140", { roughness: 0.7 }),
  bellows: std("#1d2448", { roughness: 0.9 }),
  pantograph: std("#c9d3e6", { metalness: 0.7, roughness: 0.3 }),
  windshield: std("#122450", { metalness: 0.3, roughness: 0.1, emissive: new Color("#1e3563"), emissiveIntensity: 0.4 }),
  destSign: std("#05091a"),
  headlight: new MeshBasicMaterial({ color: "#fff7d0" }),
};

const stripeCache = new Map<string, MeshStandardMaterial>();

// 상태 색 노선 띠 재질 생성
export function stripeMaterial(color: string) {
  let m = stripeCache.get(color);
  if (!m) {
    m = std(color, { emissive: new Color(color), emissiveIntensity: 0.55, metalness: 0.1, roughness: 0.5 });
    stripeCache.set(color, m);
  }
  return m;
}

// 가운데가 밝고 가장자리로 흐려지는 원형 그라데이션 생성
export function radialTexture(color: string, inner = 0.9) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  const c = new Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  g.addColorStop(0, `rgba(${rgb},${inner})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function glowMaterial(color: string, opacity: number) {
  return new MeshBasicMaterial({
    map: radialTexture(color),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}
