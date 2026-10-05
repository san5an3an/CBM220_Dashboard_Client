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
  // 기둥 위 수치 문구를 건수 대신 다른 값으로 지정
  value?: string;
  // 아래 상태 문구를 다른 이름으로 지정
  label?: string;
  // 마우스를 올리면 수치 말풍선 표시 지정
  tip?: boolean;
};

// 편성 번호와 고장 건수를 건수만큼 자라는 입체 기둥으로 표시
export function FormationColumn({ id, level, status = "run", value, label, tip = true }: FormationColumnProps) {
  const n = Math.max(0, Math.min(8, Math.round(level)));
  const shown = Math.round(useAnimatedNumber(n, 900));
  const token = STATUS[status];
  const alert = status === "inspect" || status === "fault";
  const countColor = alert ? `var(${token})` : n === 0 || status === "end" ? "var(--text-tertiary)" : "var(--text-primary)";
  const labelColor = alert || status === "end" ? `var(${token})` : "var(--text-tertiary)";
  const pillar = LEVEL_PX + LEVEL_PX * n;
  const { tip: tipAt, track, show, hide } = useValueTip<true>();
  return (
    <div
      className="flex w-10 shrink-0 flex-col items-center gap-1.5"
      style={{ height: TEXT_H + pillar }}
      onPointerEnter={tip ? (e) => show(true, e) : undefined}
      onPointerMove={tip ? track : undefined}
      onPointerLeave={tip ? hide : undefined}
    >
      <p className={`font-semibold whitespace-nowrap tabular-nums ${TEXT.labelLarge}`} style={{ color: countColor }}>
        {value ?? String(shown).padStart(2, "0")}
      </p>
      <IsoPillar status={status} height={pillar} tip={false} />
      <p className={`font-bold whitespace-nowrap text-(--text-primary) ${TEXT.titleSmall}`}>{id}</p>
      <p className={`font-medium whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: labelColor }}>
        {label ?? LABEL[status]}
      </p>
      <ValueTip at={tipAt} label={`${id} 편성 · ${LABEL[status]}`} rows={[{ name: "고장 건수", value: n, unit: "건", color: `var(${token})` }]} />
    </div>
  );
}
