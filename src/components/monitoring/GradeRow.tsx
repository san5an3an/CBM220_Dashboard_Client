"use client";

import { GradeChip } from "@/components/foundations";
import { useAnimatedNumber } from "@/lib/motion";
import { GRADE, type Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type GradeRowProps = {
  grade: Grade;
  name: string;
  count: number;
};

// 경보 등급 칩·이름·건수를 한 줄 범례로 표시
export function GradeRow({ grade, name, count }: GradeRowProps) {
  const shown = useAnimatedNumber(count, 1000);
  return (
    <div className="flex w-[150px] items-center gap-2">
      <GradeChip grade={grade} />
      <p className={`min-w-px flex-1 truncate text-(--text-secondary) ${TEXT.bodySmall}`}>{name}</p>
      <p className={`shrink-0 font-semibold whitespace-nowrap tabular-nums ${TEXT.labelLarge}`} style={{ color: `var(${GRADE[grade]})` }}>
        {Math.round(shown)}
      </p>
    </div>
  );
}
