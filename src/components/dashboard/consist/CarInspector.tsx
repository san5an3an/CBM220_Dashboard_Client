"use client";

import { CARS } from "./data";
import { type DeviceStatus, inspectorLayout, useSelection } from "./selection";

const KEY = "whitespace-nowrap text-[11px] font-medium leading-4 tracking-[0.5px] text-(--text-secondary)";
const VALUE = "whitespace-nowrap text-[16px] font-bold leading-6 tracking-[0.15px] text-(--text-primary)";

// 장치 상태별 칩 문구와 색 지정
const STATUS_CHIP: Record<DeviceStatus, { label: string; className: string }> = {
  danger: { label: "위험", className: "border-(--status-danger-border) bg-(--status-danger-subtle) text-(--status-danger)" },
  warning: { label: "경고", className: "border-(--status-warning-border) bg-(--status-warning-subtle) text-(--status-warning)" },
  normal: { label: "정상", className: "border-(--status-success-border) bg-(--status-success-subtle) text-(--status-success)" },
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip">
      <p className={KEY}>{label}</p>
      <p className={VALUE}>{value}</p>
    </div>
  );
}

export function CarInspector() {
  const { index, detail } = useSelection();
  const chip = STATUS_CHIP[detail.status];
  const { left, top } = inspectorLayout(index);
  return (
    // 선택 차량 위치로 카드를 부드럽게 이동
    <div
      style={{ left, top, transition: "left 500ms cubic-bezier(0.2, 0.8, 0.2, 1), top 500ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      className="absolute flex items-center gap-[18px] overflow-clip rounded-[18px] border border-(--accent-cyan)/60 py-3 pl-[18px] pr-5 shadow-[0px_8px_28px_0px_var(--accent-cyan-glow)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          backgroundImage: "var(--gradient-dialog)",
        }}
      />
      <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip whitespace-nowrap">
        <p className="text-[11px] font-semibold leading-4 tracking-[0.5px] text-(--accent-cyan)">SELECTED CAR · 최고 위험 장치</p>
        <p className="text-[22px] font-bold leading-7 text-(--text-primary)">{CARS[index].no}호차</p>
      </div>
      <div className="relative h-9 w-px shrink-0 bg-(--border-strong)" />
      <Metric label="장치" value={detail.device} />
      <div className="relative flex shrink-0 flex-col items-start gap-1 overflow-clip">
        <p className={KEY}>상태</p>
        <div className={`relative flex shrink-0 items-start overflow-clip rounded-full border px-2 py-0.5 ${chip.className}`}>
          <p className="whitespace-nowrap text-[12px] font-semibold leading-4 tracking-[0.5px]">{chip.label}</p>
        </div>
      </div>
      <Metric label="이상비율" value={`${detail.ratio}%`} />
      <Metric label="window" value={detail.window} />
      <div className="relative flex shrink-0 flex-col items-start gap-1.5 overflow-clip">
        <p className={KEY}>헬스</p>
        <div className="relative flex shrink-0 items-start gap-[3px] overflow-clip">
          {detail.health.map((level, i) => (
            <div
              key={i}
              className={`h-1.5 w-3.5 shrink-0 rounded-[2px] ${
                level === "ok"
                  ? "bg-(--status-success) shadow-[0px_0px_4px_0px_var(--status-success-border)]"
                  : "bg-(--status-warning) shadow-[0px_0px_4px_0px_var(--status-warning-border)]"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
    </div>
  );
}
