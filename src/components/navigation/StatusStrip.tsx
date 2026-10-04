"use client";

import { Clock, TriangleAlert } from "lucide-react";
import { useCountText } from "@/lib/motion";
import { TEXT } from "@/lib/typography";
import { LiveBadge } from "./LiveBadge";
import { formatClock, useNow } from "./useClock";

type StatusStripProps = {
  system: string;
  title: string;
  // 실시간 고장 건수 지정
  alerts: number;
  // 건수 앞 문구 지정
  alertLabel?: string;
};

// 페이지 제목과 실시간 고장 건수·시계·LIVE 표시를 한 줄로 표시
export function StatusStrip({ system, title, alerts, alertLabel = "실시간 고장" }: StatusStripProps) {
  const now = useNow();
  const count = useCountText(String(alerts), 900);
  return (
    <div className="flex w-full items-center gap-3.5">
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{system}</p>
        <p className={`font-extrabold text-(--text-primary) ${TEXT.headlineSmall}`}>{title}</p>
      </div>
      <span className="h-px min-w-px flex-1" />
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-(--status-danger)/40 bg-(--status-danger)/12 px-3.5 py-[9px]">
        <TriangleAlert className="animate-[alert-blink_1.6s_ease-in-out_infinite] text-(--status-danger)" size={18} absoluteStrokeWidth />
        <span className={`font-semibold whitespace-nowrap text-(--status-danger) tabular-nums ${TEXT.labelLarge}`}>{alertLabel} {count}건</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-(--border-default) bg-(--neutral-hover)/70 px-3.5 py-[9px]">
        <Clock className="text-(--text-secondary)" size={18} absoluteStrokeWidth />
        <span className={`font-medium whitespace-nowrap text-(--text-primary) tabular-nums ${TEXT.titleSmall}`}>{now ? formatClock(now) : " "}</span>
      </span>
      <LiveBadge label="LIVE" />
    </div>
  );
}
