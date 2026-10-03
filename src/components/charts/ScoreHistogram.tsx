"use client";

import { useState } from "react";
import { clamp, seeded, useInterval } from "@/components/monitoring/live";
import { tint } from "@/lib/tone";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { TEXT } from "@/lib/typography";
import { dragValue } from "./drag";

// Figma 두 변형의 크기·플롯 영역·구간 수·값 범위·눈금 지정
const LAYOUT = {
  sensitivity: {
    w: 1734,
    h: 372,
    left: 48,
    width: 1670,
    base: 344,
    top: 34,
    bins: 64,
    max: 1,
    digits: 1,
    ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
    peak: 27,
    bump: 41,
    lineTop: 24,
  },
  diagnostic: {
    w: 1118,
    h: 359,
    left: 8,
    width: 1094,
    base: 325,
    top: 30,
    bins: 56,
    max: 0.06,
    digits: 3,
    ticks: [0, 0.012, 0.024, 0.036, 0.048, 0.06],
    peak: 20,
    bump: 38,
    lineTop: 20,
  },
} as const;

const Y_TICKS = [0, 25, 50, 75, 100];
const LIVE_MS = 3000;

// 정상 봉우리와 작은 이상 봉우리를 합친 구간별 높이(0~1) 생성
function distribution(bins: number, peak: number, bump: number, seed: number) {
  const rand = seeded(seed);
  const raw = Array.from({ length: bins }, (_, i) => {
    const main = Math.exp(-((i - peak) ** 2) / (2 * 5.2 ** 2));
    const second = 0.13 * Math.exp(-((i - bump) ** 2) / (2 * 4 ** 2));
    return main + second + rand() * 0.01;
  });
  const top = Math.max(...raw);
  return raw.map((v) => Math.round(Math.max(0.012, v / top) * 10000) / 10000);
}

type ScoreHistogramProps = {
  variant?: keyof typeof LAYOUT;
  // 저장된 임계값 지정
  threshold?: number;
  // sensitivity 변형의 처음 미리보기 임계값 지정
  preview?: number;
  onPreviewChange?: (v: number) => void;
  // 몇 초마다 분포가 조금씩 바뀌는 임시 실시간 표시 지정
  live?: boolean;
};

