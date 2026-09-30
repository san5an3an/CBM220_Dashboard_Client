"use client";

import { Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsClient } from "@/lib/client";
import { TEXT } from "@/lib/typography";

const pad = (n: number) => String(n).padStart(2, "0");
// 초를 "09:54" 처럼 분:초 문구로 변환
const mmss = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
// 시각을 "13:13:38" 처럼 시:분:초 문구로 변환
const hms = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

type SessionBarProps = {
  // 세션 유지 시간(초) 지정
  sessionSeconds?: number;
  // 남은 시간이 이 값 이하가 되면 주의 색으로 바꾸도록 지정
  warnSeconds?: number;
  onRefresh?: () => void | Promise<void>;
  onExpire?: () => void;
};

// 데이터 갱신 시각·새로고침과 세션 남은 시간·연장을 묶어 표시
export function SessionBar({ sessionSeconds = 600, warnSeconds = 60, onRefresh, onExpire }: SessionBarProps) {
  const [left, setLeft] = useState(sessionSeconds);
  const [updated, setUpdated] = useState(() => new Date());
  const client = useIsClient();
  const [spinning, setSpinning] = useState(false);
  const expiring = left <= warnSeconds;


  // 1초마다 남은 시간을 줄이고 0이 되면 만료 처리
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (left === 0) onExpire?.();
  }, [left, onExpire]);

  const refresh = async () => {
    setSpinning(true);
    await Promise.all([onRefresh?.(), new Promise((r) => setTimeout(r, 700))]);
    setUpdated(new Date());
    setSpinning(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex min-h-10 shrink-0 items-center gap-2.5 rounded-full border border-(--border-default) bg-(--neutral-hover)/70 py-1 pr-1 pl-3.5">
        <span className={`font-medium text-(--text-secondary) ${TEXT.labelLarge}`}>갱신</span>
        <span key={updated.getTime()} className={`animate-[fade-up_300ms_ease-out] font-bold text-(--text-primary) tabular-nums ${TEXT.titleSmall}`}>
          {client ? hms(updated) : "--:--:--"}
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={spinning}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-(--accent-cyan)/40 bg-(--accent-cyan)/12 px-3 py-1.5 transition-colors hover:bg-(--accent-cyan)/20 disabled:cursor-wait"
        >
          <RefreshCw className={`text-(--accent-cyan) ${spinning ? "animate-spin" : ""}`} size={18} absoluteStrokeWidth />
          <span className={`font-semibold whitespace-nowrap text-(--accent-cyan) ${TEXT.labelLarge}`}>새로고침</span>
        </button>
      </div>
      <div
        role="timer"
        aria-live={expiring ? "polite" : "off"}
        className={`flex shrink-0 items-center gap-2.5 rounded-full border py-1 pr-1 pl-3.5 transition-colors duration-500 ${
          expiring ? "animate-[warn-glow_1.4s_ease-in-out_infinite] border-(--status-warning)/45 bg-(--status-warning)/12" : "border-(--border-default) bg-(--neutral-hover)/70"
        }`}
      >
        <Clock className={expiring ? "text-(--status-warning)" : "text-(--text-secondary)"} size={18} absoluteStrokeWidth />
        <span className={`font-medium whitespace-nowrap ${TEXT.labelLarge} ${expiring ? "text-(--status-warning)" : "text-(--text-secondary)"}`}>세션 만료까지</span>
        <span className={`font-bold tabular-nums ${TEXT.titleSmall} ${expiring ? "text-(--status-warning)" : "text-(--text-primary)"}`}>{mmss(left)}</span>
        <button
          type="button"
          onClick={() => setLeft(sessionSeconds)}
          className="flip-hover relative flex cursor-pointer items-center rounded-full bg-(image:--gradient-accent) px-3.5 py-1.5 shadow-[0px_3px_12px_0px_color-mix(in_srgb,var(--accent-cyan)_30%,transparent)]"
        >
          <span className={`relative font-semibold whitespace-nowrap text-(--white) ${TEXT.labelLarge}`}>연장</span>
        </button>
      </div>
    </div>
  );
}
