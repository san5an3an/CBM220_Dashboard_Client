"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

// 차트 안에서 가로로 끈 위치를 값 범위로 바꿔 넘기는 누르기 처리기 생성
export function dragValue(
  // 차트 원래 폭(px) 기준 플롯 왼쪽·폭과 값 범위 지정
  plot: { left: number; width: number; width0: number; min: number; max: number },
  onChange: (v: number) => void,
) {
  return (e: ReactPointerEvent) => {
    const el = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-chart]");
    if (!el) return;
    e.preventDefault();
    const move = (clientX: number) => {
      const r = el.getBoundingClientRect();
      const scale = r.width / plot.width0;
      const px = (clientX - r.left) / scale;
      const t = Math.max(0, Math.min(1, (px - plot.left) / plot.width));
      onChange(plot.min + t * (plot.max - plot.min));
    };
    move(e.clientX);
    const onMove = (ev: PointerEvent) => move(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
}
