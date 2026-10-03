"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SensorCallout } from "@/components/fleet";
import { ARRIVAL_MS, INTRO_FADE_MS, INTRO_MS, introDelay, revealAnimation, useArrival } from "./arrival";
import { CarInspector } from "./CarInspector";
import { CarPlate } from "./CarPlate";
import { useSelection } from "./selection";
import { CARS, TELEMETRY } from "./data";
import { useCarStates, useFormation } from "./formation";
import { BODY_H, BODY_W, SCENE_SCALE } from "./projection";

// 디자인 게이지 길이(120)를 카드 안쪽 폭(204) 비율로 지정
const GAUGE_RATIO = 120 / 204;

const ConsistStage3D = dynamic(() => import("./three/ConsistStage3D"), { ssr: false });

// 열차가 멈춘 순간 카드를 다시 그려 숫자와 게이지가 0부터 차오르도록 시점 반환
function useCountStart(tick: number, delay: number) {
  const [started, setStarted] = useState(0);
  useEffect(() => {
    if (tick === 0) return;
    const id = window.setTimeout(() => setStarted(tick), delay);
    return () => window.clearTimeout(id);
  }, [tick, delay]);
  return started === tick && tick !== 0;
}

export function ConsistScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const arrival = useArrival();
  const { tick } = arrival;
  const formation = useFormation();
  const states = useCarStates();
  const { index: selected } = useSelection();
  const counting = useCountStart(tick, introDelay(arrival) + ARRIVAL_MS);

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
      {/* 열차가 스쳐 지나갈 때 화면을 어둡게 했다가 다시 밝힘 */}
      {arrival.intro && (
        <div
          key={`fade-${tick}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-(image:--gradient-panel)"
          style={{
            animation: `intro-fade-in ${INTRO_FADE_MS}ms ease-in ${INTRO_MS - INTRO_FADE_MS}ms both, intro-fade-out ${INTRO_FADE_MS}ms ease-out ${INTRO_MS}ms forwards`,
          }}
        />
      )}
      <div
        className="pointer-events-none absolute h-[596px] w-[1728px] origin-top-left [&>*]:pointer-events-auto"
        style={{ left: offset.x, top: offset.y, transform: `scale(${SCENE_SCALE})` }}
      >
        {/* 열차가 멈춘 뒤 번호판 표시 */}
        <div key={tick} className="pointer-events-none! absolute inset-0" style={{ animation: `arrive-fade ${ARRIVAL_MS}ms ease-out ${introDelay(arrival)}ms both` }}>
          {CARS.map((car, i) => (
            <CarPlate key={car.no} no={car.no} state={states[i]} index={i} selected={i === selected} />
          ))}
        </div>
        {/* 열차가 멈춘 뒤 카드 표시 */}
        <div key={`cards-${tick}`} className="pointer-events-none! absolute inset-0 [&>*]:pointer-events-auto" style={revealAnimation(arrival)}>
          {counting &&
            TELEMETRY.map((t) => (
              <SensorCallout
                key={t.label}
                label={t.label}
                value={t.value}
                unit={t.unit ?? ""}
                min={t.range[0]}
                max={t.range[1]}
                ratio={GAUGE_RATIO}
                tag={t.tag}
                showTag={Boolean(t.tag)}
                tone={t.tone}
                className={`absolute! top-0 ${t.left}`}
              />
            ))}
          <div className="absolute left-3 top-[146px] flex items-center gap-1.5 overflow-clip rounded-full border border-(--accent-cyan)/70 bg-(--neutral-sheet)/95 px-2.5 py-1 shadow-[0px_0px_10px_0px_var(--accent-cyan-glow)]">
            <div className="size-1.5 shrink-0 rounded-full bg-(--accent-cyan)" />
            <p className="whitespace-nowrap text-[11px] font-semibold leading-4 tracking-[0.5px] text-(--accent-cyan)">
              {formation} 편성 전체 · 10량
            </p>
          </div>
          <CarInspector />
        </div>
      </div>
    </div>
  );
}
