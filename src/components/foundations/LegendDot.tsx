import { STATUS, type Status, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type LegendDotProps = {
  label: string;
  status: Status;
  // 운행·고장처럼 살아 있는 상태는 점이 숨 쉬듯 빛나도록 지정
  live?: boolean;
};

// 운행 상태 범례를 빛나는 점과 문구로 표시
export function LegendDot({ label, status, live = status === "run" || status === "fault" }: LegendDotProps) {
  const token = STATUS[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`size-2 shrink-0 rounded-full ${live ? "animate-[legend-pulse_1.8s_ease-in-out_infinite]" : ""}`}
        style={{ background: `var(${token})`, boxShadow: `0 0 6px ${tint(token, 100)}`, ["--pulse" as string]: tint(token, 70) }}
      />
      <span className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelMedium}`}>{label}</span>
    </span>
  );
}
