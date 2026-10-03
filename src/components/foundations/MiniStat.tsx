"use client";

import { useCountText } from "@/lib/motion";
import { TONE, type Tone } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type MiniStatProps = {
  label: string;
  value: string;
  tone?: Extract<Tone, "coral" | "mint" | "amber" | "cyan">;
};

// 라벨과 차오르는 값을 세로로 쌓은 미니 수치 표시
export function MiniStat({ label, value, tone = "coral" }: MiniStatProps) {
  const shown = useCountText(value, 900);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
      <p className={`font-bold tabular-nums ${TEXT.titleMedium}`} style={{ color: `var(${TONE[tone]})` }}>
        {shown}
      </p>
    </div>
  );
}
