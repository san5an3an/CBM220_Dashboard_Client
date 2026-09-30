"use client";

import { useAnimatedList } from "@/components/monitoring/live";
import { TEXT } from "@/lib/typography";
import { ObliqueBars } from "./ObliqueBars";

// Figma 막대 간격·앞면과 옆면 폭·바닥 위치와 100% 높이 지정
const STEP = 50;
const FRONT = 28;
const DEPTH = 9.8;
const BASE = 168;
const FULL = 140;
const LIFT = DEPTH * 0.6;
const MISSING_H = 4;

export type CoveragePoint = { label: string; value: number | null };

const DEFAULT_DATA: CoveragePoint[] = [
  { label: "16", value: 92 },
  { label: "17", value: 96 },
  { label: "18", value: 88 },
  { label: "19", value: null },
  { label: "20", value: 94 },
  { label: "21", value: 97 },
  { label: "22", value: 90 },
];

type Coverage3DProps = {
  data?: CoveragePoint[];
};

// 기간별 데이터 적재율을 비스듬한 3D 막대로 표시하고 적재 안 된 기간은 주의색 얇은 막대로 표시
export function Coverage3D({ data = DEFAULT_DATA }: Coverage3DProps) {
  const heights = data.map((d) => (d.value == null ? MISSING_H : (d.value / 100) * FULL));
  const shown = useAnimatedList(heights, 1200);
  const bars = data.map((d, i) => ({ x: 10 + i * STEP, height: heights[i], token: d.value == null ? "--status-warning" : "--accent-violet" }));
  return (
    <div className="relative h-[190px] w-[360px]">
      <div className="absolute top-[168px] left-0 h-px w-[360px] bg-(--chart-axis)" />
      <ObliqueBars width={360} height={190} bars={bars} front={FRONT} depth={DEPTH} baseline={BASE} />
      {data.map((d, i) => (
        <div key={d.label}>
          {d.value != null && (
            <p className={`absolute font-medium text-(--text-secondary) tabular-nums ${TEXT.labelLarge}`} style={{ left: 10.5 + i * STEP, top: BASE - LIFT - shown[i] - 20 }}>
              {Math.round((shown[i] / FULL) * 100)}%
            </p>
          )}
          <p className={`absolute top-[174px] font-medium ${TEXT.labelLarge}`} style={{ left: 15.5 + i * STEP, color: d.value == null ? "var(--status-warning)" : "var(--text-tertiary)" }}>
            {d.label}
          </p>
        </div>
      ))}
    </div>
  );
}
