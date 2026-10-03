"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type TipRow = { name?: string; value: string | number; unit?: string; color?: string };

type ValueTipBoxProps = { label?: string; rows: TipRow[] };

// shadcn 차트 말풍선 틀에 이름은 작게, 수치는 크게 굵게 표시
export function ValueTipBox({ label, rows }: ValueTipBoxProps) {
  return (
    <div className="grid min-w-32 items-start gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {label && <div className="font-medium whitespace-nowrap text-muted-foreground">{label}</div>}
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
          {r.color && <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ background: r.color }} />}
          {r.name && <span className="text-muted-foreground">{r.name}</span>}
          <span className="ml-auto flex items-baseline gap-1">
            <span className="text-[1.125rem] leading-6 font-bold text-foreground tabular-nums">
              {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
            </span>
            {r.unit && <span className="text-muted-foreground">{r.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

type Tip<T> = { x: number; y: number; item: T };
type Point = { clientX: number; clientY: number };

// 마우스 화면 위치를 따라가며 마우스를 올린 항목의 말풍선 상태 관리
export function useValueTip<T>() {
  const pos = useRef({ x: 0, y: 0 });
  const [tip, setTip] = useState<Tip<T> | null>(null);
  const track = useCallback((e: Point) => {
    pos.current = { x: e.clientX, y: e.clientY };
    setTip((t) => (t ? { ...t, ...pos.current } : t));
  }, []);
  const show = useCallback((item: T, e?: Point) => {
    if (e) pos.current = { x: e.clientX, y: e.clientY };
    setTip({ ...pos.current, item });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  return { tip, track, show, hide };
}

type ValueTipProps = { at: { x: number; y: number } | null; label?: string; rows: TipRow[] };

// 잘리지 않도록 화면 맨 위층에 마우스 위치 위쪽으로 말풍선을 띄워 표시
export function ValueTip({ at, label, rows }: ValueTipProps) {
  if (!at || typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full" style={{ left: at.x, top: `calc(${at.y}px - 0.75rem)` }}>
      <ValueTipBox label={label} rows={rows} />
    </div>,
    document.body,
  );
}
