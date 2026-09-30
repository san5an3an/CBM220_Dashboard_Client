"use client";

import { ChevronDown, Download, RefreshCw, Search } from "lucide-react";
import { Panel, PanelTitle, Spacer } from "@/components/ui/Panel";
import { replayArrival } from "./consist/arrival";
import { ConsistScene } from "./consist/ConsistScene";

const LABEL = "whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px]";

function Toolbar() {
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <button
        type="button"
        className="relative flex h-10 w-[168px] shrink-0 cursor-pointer items-center gap-2 rounded-[12px] border border-(--button-secondary-border) pl-3.5 pr-2.5 shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-b from-(--neutral-hover) to-(--neutral-card)" />
        <span className="relative min-w-px flex-[1_0_0] text-left text-[14px] leading-5 tracking-[0.25px] text-(--text-primary)">
          415 편성
        </span>
        <ChevronDown className="relative text-(--text-secondary)" size={20} absoluteStrokeWidth />
      </button>
      <label className="relative flex h-10 w-[180px] shrink-0 items-center gap-2 rounded-[12px] border border-(--button-secondary-border) px-3 shadow-[inset_0px_2px_4px_0px_var(--effect-shadow-panel)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-(--neutral-input)" />
        <Search className="relative shrink-0 text-(--text-secondary)" size={18} absoluteStrokeWidth />
        <input
          type="search"
          placeholder="장치 검색"
          className="relative min-w-px flex-[1_0_0] bg-transparent text-[14px] leading-5 tracking-[0.25px] text-(--text-primary) outline-none placeholder:text-(--text-primary)"
        />
      </label>
      <button
        type="button"
        aria-label="새로고침"
        onClick={replayArrival}
        className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-(--button-secondary-border) bg-(--button-secondary-bg)"
      >
        <RefreshCw className="text-(--text-secondary)" size={20} absoluteStrokeWidth />
      </button>
      <button
        type="button"
        className="flip-hover relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] pl-3.5 pr-4 shadow-[inset_0px_1px_0px_0px_var(--chart-3d-top-highlight)] drop-shadow-[0px_4px_7px_color-mix(in_srgb,var(--blue-500)_40%,transparent)]"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        <Search className="text-(--text-on-primary)" size={18} absoluteStrokeWidth />
        <span className={`${LABEL} text-(--text-on-primary)`}>조회</span>
      </button>
      <button
        type="button"
        className="relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border border-(--status-success-border) bg-(--button-success-bg) pl-3.5 pr-4"
      >
        <Download className="text-(--status-success)" size={18} absoluteStrokeWidth />
        <span className={`${LABEL} text-(--button-success-text)`}>CSV 내보내기</span>
      </button>
    </div>
  );
}

export function ConsistPanel() {
  return (
    <Panel
      className="min-h-[684px] w-full flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelTitle eyebrow="LIVE CONSIST" title="편성 415 · 10량 이상 감지" />
          <Spacer />
          <Toolbar />
        </>
      }
    >
      <ConsistScene />
    </Panel>
  );
}