// 이상 점수 분포 막대와 임계선·이상 구간을 표시하고 임계선을 끌어 옮길 수 있게 처리
export function ScoreHistogram({ variant = "sensitivity", threshold, preview, onPreviewChange, live = true }: ScoreHistogramProps) {
  const L = LAYOUT[variant];
  const saved = threshold ?? (variant === "sensitivity" ? 0.8 : 0.0433);
  const [active, setActive] = useState(preview ?? (variant === "sensitivity" ? 0.8333 : saved));
  const [bins, setBins] = useState(() => distribution(L.bins, L.peak, L.bump, L.bins));
  useInterval(() => {
    if (live) setBins((b) => b.map((v) => (v <= 0.012 ? v : clamp(v * (1 + (Math.random() - 0.5) * 0.12), 0.012, 1))));
  }, LIVE_MS);

  const x = (v: number) => L.left + (v / L.max) * L.width;
  const step = L.width / L.bins;
  const plotH = L.base - L.top;
  const activeX = x(active);
  const onDrag = dragValue({ left: L.left, width: L.width, width0: L.w, min: 0, max: L.max }, (v) => {
    const r = Math.round(v / (L.max / 10000)) * (L.max / 10000);
    setActive(r);
    onPreviewChange?.(r);
  });
  const fmt = (v: number) => v.toFixed(4);
  const { tip, track, show, hide } = useValueTip<number>();

  return (
    <div data-chart className="relative select-none" style={{ width: L.w, height: L.h }} onPointerMove={track} onPointerLeave={hide}>
      {variant === "sensitivity" &&
        Y_TICKS.map((t) => {
          const y = L.base - (plotH * t) / 100;
          return (
            <div key={t}>
              <div className={`absolute h-px ${t === 0 ? "bg-(--chart-axis)" : "bg-(--chart-grid)"}`} style={{ left: L.left, width: L.width, top: y }} />
              <p className={`absolute left-0 w-10 -translate-y-1/2 text-right font-medium text-(--text-tertiary) ${TEXT.labelSmall}`} style={{ top: y }}>
                {t === 0 ? "0" : `${t}%`}
              </p>
            </div>
          );
        })}
      {variant === "diagnostic" && <div className="absolute h-px bg-(--chart-axis)" style={{ left: L.left, width: L.width, top: L.base }} />}
      <div
        className="absolute rounded-tr-[12px] transition-[left,width] duration-150"
        style={{
          left: activeX,
          width: L.left + L.width - activeX,
          top: L.top,
          height: plotH,
          backgroundImage: `linear-gradient(to bottom, ${tint("--status-danger", 14)}, ${tint("--status-danger", 2)})`,
        }}
      />
      {bins.map((b, i) => {
        const over = ((i + 0.5) / L.bins) * L.max >= active;
        const tall = b > 0.55 && !over;
        return (
          <div
            key={i}
            className="absolute rounded-t-[4px]"
            style={{
              left: L.left + 1.5 + i * step,
              width: step - 3,
              top: L.base - b * plotH,
              height: b * plotH,
              boxShadow: tall ? `0 0 10px 0 ${tint("--accent-cyan", 25)}` : `0 0 10px 0 transparent`,
              transition: "height 700ms ease-out, top 700ms ease-out, box-shadow 300ms ease",
            }}
            onPointerEnter={(e) => show(i, e)}
            onPointerLeave={hide}
          >
            {/* 임계선을 넘나들면 버튼 반전처럼 두 색 층이 0.3초 동안 서로 바뀌도록 처리 */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[inherit] transition-opacity duration-300 ease-out"
              style={{ backgroundImage: `linear-gradient(to bottom, ${tint("--accent-cyan", 95)}, ${tint("--accent-violet", 35)})`, opacity: over ? 0 : 1 }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-[inherit] transition-opacity duration-300 ease-out"
              style={{ backgroundImage: `linear-gradient(to bottom, var(--status-danger), ${tint("--status-danger", 35)})`, opacity: over ? 1 : 0 }}
            />
          </div>
        );
      })}
      {variant === "sensitivity" && (
        <>
          <div
            className="absolute w-0 border-l-[1.5px] border-dashed border-(--text-secondary)/90"
            style={{
              left: x(saved),
              top: L.lineTop,
              height: L.base - L.lineTop,
            }}
          />
          <div
            className="absolute top-1 -translate-x-full rounded-full border border-(--text-secondary)/45 bg-(--text-secondary)/16 px-2.5 py-1"
            style={{ left: x(saved) - 7 }}
          >
            <p className={`font-semibold whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>저장 {fmt(saved)}</p>
          </div>
        </>
      )}
      {/* 끌 수 있도록 선 좌우를 넓게 잡는 투명 손잡이와 이상 임계선 표시 */}
      <div
        role="slider"
        aria-label="미리보기 임계값"
        aria-valuemin={0}
        aria-valuemax={L.max}
        aria-valuenow={active}
        tabIndex={0}
        onPointerDown={onDrag}
        onKeyDown={(e) => {
          const d = L.max / 200;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const v = clamp(active + (e.key === "ArrowRight" ? d : -d), 0, L.max);
            setActive(v);
            onPreviewChange?.(v);
          }
        }}
        className="absolute w-4 -translate-x-1/2 cursor-ew-resize outline-none"
        style={{ left: activeX, top: L.lineTop, height: L.base - L.lineTop }}
      >
        <div
          className="absolute left-1/2 h-full w-0 border-l-[1.5px] border-dashed border-(--status-danger)"
          style={{
            filter: `drop-shadow(0 0 4px ${tint("--status-danger", 70)})`,
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute rounded-full border border-(--status-danger)/45 bg-(--status-danger)/16 px-2.5 py-1"
        style={{
          left: activeX + (variant === "sensitivity" ? 6 : 4),
          top: variant === "sensitivity" ? 4 : 0,
        }}
      >
        <p className={`font-semibold whitespace-nowrap text-(--status-danger) tabular-nums ${TEXT.labelSmall}`}>
          {variant === "sensitivity" ? "미리보기" : "임계"} {fmt(active)}
        </p>
      </div>
      {L.ticks.map((t, i) => (
        <p
          key={t}
          className={`absolute font-medium text-(--text-tertiary) ${TEXT.labelSmall} ${i === 0 ? "" : i === L.ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
          style={{
            left: i === 0 ? (variant === "sensitivity" ? x(t) - 8.5 : x(t)) : i === L.ticks.length - 1 ? x(t) + (variant === "sensitivity" ? 8.5 : 0) : x(t),
            top: L.base + 8,
          }}
        >
          {t.toFixed(L.digits)}
        </p>
      ))}
      {tip && (
        <ValueTip
          at={tip}
          label={`이상 점수 ${fmt((tip.item / L.bins) * L.max)} ~ ${fmt(((tip.item + 1) / L.bins) * L.max)}`}
          rows={[
            {
              name: "비율",
              value: (bins[tip.item] * 100).toFixed(1),
              unit: "%",
              color: ((tip.item + 0.5) / L.bins) * L.max >= active ? "var(--status-danger)" : "var(--accent-cyan)",
            },
          ]}
        />
      )}
    </div>
  );
}
