import { ArrowRight } from "lucide-react";
import { GradeChip } from "@/components/foundations";
import type { Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type ValueRow = { type?: "value"; meta: string; grade?: Grade };
type DiffRow = { type: "diff"; from: string; to: string };

type ListItemProps = (ValueRow | DiffRow) & {
  title: string;
  // 위쪽 구분선을 그리도록 지정
  divider?: boolean;
};

// 목록 한 행을 이름·메타 또는 이전 → 이후 값으로 표시
export function ListItem(props: ListItemProps) {
  const { title, divider = true } = props;
  return (
    <div className={`flex w-full items-center gap-2.5 py-2.5 ${divider ? "border-t border-(--border-subtle)" : ""}`}>
      {props.type === "diff" ? (
        <>
          <p className={`whitespace-nowrap text-(--text-secondary) ${TEXT.bodyMedium}`}>{title}</p>
          <span className="h-px min-w-px flex-1" />
          <p className={`whitespace-nowrap text-(--text-tertiary) ${TEXT.bodyMedium}`}>{props.from}</p>
          <ArrowRight className="shrink-0 text-(--text-tertiary)" size={14} absoluteStrokeWidth strokeWidth={2} />
          {/* 이후 값이 바뀔 때마다 새로 그려 살짝 커졌다 돌아오게 처리 */}
          <p key={props.to} className={`origin-right animate-[value-pop_420ms_ease-out] font-medium whitespace-nowrap text-(--accent-cyan) ${TEXT.bodyMedium}`}>
            {props.to}
          </p>
        </>
      ) : (
        <>
          {props.grade && <GradeChip grade={props.grade} />}
          <p className={`font-medium whitespace-nowrap text-(--text-primary) ${TEXT.bodyMedium}`}>{title}</p>
          <span className="h-px min-w-px flex-1" />
          <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{props.meta}</p>
        </>
      )}
    </div>
  );
}
