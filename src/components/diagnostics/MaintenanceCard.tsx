"use client";

import { Pencil, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/controls/Button";
import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const STATUS = {
  inspect: { token: "--status-warning", label: "점검" },
  replace: { token: "--status-danger", label: "교체" },
} as const;

type MaintenanceCardProps = {
  status?: keyof typeof STATUS;
  device?: string;
  time?: string;
  message?: string;
  meta?: string;
  onView?: () => void;
  onAction?: () => void;
};

// 정비 알림 한 건을 점검·교체 상태 색과 데이터 보기·조치 입력 버튼으로 표시
export function MaintenanceCard({
  status = "inspect",
  device = "주공기 압축기",
  time = "07-07 15:43",
  message = "Tc1 CM 토출부 압력 이상",
  meta = "4001 편성 · 4001호",
  onView,
  onAction,
}: MaintenanceCardProps) {
  const { token, label } = STATUS[status];
  return (
    <div className="relative flex w-[400px] flex-col items-start gap-2 overflow-clip rounded-[18px] border px-4 py-3.5" style={{ borderColor: tint(token, 40) }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px]" style={{ backgroundImage: `linear-gradient(to right, ${tint(token, 12)}, rgba(255,255,255,0.02))` }} />
      <div aria-hidden className="absolute top-[15px] left-[-1px] h-10 w-1 animate-[glow-breathe_2.4s_ease-in-out_infinite]" style={{ background: `var(${token})`, boxShadow: `0 0 8px 0 var(${token})` }} />
      <div className="relative flex w-full items-center gap-2">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border py-[3px] pr-2.5 pl-1.5" style={{ background: tint(token, 16), borderColor: tint(token, 50) }}>
          <span
            className="size-2.5 animate-[legend-pulse_1.6s_ease-in-out_infinite] rounded-full"
            style={{ background: `radial-gradient(circle, var(--white), var(${token}) 50%, ${shade(token, "black", 40)})`, "--pulse": tint(token, 90) } as CSSProperties}
          />
          <p className={`font-semibold whitespace-nowrap ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
            {label}
          </p>
        </span>
        <p className={`min-w-px flex-1 font-bold text-(--text-primary) ${TEXT.titleSmall}`}>{device}</p>
        <p className={`shrink-0 font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>{time}</p>
      </div>
      <p className={`relative w-full text-(--text-secondary) ${TEXT.bodyMedium}`}>{message}</p>
      <div className="relative flex w-full items-center gap-2">
        <p className={`shrink-0 font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelMedium}`}>{meta}</p>
        <div className="min-w-px flex-1" />
        <Button kind="secondary" label="데이터 보기" icon={SlidersHorizontal} className="h-[34px]!" onClick={onView} />
        <Button label="조치 입력" icon={Pencil} className="h-[34px]!" onClick={onAction} />
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.07)]" />
    </div>
  );
}
