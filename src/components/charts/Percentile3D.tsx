"use client";

import { useState } from "react";
import { IsoPrism, IsoView, isoHeight, isoSide, screenToIso } from "@/components/three/iso";
import { useAnimatedList } from "@/components/monitoring/live";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 크기·큐브 간격·바닥 중심 y·건수 1 당 높이(px) 지정
const W = 380;
const H = 220;
const STEP = 75;
const BASE_Y = 170;
const PX_PER = 3;
const SIDE = isoSide(40);

export type PercentilePoint = { percentile: string; count: number };

const DEFAULT_DATA: PercentilePoint[] = [
  { percentile: "98.7", count: 42 },
  { percentile: "99.0", count: 31 },
  { percentile: "99.3", count: 22 },
  { percentile: "99.6", count: 14 },
  { percentile: "99.9", count: 6 },
];

type Percentile3DProps = {
  data?: PercentilePoint[];
  selected?: string;
  onSelect?: (percentile: string) => void;
};

// 백분위별 예상 알람 건수를 등각 3D 큐브 막대로 표시하고 고른 백분위를 강조 표시
export function Percentile3D({ data = DEFAULT_DATA, selected: initial = "99.6", onSelect }: Percentile3DProps) {
  const [selected, setSelected] = useState(initial);
  const shown = useAnimatedList(data.map((d) => d.count * PX_PER), 1200);
  const pick = (p: string) => {
    setSelected(p);
    onSelect?.(p);
  };
  return (
    <div className="relative h-[220px] w-[380px]">
      <div className="absolute top-[150px] left-2.5 h-[70px] w-[360px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint("--accent-cyan", 30)}, transparent)` }} />
      {data.map((d, i) => {
        const cx = 40 + i * STEP;
        return d.percentile === selected ? (
          <div key={d.percentile} className="absolute size-16 -translate-1/2 rounded-full blur-[18px]" style={{ left: cx, top: BASE_Y - shown[i] / 2, background: tint("--status-danger", 45) }} />
        ) : null;
      })}
      <IsoView width={W} height={H}>
        {data.map((d, i) => {
          const base = screenToIso(40 + i * STEP - W / 2, BASE_Y - H / 2);
          const on = d.percentile === selected;
          return (
            <IsoPrism
              key={d.percentile}
              token={on ? "--status-danger" : "--accent-cyan"}
              side={SIDE}
              height={isoHeight(d.count * PX_PER)}
              position={base}
              onClick={() => pick(d.percentile)}
            />
          );
        })}
      </IsoView>
      {data.map((d, i) => {
        const cx = 40 + i * STEP;
        const on = d.percentile === selected;
        return (
          <div key={d.percentile}>
            <p
              className={`absolute -translate-x-1/2 whitespace-nowrap tabular-nums ${on ? `font-semibold text-(--status-danger) ${TEXT.labelSmall}` : `font-medium text-(--text-secondary) ${TEXT.labelLarge}`}`}
              style={{ left: cx, top: BASE_Y - 10 - shown[i] - 24 }}
            >
              {d.count}건
            </p>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => pick(d.percentile)}
              className={`absolute top-[204px] -translate-x-1/2 cursor-pointer whitespace-nowrap ${TEXT.labelLarge} ${on ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-tertiary) hover:text-(--text-secondary)"}`}
              style={{ left: cx }}
            >
              {d.percentile}
            </button>
          </div>
        );
      })}
    </div>
  );
}
