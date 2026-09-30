import { GradeChip } from "@/components/foundations";
import type { Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type FeedItemProps = {
  grade: Grade;
  title: string;
  time: string;
  meta: string;
  // 방금 들어온 항목이면 옆에서 밀려 들어오고 점이 퍼지도록 지정
  fresh?: boolean;
};

// 실시간 고장 알림 한 건을 세로 타임라인 점과 카드로 표시
export function FeedItem({ grade, title, time, meta, fresh = false }: FeedItemProps) {
  return (
    <div className={`flex w-full items-start gap-2.5 ${fresh ? "animate-[feed-in_420ms_ease-out]" : ""}`}>
      <div className="flex flex-col items-center gap-1 self-stretch pt-4">
        <span className="relative size-2.5 shrink-0">
          {fresh && <span className="absolute inset-0 animate-ping rounded-full bg-(--accent-cyan)/60" />}
          <span className="absolute inset-0 rounded-full border-2 border-(--accent-cyan) bg-(--navy-900) shadow-[0px_0px_8px_0px_color-mix(in_srgb,var(--accent-cyan)_70%,transparent)]" />
        </span>
        <span className="min-h-px w-0.5 flex-1 bg-linear-to-b from-(--accent-cyan)/40 to-(--accent-cyan)/2" />
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-1.5 rounded-[12px] border border-(--border-default) px-3 py-2.5">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-b from-(--white)/6 to-(--white)/2" />
        <div className="relative flex w-full items-center gap-2">
          <GradeChip grade={grade} />
          <p className={`min-w-px flex-1 truncate font-medium text-(--text-primary) ${TEXT.bodyMedium}`}>{title}</p>
          <p className={`shrink-0 font-medium text-(--text-tertiary) tabular-nums ${TEXT.labelMedium}`}>{time}</p>
        </div>
        <p className={`relative whitespace-nowrap text-(--text-secondary) ${TEXT.bodySmall}`}>{meta}</p>
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
      </div>
    </div>
  );
}
