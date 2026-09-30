"use client";

import { useAnimatedNumber } from "@/lib/motion";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type DeviceBar3DProps = {
  rank: number;
  name: string;
  // 결함 비율(0~100) 지정
  percent: number;
};

// 결함 장치 순위·이름·비율을 윗면 광택이 있는 입체 막대로 표시
export function DeviceBar3D({ rank, name, percent }: DeviceBar3DProps) {
  const shown = useAnimatedNumber(Math.max(0, Math.min(100, percent)), 1200);
  return (
    <div className="flex w-[340px] items-center gap-2.5">
      <span className="flex size-5 shrink-0 items-center justify-center overflow-clip rounded-[6px] border border-(--white)/8 bg-(--white)/7">
        <span className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{rank}</span>
      </span>
      <p className={`w-32 shrink-0 truncate text-(--text-primary) ${TEXT.bodyMedium}`}>{name}</p>
      <div className="relative h-3.5 min-w-px flex-1 overflow-clip rounded-[7px] bg-(--white)/5">
        <div
          className="relative h-full overflow-hidden rounded-[7px]"
          style={{ width: `${shown}%`, boxShadow: `0 0 10px 0 ${tint("--accent-cyan", 50)}` }}
        >
          <span className="absolute inset-0 rounded-[7px] bg-linear-to-r from-(--blue-500) to-(--accent-cyan)" />
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[bar-flow_2.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-(--white)/35 to-transparent" />
          <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_3px_1px_0px_rgba(255,255,255,0.55)]" />
        </div>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_3px_0px_rgba(0,0,0,0.6)]" />
      </div>
      <p className={`w-9 shrink-0 text-right font-semibold text-(--text-primary) tabular-nums ${TEXT.labelLarge}`}>{Math.round(shown)}%</p>
    </div>
  );
}
