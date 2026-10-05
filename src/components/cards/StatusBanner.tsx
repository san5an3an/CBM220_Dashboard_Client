import type { ReactNode } from "react";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const BANNER_TONE = {
  accent: { token: "--accent-cyan", from: tint("--accent-cyan", 12), to: tint("--accent-violet", 5) },
  danger: { token: "--status-danger", from: tint("--status-danger", 14), to: tint("--status-danger", 3) },
} as const;

type StatusBannerProps = {
  tone?: keyof typeof BANNER_TONE;
  title?: string;
  description?: string;
  // 왼쪽 96px 자리에 들어갈 그림 지정
  visual?: ReactNode;
  // 제목·설명 대신 넣을 내용 지정
  content?: ReactNode;
  // 왼쪽 그림 자리를 숨기려면 false 지정
  showVisual?: boolean;
  width?: number | string;
};

// 상세 모달 위쪽에 그림과 상태 문구를 톤 색 배너로 표시
export function StatusBanner({ tone = "accent", title, description, visual, content, showVisual = true, width = 1064 }: StatusBannerProps) {
  const t = BANNER_TONE[tone];
  return (
    <div
      className={`relative flex items-center gap-4 overflow-hidden rounded-[18px] border p-4 ${
        tone === "danger" ? "animate-[danger-glow_2.4s_ease-in-out_infinite]" : ""
      }`}
      style={{ width, borderColor: tint(t.token, 35), backgroundImage: `linear-gradient(to right, ${t.from}, ${t.to})` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-[banner-sweep_5s_ease-in-out_infinite] -skew-x-12"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${tint(t.token, 10)}, transparent)` }}
      />
      {showVisual && (
        <div className="relative flex shrink-0 items-start">
          {visual ?? <div className="size-24 rounded-[48px]" style={{ background: tint(t.token, 12) }} />}
        </div>
      )}
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-2 font-medium whitespace-nowrap">
        {content ?? (
          <>
            <p className={`text-(--text-primary) ${TEXT.bodyMedium}`}>{title}</p>
            <p className={`text-(--text-secondary) ${TEXT.labelSmall}`}>{description}</p>
          </>
        )}
      </div>
    </div>
  );
}
