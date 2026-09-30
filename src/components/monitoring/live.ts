"use client";

import { useEffect, useRef, useState } from "react";

export { useInterval } from "@/components/dashboard/charts/useInterval";

// 서버와 브라우저의 첫 화면이 같도록 고정 시드 난수 생성
export function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// 화면 오른쪽을 0도로 시계 방향 각도의 원 위 점 계산
export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

// 시작 각도에서 끝 각도까지 시계 방향으로 도는 호의 SVG 경로 생성
export function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

// 숫자 배열이 바뀔 때마다 각 값이 이전 값에서 새 값까지 함께 이어지는 배열 반환
export function useAnimatedList(target: number[], ms = 1000) {
  const [shown, setShown] = useState(() => target.map(() => 0));
  const from = useRef(target.map(() => 0));
  const key = target.join(",");

  useEffect(() => {
    const goal = key.split(",").map(Number);
    const begin = goal.map((_, i) => from.current[i] ?? 0);
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - (1 - p) ** 3;
      const next = goal.map((g, i) => begin[i] + (g - begin[i]) * e);
      from.current = next;
      setShown(next);
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, ms]);

  return shown;
}
