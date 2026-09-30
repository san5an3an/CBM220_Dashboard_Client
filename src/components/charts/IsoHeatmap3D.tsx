"use client";

import { useState } from "react";
import { Tag } from "@/components/foundations";
import { clamp, seeded, useInterval } from "@/components/monitoring/live";
import { type IsoShade, IsoPrism, IsoView, isoHeight, isoSide, isoToScreen, screenToIso } from "@/components/three/iso";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 크기·바닥 중심 위치·칸 간격·칸 크기·1% 당 높이(px) 지정
const W = 560;
const H = 467;
const FLOOR = screenToIso(-11, 118);
const PITCH = 43.7;
const SIDE = isoSide(50.23);
const PX_PER = 4.36;
const LIVE_MS = 4000;
const SHADE: IsoShade = { left: [0.8, 0.3], right: [0.5, 0.15], topWhite: 0.6, topAlpha: 1 };
// 지시선 태그를 칸 윗면에서 띄울 위치(px) 지정
const TAG_OFFSETS = [
  [-75, -150],
  [65, -148],
] as const;

// 이상 비율 구간별 히트맵 색 토큰 계산
const heatToken = (v: number) => (v >= 20 ? "--chart-heat-critical" : v >= 10 ? "--chart-heat-high" : v >= 5 ? "--chart-heat-mid" : "--chart-heat-low");

// 편성·호차 칸의 바닥 중심 등각 좌표 계산
const cellBase = (f: number, c: number) => [FLOOR[0] - (f - 2.5) * PITCH, 0, FLOOR[2] + (c - 4.5) * PITCH] as const;

// 등각 좌표를 컴포넌트 왼쪽 위 기준 px 위치로 변환
const toPx = (x: number, y: number, z: number) => {
  const [sx, sy] = isoToScreen(x, y, z);
  return [W / 2 + sx, H / 2 + sy] as const;
};

// 대부분 낮고 몇 칸만 높은 편성×호차 이상 비율 생성
function initial(formations: number, cars: number) {
  const rand = seeded(560);
  const grid = Array.from({ length: formations }, () => Array.from({ length: cars }, () => Math.round((1 + rand() * rand() * 17) * 10) / 10));
  grid[3][2] = 33.9;
  grid[4][3] = 27.3;
  return grid;
}

type IsoHeatmap3DProps = {
  formations?: string[];
  cars?: number;
  values?: number[][];
  live?: boolean;
};

// 편성×호차 이상 비율을 바닥 격자 위 등각 3D 막대로 표시하고 가장 높은 두 칸에 지시선 태그 표시
export function IsoHeatmap3D({ formations = ["401", "402", "403", "404", "405", "406"], cars = 10, values, live = true }: IsoHeatmap3DProps) {
  const [grid, setGrid] = useState(() => values ?? initial(formations.length, cars));
  const [hover, setHover] = useState<[number, number] | null>(null);
  useInterval(() => {
    if (!live) return;
    const f = Math.floor(Math.random() * formations.length);
    const c = Math.floor(Math.random() * cars);
    setGrid((g) => g.map((row, i) => row.map((v, j) => (i === f && j === c ? Math.round(clamp(v + (Math.random() - 0.5) * 6, 1, 36) * 10) / 10 : v))));
  }, LIVE_MS);

  const cells = grid.flatMap((row, f) => row.map((v, c) => ({ f, c, v })));
  const top2 = [...cells].sort((a, b) => b.v - a.v).slice(0, 2);
  const corner = (f: number, c: number) => {
    const [x, , z] = cellBase(f, c);
    return toPx(x, 0, z);
  };
  const floor = [corner(-0.55, -0.55), corner(-0.55, cars - 0.45), corner(formations.length - 0.45, cars - 0.45), corner(formations.length - 0.45, -0.55)];
  const anchor = (f: number, c: number, v: number) => {
    const [x, , z] = cellBase(f, c);
    return toPx(x, isoHeight(v * PX_PER), z);
  };

  return (
    <div className="relative h-[467px] w-[560px]">
      <svg className="absolute inset-0 overflow-visible" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="heat-floor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: tint("--accent-cyan", 10) }} />
            <stop offset="1" style={{ stopColor: tint("--accent-violet", 3) }} />
          </linearGradient>
        </defs>
        <polygon points={floor.map((p) => p.join(",")).join(" ")} fill="url(#heat-floor)" strokeWidth={1.5} style={{ stroke: tint("--accent-cyan", 35) }} />
      </svg>
      <IsoView width={W} height={H}>
        {cells.map(({ f, c, v }) => (
          <IsoPrism
            key={`${f}-${c}`}
            token={heatToken(v)}
            side={SIDE}
            height={isoHeight(v * PX_PER)}
            shade={SHADE}
            position={cellBase(f, c)}
            onHover={(over) => setHover(over ? [f, c] : null)}
          />
        ))}
      </IsoView>
      {Array.from({ length: cars }, (_, c) => {
        const [x, , z] = cellBase(formations.length - 0.5 + 0.55, c);
        const [px, py] = toPx(x, 0, z);
        return (
          <p key={c} className={`absolute -translate-1/2 font-medium text-(--text-tertiary) ${TEXT.labelLarge}`} style={{ left: px, top: py }}>
            {c + 1}
          </p>
        );
      })}
      {formations.map((name, f) => {
        const [x, , z] = cellBase(f, cars - 0.5 + 0.7);
        const [px, py] = toPx(x, 0, z);
        return (
          <p key={name} className={`absolute -translate-1/2 font-semibold text-(--text-secondary) ${TEXT.labelLarge}`} style={{ left: px, top: py }}>
            {name}
          </p>
        );
      })}
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {top2.map(({ f, c, v }, i) => {
          const [ax, ay] = anchor(f, c, v);
          const [tx, ty] = [ax + TAG_OFFSETS[i][0], ay + TAG_OFFSETS[i][1] + 12];
          return (
            <g key={`${f}-${c}`}>
              <line x1={tx} y1={ty} x2={ax} y2={ay} strokeWidth={1} strokeDasharray="3 3" style={{ stroke: "var(--status-danger)" }} />
              <circle cx={ax} cy={ay} r={3.5} style={{ fill: "var(--status-danger)", stroke: tint("--white", 90), strokeWidth: 1.5 }} />
            </g>
          );
        })}
      </svg>
      {top2.map(({ f, c, v }, i) => {
        const [ax, ay] = anchor(f, c, v);
        return (
          <div key={`${f}-${c}`} className="pointer-events-none absolute -translate-1/2 transition-[left,top] duration-700" style={{ left: ax + TAG_OFFSETS[i][0], top: ay + TAG_OFFSETS[i][1] }}>
            <Tag tone="coral" label={`${v.toFixed(1)}%`} />
          </div>
        );
      })}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[8px] border border-(--border-strong) bg-(--neutral-popover) px-2 py-1 whitespace-nowrap"
          style={{ left: anchor(hover[0], hover[1], grid[hover[0]][hover[1]])[0], top: anchor(hover[0], hover[1], grid[hover[0]][hover[1]])[1] - 8 }}
        >
          <p className={`font-medium text-(--text-primary) ${TEXT.labelSmall}`}>
            {formations[hover[0]]} · {String(hover[1] + 1).padStart(2, "0")}호차 {grid[hover[0]][hover[1]].toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
