"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ARRIVAL_MS, revealAnimation, useArrivalTick } from "./arrival";
import { CarInspector } from "./CarInspector";
import { CarPlate } from "./CarPlate";
import { useSelection } from "./selection";
import { CARS, TELEMETRY } from "./data";
import { BODY_H, BODY_W, SCENE_SCALE } from "./projection";
import { TelemetryCard } from "./TelemetryCard";

const ConsistStage3D = dynamic(() => import("./three/ConsistStage3D"), { ssr: false });

export function ConsistScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const tick = useArrivalTick();
  const { index: selected } = useSelection();

  // 3D 카메라와 같은 기준으로 카드 위치 맞춤
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setOffset({ x: Math.max(0, (width - BODY_W) / 2), y: Math.max(0, (height - BODY_H) / 2) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative min-h-px w-full flex-[1_0_0] overflow-clip">
      <ConsistStage3D />
      <div
        className="pointer-events-none absolute h-[596px] w-[1728px] origin-top-left [&>*]:pointer-events-auto"
        style={{ left: offset.x, top: offset.y, transform: `scale(${SCENE_SCALE})` }}
      >
        {/* 열차가 멈춘 뒤 번호판 표시 */}
        <div key={tick} className="pointer-events-none! absolute inset-0" style={{ animation: `arrive-fade ${ARRIVAL_MS}ms ease-out both` }}>
          {CARS.map((car, i) => (
            <CarPlate key={car.no} no={car.no} state={car.state} index={i} selected={i === selected} />
          ))}
        </div>
        {/* 열차가 멈춘 뒤 카드 표시 */}
        <div key={`cards-${tick}`} className="pointer-events-none! absolute inset-0 [&>*]:pointer-events-auto" style={revealAnimation(tick)}>
          {TELEMETRY.map((t) => (
            <TelemetryCard key={t.label} {...t} />
          ))}
          <div className="absolute left-3 top-[146px] flex items-center gap-1.5 overflow-clip rounded-full border border-(--accent-cyan)/70 bg-(--neutral-sheet)/95 px-2.5 py-1 shadow-[0px_0px_10px_0px_var(--accent-cyan-glow)]">
            <div className="size-1.5 shrink-0 rounded-full bg-(--accent-cyan)" />
            <p className="whitespace-nowrap text-[11px] font-semibold leading-4 tracking-[0.5px] text-(--accent-cyan)">
              415 편성 전체 · 10량
            </p>
          </div>
          <CarInspector />
        </div>
      </div>
    </div>
  );
}
