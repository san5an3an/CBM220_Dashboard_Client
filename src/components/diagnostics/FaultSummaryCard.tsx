import { GradeChip } from "@/components/foundations/GradeChip";
import { GRADE, type Grade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { GRADE_NAME } from "./grade";

type FaultSummaryCardProps = {
  grade?: Grade;
  no?: string;
  title?: string;
  desc?: string;
  // 등급 이름 대신 보여줄 문구 지정
  gradeLabel?: string;
  width?: number | string;
};

// 선택한 고장의 등급·번호·제목·설명을 등급 색 빛이 번지는 카드로 표시
export function FaultSummaryCard({ grade = "A", no = "#0001", title = "BECU-PB not showing as applying", desc = "스위치 고장으로 인한 화재 감지 장치 CPUM 고장", gradeLabel, width = 380 }: FaultSummaryCardProps) {
  const token = GRADE[grade];
  return (
    <div
      key={`${grade}-${no}`}
      className="relative flex animate-[pop-in_300ms_ease-out] flex-col items-start gap-2 overflow-clip rounded-[18px] border px-[18px] py-4"
      style={{ width, borderColor: tint(token, 55), boxShadow: `0 6px 24px 0 ${tint(token, 25)}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{ backgroundImage: `linear-gradient(163deg, ${tint(token, 20)}, ${tint("--accent-violet", 5)})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-81px] left-[259px] size-40 animate-[glow-breathe_4s_ease-in-out_infinite] rounded-full blur-[30px]"
        style={{ background: tint(token, 30) }}
      />
      <div className="relative flex w-full items-center gap-2">
        <GradeChip grade={grade} />
        <p className={`min-w-px flex-1 font-semibold ${TEXT.labelLarge}`} style={{ color: `var(${token})` }}>
          {gradeLabel ?? GRADE_NAME[grade]}
        </p>
        <p className={`shrink-0 font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelMedium}`}>{no}</p>
      </div>
      <p className={`relative w-full font-bold text-(--text-primary) ${TEXT.titleMedium}`}>{title}</p>
      <p className={`relative w-full text-(--text-secondary) ${TEXT.bodyMedium}`}>{desc}</p>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.1)]" />
    </div>
  );
}
