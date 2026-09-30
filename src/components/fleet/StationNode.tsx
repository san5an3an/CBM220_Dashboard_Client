"use client";

import type { CSSProperties } from "react";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { Train3D } from "./Train3D";
import type { Direction } from "./tone";

type StationNodeProps = {
  name?: string;
  // 역 이름을 점 위나 아래에 두도록 지정
  label?: "top" | "bottom";
  showName?: boolean;
  // 정차 중인 열차 방향을 지정하고 없으면 빈 역으로 표시
  train?: Direction | null;
  trainNo?: string;
  // 역 점 테두리 색 토큰 지정
  token?: string;
  // 열차를 따로 그릴 때 역 점만 빛나도록 지정
  docked?: boolean;
};

// 노선 역 점과 이름, 정차한 열차를 표시
export function StationNode({ name = "청량리", label = "top", showName = true, train = null, trainNo = "401", token = "--accent-cyan", docked = false }: StationNodeProps) {
  const bottom = label === "bottom";
  const title = showName && <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{name}</p>;
  return (
    <div className={`relative flex w-[34px] shrink-0 flex-col items-center ${bottom ? "gap-1.5" : "gap-4"}`}>
      {!bottom && title}
      {/* 열차가 서 있으면 역 점이 숨 쉬듯 빛나도록 표시 */}
      <div
        className={`size-2.5 shrink-0 rounded-full border-2 bg-(--navy-900) ${train || docked ? "animate-[legend-pulse_1.8s_ease-in-out_infinite]" : ""}`}
        style={{ borderColor: `var(${token})`, boxShadow: `0 0 6px 0 ${tint(token, 60)}`, "--pulse": tint(token, 80) } as CSSProperties}
      />
      {bottom && title}
      {train && (
        <div
          key={`${train}-${trainNo}`}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ ...(bottom ? { top: -15 } : { bottom: 3 }), animation: `${train === "up" ? "dock-left" : "dock-right"} 600ms ease-out both` }}
        >
          <Train3D dir={train} number={trainNo} />
        </div>
      )}
    </div>
  );
}
