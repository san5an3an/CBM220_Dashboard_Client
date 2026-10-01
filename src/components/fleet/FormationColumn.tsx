"use client";

import { IsoPillar } from "@/components/foundations/IsoPillar";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { useAnimatedNumber } from "@/lib/motion";
import { STATUS } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

export type FormationStatus = "run" | "inspect" | "fault" | "end";

const LABEL: Record<FormationStatus, string> = { run: "운행", inspect: "점검", fault: "고장", end: "종료" };
// 고장 건수 한 건당 기둥이 자라는 높이(px) 지정
const LEVEL_PX = 22;
// 기둥 위아래 글자와 간격 높이 합 지정
const TEXT_H = 74;

type FormationColumnProps = {
  id: string;
  // 고장 건수(0~8) 지정
  level: number;
  status?: FormationStatus;
};

// 편성 번호와 고장 건수를 건수만큼 자라는 입체 기둥으로 표시
export function FormationColumn({ id, level, status = "run" }: FormationColumnProps) {
  const n = Math.max(0, Math.min(8, Math.round(level)));
  const shown = Math.round(useAnimatedNumber(n, 900));
  const token = STATUS[status];
  const alert = status === "inspect" || status === "fault";
  const countColor = alert ? `var(${token})` : n === 0 || status === "end" ? "var(--text-tertiary)" : "var(--text-primary)";
  const labelColor = alert || status === "end" ? `var(${token})` : "var(--text-tertiary)";
  const pillar = LEVEL_PX + LEVEL_PX * n;
  const { tip, track, show, hide } = useValueTip<true>();
  return (
    <div
      className="flex w-10 shrink-0 flex-col items-center gap-1.5"
      style={{ height: TEXT_H + pillar }}
      onPointerEnter={(e) => show(true, e)}
      onPointerMove={track}
      onPointerLeave={hide}
    >
      <p className={`font-semibold whitespace-nowrap tabular-nums ${TEXT.labelLarge}`} style={{ color: countColor }}>
        {String(shown).padStart(2, "0")}
      </p>
      <IsoPillar status={status} height={pillar} tip={false} />
      <p className={`font-bold whitespace-nowrap text-(--text-primary) ${TEXT.titleSmall}`}>{id}</p>
      <p className={`font-medium whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: labelColor }}>
        {LABEL[status]}
      </p>
      <ValueTip at={tip} label={`${id} 편성 · ${LABEL[status]}`} rows={[{ name: "고장 건수", value: n, unit: "건", color: `var(${token})` }]} />
    </div>
  );
}
