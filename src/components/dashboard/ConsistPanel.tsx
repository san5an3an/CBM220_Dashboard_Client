"use client";

import { Check, ChevronDown, Download, RefreshCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelTitle, Spacer } from "@/components/ui/Panel";
import { playIntro, replayArrival } from "./consist/arrival";
import { FORMATIONS, setFormation, useFormation } from "./consist/formation";
import { ConsistScene } from "./consist/ConsistScene";

const LABEL = "whitespace-nowrap text-[14px] font-semibold leading-5 tracking-[0.1px]";

type FormationSelectProps = { value: string; onChange: (no: string) => void };

// 편성 번호를 고르는 목록 표시
function FormationSelect({ value, onChange }: FormationSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 목록 밖을 누르거나 Esc 를 누르면 목록 닫기
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-[168px] shrink-0 cursor-pointer items-center gap-2 rounded-[12px] border border-(--button-secondary-border) pl-3.5 pr-2.5 shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-b from-(--neutral-hover) to-(--neutral-card)" />
        <span className="relative min-w-px flex-[1_0_0] text-left text-[14px] leading-5 tracking-[0.25px] text-(--text-primary)">
          {value} 편성
        </span>
        <ChevronDown className={`relative text-(--text-secondary) transition-transform ${open ? "rotate-180" : ""}`} size={20} absoluteStrokeWidth />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="편성 선택"
          className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-[280px] w-[168px] overflow-y-auto rounded-[12px] border border-(--border-default) bg-(--neutral-popover) p-1 shadow-[0px_8px_24px_0px_var(--effect-shadow-popover)]"
        >
          {FORMATIONS.map((no) => (
            <li key={no} role="option" aria-selected={no === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(no);
                  setOpen(false);
                }}
                className={`flex h-9 w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 text-left text-[14px] leading-5 tracking-[0.25px] hover:bg-(--neutral-hover) ${
                  no === value ? "text-(--accent-cyan)" : "text-(--text-primary)"
                }`}
              >
                <span className="flex-1">{no} 편성</span>
                {no === value && <Check className="text-(--accent-cyan)" size={16} absoluteStrokeWidth />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Toolbar() {
  const formation = useFormation();
  const [pending, setPending] = useState(formation);
  return (
    <div className="relative flex shrink-0 items-center gap-2 rounded-[16px] border border-(--border-default) bg-(--neutral-card) p-1.5">
      <FormationSelect value={pending} onChange={setPending} />
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
        // 고른 편성으로 바꾸고 정면 연출부터 다시 재생
        onClick={() => {
          setFormation(pending);
          playIntro();
        }}
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
  const formation = useFormation();
  return (
    <Panel
      className="min-h-[684px] w-full flex-[1_0_0]"
      headerClassName="gap-2.5"
      header={
        <>
          <PanelTitle eyebrow="LIVE CONSIST" title={`편성 ${formation} · 10량 이상 감지`} />
          <Spacer />
          <Toolbar />
        </>
      }
    >
      <ConsistScene />
    </Panel>
  );
}
