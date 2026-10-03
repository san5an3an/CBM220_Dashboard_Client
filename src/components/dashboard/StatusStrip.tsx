/* eslint-disable @next/next/no-img-element */
import { Clock, TriangleAlert } from "lucide-react";
import { Spacer } from "@/components/ui/Panel";

const PILL = "relative flex shrink-0 items-center gap-2 overflow-clip rounded-full border px-3.5 py-[9px]";

export function StatusStrip() {
  return (
    <header className="relative flex w-full shrink-0 items-center gap-3.5">
      <div className="flex shrink-0 flex-col items-start gap-0.5 whitespace-nowrap">
        <p className="text-[11px] font-semibold leading-4 tracking-[0.5px] text-[#00a4e3]">
          LINE 04 · CBM 220 MONITORING SYSTEM
        </p>
        <h1 className="text-[24px] font-extrabold leading-8 text-(--text-primary)">플릿 개요</h1>
      </div>
      <Spacer />
      <div className={`${PILL} border-(--status-danger-border) bg-(--status-danger-subtle)`}>
        <TriangleAlert className="text-(--status-danger)" size={18} absoluteStrokeWidth />
        <p className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--status-danger)">
          위험 장치 4건
        </p>
      </div>
      <div className={`${PILL} border-(--border-default) bg-(--neutral-control)`}>
        <Clock className="text-(--text-secondary)" size={18} absoluteStrokeWidth />
        <p className="whitespace-nowrap text-[14px] font-medium leading-5 tracking-[0.1px] text-(--text-primary)">
          2026.09.23 (수) 12:30
        </p>
      </div>
      <div className={`${PILL} border-(--status-success-border) bg-(--status-success-subtle)`}>
        <div className="relative size-2 shrink-0">
          <div className="absolute inset-[-125%]">
            <img alt="" className="block size-full max-w-none" src="/figma/status/live-pulse.svg" />
          </div>
        </div>
        <p className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--status-success)">
          LIVE
        </p>
      </div>
    </header>
  );
}
