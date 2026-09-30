"use client";

import { useState } from "react";
import { clamp, seeded, useInterval } from "@/components/monitoring/live";
import { Tag } from "@/components/foundations";
import { TEXT } from "@/lib/typography";
import { dragValue } from "./drag";
import { ObliqueBars } from "./ObliqueBars";

// Figma 두 변형의 크기·플롯 영역·막대 수·막대 앞면과 옆면 폭 지정
const LAYOUT = {
  result: {
    w: 600,
    h: 300,
    left: 34,
    width: 548,
    top: 30,
    base: 274,
    bars: 20,
    x0: 38.9,
    step: 27.4,
    front: 16.44,
    depth: 5.754,
    lineTop: 18,
  },
  simulation: {
    w: 1022,
    h: 280,
    left: 34,
    width: 970,
    top: 30,
    base: 254,
    bars: 24,
    x0: 41.3,
    step: 40.42,
    front: 24.25,
    depth: 8.49,
    lineTop: 18,
  },
} as const;

const Y_TICKS = [0, 14, 28, 41, 55];
const X_TICKS = [0, 0.25, 0.5, 0.75, 1];
const LIVE_MS = 4000;

// 정상 봉우리 모양의 구간별 건수 생성
function counts(n: number, seed: number) {
  const rand = seeded(seed);
  const peak = n * 0.3;
  return Array.from({ length: n }, (_, i) => Math.round(clamp(55 * Math.exp(-((i - peak) ** 2) / (2 * (n * 0.13) ** 2)) + 1 + rand() * 1.5, 1, 55)));
}

type Histogram3DProps = {
  variant?: keyof typeof LAYOUT;
  // 현재 임계값 지정
  threshold?: number;
  // 시뮬레이션에서 새로 적용할 임계값 처음 값 지정
  next?: number;
  onNextChange?: (v: number) => void;
  live?: boolean;
};

// 이상 점수 분포를 비스듬한 3D 막대와 임계선으로 표시하고 시뮬레이션에선 새 임계선을 끌어 옮길 수 있게 처리
export function Histogram3D({ variant = "result", threshold = 0.5277, next = 0.6, onNextChange, live = true }: Histogram3DProps) {
  const L = LAYOUT[variant];
  const [data, setData] = useState(() => counts(L.bars, L.bars));
  const [nextV, setNextV] = useState(next);
  useInterval(() => {
    if (live) setData((d) => d.map((v) => Math.round(clamp(v + (Math.random() - 0.5) * Math.max(2, v * 0.15), 1, 55))));
  }, LIVE_MS);

  const plotH = L.base - L.top;
  const x = (v: number) => L.left + v * L.width;
  const bars = data.map((v, i) => {
    const center = (i + 0.5) / L.bars;
    const over = variant === "result" && center >= threshold;
    return {
      x: L.x0 + i * L.step,
      height: (v / 55) * plotH,
      token: over ? "--status-danger" : "--accent-cyan",
    };
  });
  const onDrag = dragValue({ left: L.left, width: L.width, width0: L.w, min: 0, max: 1 }, (v) => {
    const r = Math.round(v * 10000) / 10000;
    setNextV(r);
    onNextChange?.(r);
  });

  return (
    <div data-chart className="relative select-none" style={{ width: L.w, height: L.h }}>
      {Y_TICKS.map((t) => {
        const y = L.base - (t / 55) * plotH;
        return (
          <div key={t}>
            <div className={`absolute h-px ${t === 0 ? "bg-(--chart-axis)" : "bg-(--chart-grid)"}`} style={{ left: L.left, width: L.width, top: y }} />
            <p className={`absolute left-1 -translate-y-1/2 font-medium text-(--text-tertiary) ${TEXT.labelLarge}`} style={{ top: y }}>
              {t}
            </p>
          </div>
        );
      })}
      <ObliqueBars width={L.w} height={L.h} bars={bars} front={L.front} depth={L.depth} baseline={L.base} />
      <div
        className="absolute w-0 border-l-[1.5px] border-(--status-warning)"
        style={{
          left: x(threshold),
          top: L.lineTop,
          height: L.base - L.lineTop,
        }}
      />
      <div
        className={`absolute top-1 ${variant === "simulation" ? "-translate-x-full" : ""}`}
        style={{
          left: variant === "simulation" ? x(threshold) - 11 : x(threshold) + 6,
        }}
      >
        <Tag tone="amber" label={`${variant === "simulation" ? "현재" : "임계치"} ${threshold.toFixed(4)}`} />
      </div>
      {variant === "simulation" && (
        <>
          <div
            role="slider"
            aria-label="새 임계값"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={nextV}
            tabIndex={0}
            onPointerDown={onDrag}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const v = clamp(Math.round((nextV + (e.key === "ArrowRight" ? 0.005 : -0.005)) * 10000) / 10000, 0, 1);
              setNextV(v);
              onNextChange?.(v);
            }}
            className="absolute w-4 -translate-x-1/2 cursor-ew-resize outline-none"
            style={{
              left: x(nextV),
              top: L.lineTop,
              height: L.base - L.lineTop,
            }}
          >
            <div className="absolute left-1/2 h-full w-0 border-l-[1.5px] border-(--accent-cyan)" />
          </div>
          <div className="pointer-events-none absolute top-1" style={{ left: x(nextV) + 11 }}>
            <Tag tone="cyan" label={`신규 ${nextV.toFixed(4)}`} />
          </div>
        </>
      )}
      {X_TICKS.map((t) => (
        <p key={t} className={`absolute -translate-x-1/2 font-medium text-(--text-tertiary) ${TEXT.labelLarge}`} style={{ left: x(t), top: L.h - 18 }}>
          {t === 0 ? "0.0" : t === 1 ? "1.0" : t.toFixed(2)}
        </p>
      ))}
    </div>
  );
}
