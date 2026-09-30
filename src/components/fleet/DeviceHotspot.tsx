"use client";

import type { CSSProperties } from "react";
import { shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { DEVICE_STATE, type DeviceState } from "./tone";

type DeviceHotspotProps = {
  name?: string;
  status?: DeviceState;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  style?: CSSProperties;
};

// 장치 위치를 상태 색으로 빛나는 구슬과 이름표로 표시하고 누르면 선택
export function DeviceHotspot({ name = "차축 베어링", status = "normal", selected = false, onSelect, className = "", style }: DeviceHotspotProps) {
  const token = DEVICE_STATE[status];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group flex cursor-pointer items-center gap-1.5 ${className}`}
      style={style}
    >
      <span className="relative size-[22px] shrink-0">
        {selected && (
          <span
            aria-hidden
            className="absolute -inset-2 animate-[spin_8s_linear_infinite] rounded-full border-[1.5px] border-dashed border-(--accent-cyan)/80"
            style={{ boxShadow: `0 0 10px 0 ${tint("--accent-cyan", 45)}` }}
          />
        )}
        {/* 상태 색 물결이 구슬에서 퍼져 나가도록 표시 */}
        <span
          aria-hidden
          className={`absolute -inset-1 rounded-full border ${selected ? "animate-[hotspot-ping_1.6s_ease-out_infinite]" : "animate-[hotspot-breathe_2.4s_ease-in-out_infinite]"}`}
          style={{ background: tint(token, 18), borderColor: tint(token, 40) }}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full transition-transform group-hover:scale-110"
          style={{
            background: `radial-gradient(circle, var(--white), var(${token}) 45%, ${shade(token, "black", 45)})`,
            boxShadow: `0 0 12px 2px ${tint(token, 90)}, inset 0 1px 0 0 rgba(255,255,255,0.5)`,
          }}
        />
      </span>
      <span
        className="shrink-0 rounded-[8px] border px-2 py-[3px] backdrop-blur-[4px] transition-colors"
        style={{
          background: tint("--neutral-sheet", 90),
          borderColor: selected ? tint("--accent-cyan", 90) : tint(token, 45),
          boxShadow: selected ? `0 0 12px 0 ${tint("--accent-cyan", 50)}` : undefined,
        }}
      >
        <p className={`whitespace-nowrap ${TEXT.labelSmall} ${selected ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-secondary)"}`}>{name}</p>
      </span>
    </button>
  );
}
