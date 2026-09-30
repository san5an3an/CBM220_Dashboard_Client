"use client";

import { Clock, RefreshCw } from "lucide-react";
import { Spacer } from "@/components/ui/Panel";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { replayArrival } from "./consist/arrival";

const PAGES = ["플릿 개요", "이상 타임라인", "알람/이벤트", "조치 관리"];

const BAR = "relative flex shrink-0 items-center gap-2.5 overflow-clip rounded-full border border-(--border-default) bg-(--neutral-control) py-1 pl-3.5 pr-1";
const KEY = "whitespace-nowrap text-[14px] font-medium leading-5 tracking-[0.1px] text-(--text-secondary)";
const VALUE = "whitespace-nowrap text-[14px] font-bold leading-5 tracking-[0.1px] text-(--text-primary)";

export function PageNav() {
  return (
    <div className="relative flex w-full shrink-0 items-center gap-4">
      <SegmentTabs items={PAGES} />
      <Spacer />
      <div className="relative flex shrink-0 items-center gap-2.5">
        <div className={`${BAR} min-h-10`}>
          <p className={KEY}>갱신</p>
          <p className={VALUE}>13:13:38</p>
          <button
            type="button"
            onClick={replayArrival}
            className="relative flex shrink-0 cursor-pointer items-center gap-1.5 overflow-clip rounded-full border border-(--border-sheet) bg-(--accent-cyan-subtle) px-3 py-1.5"
          >
            <RefreshCw className="text-(--accent-cyan)" size={18} absoluteStrokeWidth />
            <span className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--accent-cyan)">
              새로고침
            </span>
          </button>
        </div>
        <div className={BAR}>
          <Clock className="text-(--text-secondary)" size={18} absoluteStrokeWidth />
          <p className={KEY}>세션 만료까지</p>
          <p className={VALUE}>09:54</p>
          <button
            type="button"
            className="relative flex shrink-0 cursor-pointer items-center overflow-clip rounded-full px-3.5 py-1.5 shadow-[0px_3px_12px_0px_var(--accent-cyan-glow)]"
            style={{
              backgroundImage: "linear-gradient(149.35deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)",
            }}
          >
            <span className="whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--text-on-primary)">
              연장
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
