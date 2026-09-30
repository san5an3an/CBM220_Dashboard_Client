import { GradeChip } from "@/components/foundations";
import type { Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type FilterChipProps = {
  label: string;
  count: string;
  active?: boolean;
  grade?: Grade;
  onClick?: () => void;
};

// 등급·건수를 함께 보여주고 눌러서 켜고 끄는 필터 칩 표시
export function FilterChip({ label, count, active = false, grade, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border pr-3 pl-1.5 transition-[background-color,border-color,box-shadow] duration-200 ${
        active
          ? "border-(--accent-cyan)/60 bg-(--accent-cyan)/16 shadow-[0px_0px_5px_0px_color-mix(in_srgb,var(--accent-cyan)_25%,transparent)]"
          : "border-(--border-default) bg-(--neutral-hover) hover:border-(--border-strong)"
      } ${grade ? "" : "pl-3"}`}
    >
      {grade && <GradeChip grade={grade} size={20} />}
      <span className={`font-semibold whitespace-nowrap ${TEXT.labelLarge} ${active ? "text-(--text-primary)" : "text-(--text-secondary)"}`}>{label}</span>
      <span className={`font-medium whitespace-nowrap tabular-nums ${TEXT.labelMedium} ${active ? "text-(--accent-cyan)" : "text-(--text-tertiary)"}`}>{count}</span>
    </button>
  );
}
