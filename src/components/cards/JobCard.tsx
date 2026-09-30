"use client";

import type { CSSProperties } from "react";
import { useAnimatedNumber } from "@/lib/motion";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

export type JobStatus = "running" | "success" | "scheduled" | "failed";

const JOB_STATUS: Record<JobStatus, { token: string; label: string }> = {
  running: { token: "--accent-cyan", label: "학습 중" },
  success: { token: "--status-success", label: "성공" },
  scheduled: { token: "--text-secondary", label: "예약" },
  failed: { token: "--status-danger", label: "실패" },
};

const GRADIENT_FILL = "linear-gradient(to right, var(--accent-cyan), var(--accent-violet))";

type JobCardProps = {
  title: string;
  meta: string;
  // 진행률(0~100) 지정
  progress: number;
  status?: JobStatus;
  steps?: string[];
  // 진행 중이거나 실패한 단계 순서(0부터) 지정
  current?: number;
};

// 단계 하나의 점 색·빛과 글자 색 계산
function stepLook(status: JobStatus, index: number, current: number) {
  if (status === "success") return { dot: "--status-success", text: "--text-primary", glow: false };
  if (status === "scheduled" || index > current) return { dot: "--text-tertiary", text: "--text-tertiary", glow: false };
  if (index < current) return { dot: "--accent-cyan", text: "--text-primary", glow: false };
  return status === "failed"
    ? { dot: "--status-danger", text: "--text-primary", glow: false }
    : { dot: "--accent-cyan", text: "--text-primary", glow: true };
}

// 학습·추론 작업 하나의 상태·진행률·단계를 카드로 표시
export function JobCard({ title, meta, progress, status = "running", steps = ["전처리", "특징벡터", "학습", "저장"], current = 1 }: JobCardProps) {
  const { token, label } = JOB_STATUS[status];
  const shown = useAnimatedNumber(Math.max(0, Math.min(100, progress)), 1400);
  const running = status === "running";
  const card: CSSProperties =
    status === "running"
      ? {
          borderColor: tint(token, 50),
          backgroundImage: `linear-gradient(155.49deg, ${tint(token, 14)}, ${tint("--accent-violet", 8)})`,
          filter: `drop-shadow(0 0 9px ${tint(token, 18)})`,
        }
      : status === "failed"
        ? { borderColor: tint(token, 35), background: tint(token, 6) }
        : { borderColor: "var(--border-default)", background: "var(--neutral-card)" };
  const numberColor = status === "success" || status === "scheduled" ? "var(--text-secondary)" : `var(${token})`;

  return (
    <div className="relative flex min-h-[124px] w-[272px] flex-col items-start gap-2.5 rounded-[16px] border px-4 py-3.5" style={card}>
      <div className="flex w-full items-center gap-2">
        <p className={`min-w-px flex-1 truncate font-semibold text-(--text-primary) ${TEXT.labelLarge}`}>{title}</p>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-[2px]"
          style={{ borderColor: tint(token, 45), background: tint(token, 14) }}
        >
          <span
            className={`size-1.5 shrink-0 rounded-full ${running ? "animate-[legend-pulse_1.6s_ease-in-out_infinite]" : ""}`}
            style={{ background: `var(${token})`, "--pulse": tint(token, 90) } as CSSProperties}
          />
          <span className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
            {label}
          </span>
        </span>
      </div>
      <p
        className={`w-full truncate font-medium ${TEXT.labelSmall}`}
        style={{ color: status === "failed" ? `var(${token})` : "var(--text-secondary)" }}
      >
        {meta}
      </p>
      <div className="flex w-full items-center gap-2.5">
        <div className="relative h-1.5 min-w-px flex-1 overflow-hidden rounded-[3px] bg-(--neutral-track)">
          <div
            className="relative h-full overflow-hidden rounded-[3px]"
            style={{ width: `${shown}%`, background: status === "success" ? `var(${token})` : GRADIENT_FILL }}
          >
            {running && (
              <span className="absolute inset-y-0 left-0 w-2/5 animate-[bar-flow_1.8s_ease-in-out_infinite] bg-linear-to-r from-transparent via-(--white)/55 to-transparent" />
            )}
          </div>
        </div>
        <p className={`shrink-0 font-semibold whitespace-nowrap tabular-nums ${TEXT.labelSmall}`} style={{ color: numberColor }}>
          {Math.round(shown)}%
        </p>
      </div>
      <div className="flex items-center gap-2">
        {steps.map((step, i) => {
          const look = stepLook(status, i, current);
          return (
            <div key={step} className="flex items-center gap-1">
              <span
                className={`size-1.5 shrink-0 rounded-full ${look.glow ? "animate-[legend-pulse_1.2s_ease-in-out_infinite]" : ""}`}
                style={{ background: `var(${look.dot})`, "--pulse": tint(look.dot, 90) } as CSSProperties}
              />
              <p className={`font-medium whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${look.text})` }}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
