import { TONE, type Tone } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type LegendItemProps = {
  label: string;
  tone: Tone;
};

// 차트 계열 범례를 둥근 사각 점과 문구로 표시
export function LegendItem({ label, tone }: LegendItemProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: `var(${TONE[tone]})` }} />
      <span className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{label}</span>
    </span>
  );
}
