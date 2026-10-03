import { TEXT } from "@/lib/typography";

type CalendarLegendItemProps = {
  type: "range" | "missing" | "today" | "unavailable";
  label: string;
};

const SAMPLE = { missing: "19", today: "23", unavailable: "24" } as const;

// 달력 칸 모양을 그대로 줄인 미니 칸과 설명 문구로 범례 표시
export function CalendarLegendItem({ type, label }: CalendarLegendItemProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {type === "range" ? (
        <span className="flex items-center rounded-[5px] bg-(--accent-cyan)/12">
          <span className="size-[18px] rounded-[5px] bg-(image:--gradient-accent) shadow-[0px_0px_6px_0px_color-mix(in_srgb,var(--accent-cyan)_50%,transparent)]" />
          <span className="h-[18px] w-2" />
          <span className="size-[18px] rounded-[5px] bg-(image:--gradient-accent)" />
        </span>
      ) : (
        <span
          className={`flex h-[18px] w-[22px] items-center justify-center rounded-[5px] font-semibold ${TEXT.labelSmall} ${
            type === "today"
              ? "border border-(--accent-cyan)/50 text-(--text-primary)"
              : type === "missing"
                ? "text-(--status-warning)"
                : "text-(--text-tertiary)"
          }`}
        >
          {SAMPLE[type]}
        </span>
      )}
      <span className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{label}</span>
    </span>
  );
}
