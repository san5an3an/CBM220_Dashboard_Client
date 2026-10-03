"use client";

import { ArrowDownRight, ArrowUpRight, Undo2 } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 윗면 140×80·옆면 16px 에서 역산한 내려다보는 각도(도)와 프리즘 두께 지정
const HEX_ELEVATION = (Math.asin(80 / (140 * Math.sin(Math.PI / 3))) * 180) / Math.PI;
const SIN = Math.sin((HEX_ELEVATION * Math.PI) / 180);
const COS = Math.cos((HEX_ELEVATION * Math.PI) / 180);
export const HEX_HEIGHT = 16 / COS;
export const HEX_W = 140;
export const HEX_H = 96;
// 윗면 가운데가 타일 틀 위에서 40px 에 오도록 프리즘 가운데 높이 계산
const HEX_TOP_Y = HEX_HEIGHT / 2;
// 마우스를 올리면 떠오르는 높이(월드 단위) 지정
const LIFT = 8;
// 상태가 바뀔 때 버튼 반전과 같은 0.3초 동안 색이 넘어가도록 지정
const FADE = { transition: "fill 300ms ease, stroke 300ms ease, stroke-opacity 300ms ease, stroke-width 300ms ease" };
// 그림 틀을 타일보다 사방으로 넓힌 여백(px) 지정
const PAD = 12;
const VIEW_W = HEX_W + PAD * 2;
const VIEW_H = HEX_H + PAD * 2;

export const DEPOT_STATE = {
  up: { token: "--status-success", icon: ArrowUpRight },
  down: { token: "--status-warning", icon: ArrowDownRight },
  depot: { token: "--grade-d", icon: Undo2 },
} as const;

export type DepotState = keyof typeof DEPOT_STATE;

// 내려다보는 각도로 본 월드 좌표를 그림 틀 안 px 좌표로 변환
const project = (x: number, y: number, z: number): [number, number] => [VIEW_W / 2 + x, VIEW_H / 2 - (y * COS - z * SIN)];
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x},${y}`).join(" ");

// 육각 꼭짓점 여섯 개를 좌우 꼭짓점·앞뒤 평평한 변 순서로 계산
const CORNERS = Array.from({ length: 6 }, (_, i) => {
  const a = Math.PI / 6 + (i * Math.PI) / 3;
  return [70 * Math.sin(a), 70 * Math.cos(a)] as const;
});
const TOP = CORNERS.map(([x, z]) => project(x, HEX_TOP_Y, z));
const RING = CORNERS.map(([x, z]) => project(x, HEX_TOP_Y + 0.2, z));
// 앞쪽 옆면 세 개를 합친 띠를 윗면 안쪽까지 덮도록 계산
const SIDE = pts([project(-70, HEX_TOP_Y, 0), project(70, HEX_TOP_Y, 0), ...[1, 0, 5, 4].map((i) => project(CORNERS[i][0], -HEX_TOP_Y, CORNERS[i][1]))]);
const TOP_POINTS = pts(TOP);

// 쉬는 위치부터 떠오른 위치까지 타일이 지나는 자리를 덮는 움직이지 않는 마우스 감지 영역 계산
const HIT = pts([
  ...[4, 3, 2, 1].map((i) => project(CORNERS[i][0], HEX_TOP_Y + LIFT, CORNERS[i][1])),
  ...[1, 0, 5, 4].map((i) => project(CORNERS[i][0], -HEX_TOP_Y, CORNERS[i][1])),
]);

// 두 직선(점과 방향)의 교점 계산
function meet(p: [number, number], d: [number, number], q: [number, number], e: [number, number]): [number, number] {
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / (d[0] * e[1] - d[1] * e[0]);
  return [p[0] + d[0] * t, p[1] + d[1] * t];
}

// 3D 에서 윗면이 뒤쪽 테두리선의 아래쪽을 가리던 깊이 비교를 재현하는 덮개 계산
const OCCLUDER = (() => {
  // 선이 윗면보다 0.2 높아 선 중심보다 화면에서 0.2/cos 넘게 아래인 윗면이 선보다 가까움
  const reach = 0.2 / COS;
  // 꼭짓점 순서: 0 앞오른쪽 · 1 오른쪽 · 2 뒤오른쪽 · 3 뒤왼쪽 · 4 왼쪽 · 5 앞왼쪽
  const edges = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = RING[i];
    const b = RING[(i + 1) % 6];
    const d: [number, number] = [b[0] - a[0], b[1] - a[1]];
    const back = i >= 1 && i <= 3;
    // 뒤쪽 변은 깊이 경계까지 내리고 앞쪽 변은 선을 덮지 않도록 안쪽으로 물림
    const cos2 = (d[0] * d[0]) / (d[0] * d[0] + d[1] * d[1]);
    const shift = back ? reach / cos2 : -3;
    return { p: [a[0], a[1] + shift] as [number, number], d };
  });
  return pts(edges.map((e, i) => meet(edges[(i + 5) % 6].p, edges[(i + 5) % 6].d, e.p, e.d)));
})();

type HexPrismProps = {
  state: DepotState;
  hovered?: boolean;
  selected?: boolean;
  // 처음 솟아오르는 순서 지연(초) 지정
  delay?: number;
  onHover?: (over: boolean) => void;
  onClick?: () => void;
};

// 상태 색 육각 프리즘을 아래에서 솟아오르게 하고 마우스를 올리거나 고르면 떠오르도록 갱신
function HexPrism({ state, hovered = false, selected = false, delay = 0, onHover, onClick }: HexPrismProps) {
  const ref = useRef<SVGGElement>(null);
  const lifted = useRef(hovered || selected);
  useEffect(() => {
    lifted.current = hovered || selected;
  }, [hovered, selected]);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    let last = 0;
    let y = -40;
    const tick = (now: number) => {
      const g = ref.current;
      if (g) {
        if (start === null) {
          start = now;
          last = now;
        }
        const delta = (now - last) / 1000;
        last = now;
        // 처음에는 아래에서 솟아오르고 이후에는 떠오름 높이를 부드럽게 따라가도록 계산
        const t = Math.min(1, Math.max(0, ((now - start) / 1000 - delay) / 0.6));
        const target = -((1 - t) ** 3) * 40 + (lifted.current ? LIFT : 0);
        y = t < 1 ? target : y + (target - y) * (1 - Math.exp(-delta * 10));
        g.style.visibility = t > 0 ? "visible" : "hidden";
        g.setAttribute("transform", `translate(0 ${-y * COS})`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay]);
  const token = DEPOT_STATE[state].token;
  return (
    <svg aria-hidden width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="pointer-events-none absolute" style={{ left: -PAD, top: -PAD }}>
      <g ref={ref} transform={`translate(0 ${40 * COS})`} style={{ visibility: "hidden" }}>
        {/* 3D 렌더러가 반올림 경계(x.5)를 올림하던 결과에 맞춰 비율을 0.001% 높여 지정 */}
        <polygon style={FADE} points={SIDE} fill={`color-mix(in srgb, var(${token}) 45.001%, var(--navy-800))`} />
        <polygon style={FADE} points={TOP_POINTS} fill={`color-mix(in srgb, var(${token}) 55%, var(--navy-800))`} />
        {/* 3D 선처럼 변마다 둥근 끝 선을 따로 그려 꼭짓점 겹침까지 같게 표시 */}
        {RING.map(([x1, y1], i) => {
          const [x2, y2] = RING[(i + 1) % 6];
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`var(${token})`}
              strokeOpacity={selected ? 1 : 0.8}
              strokeWidth={selected ? 2.4 : 1.5}
              strokeLinecap="round"
              style={FADE}
            />
          );
        })}
        <polygon style={FADE} points={OCCLUDER} fill={`color-mix(in srgb, var(${token}) 55%, var(--navy-800))`} />
      </g>
      <polygon
        points={HIT}
        fill="transparent"
        className="pointer-events-auto"
        onPointerEnter={() => onHover?.(true)}
        onPointerLeave={() => onHover?.(false)}
        onClick={onClick}
      />
    </svg>
  );
}

type HexLabelProps = { number: string; station: string; state: DepotState; lifted?: boolean; style?: CSSProperties };

// 타일 윗면에 편성 번호·방향 아이콘·위치를 표시
function HexLabel({ number, station, state, lifted = false, style }: HexLabelProps) {
  const { token, icon: Icon } = DEPOT_STATE[state];
  return (
    <div
      className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center transition-transform duration-300"
      style={{ ...style, transform: `translateY(${lifted ? -LIFT * COS : 0}px)` }}
    >
      <div className="flex items-center gap-1">
        <Icon size={16} strokeWidth={2} absoluteStrokeWidth style={{ color: `var(${token})` }} />
        <p className={`font-bold whitespace-nowrap text-(--text-primary) ${TEXT.titleLarge}`}>{number}</p>
      </div>
      <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{station}</p>
    </div>
  );
}

type DepotHexProps = {
  number?: string;
  state?: DepotState;
  station?: string;
  selected?: boolean;
  onSelect?: () => void;
};

// 편성 하나를 상태 색 입체 육각 타일로 표시하고 마우스를 올리면 떠오르도록 갱신
export function DepotHex({ number = "401", state = "up", station = "당고개", selected = false, onSelect }: DepotHexProps) {
  const [hover, setHover] = useState(false);
  const token = DEPOT_STATE[state].token;
  return (
    <div className="relative shrink-0" style={{ width: HEX_W, height: HEX_H }}>
      <div aria-hidden className="absolute inset-x-3 bottom-0 h-6 rounded-full blur-[10px]" style={{ background: tint(token, state === "depot" ? 15 : 35) }} />
      <HexPrism state={state} hovered={hover} selected={selected} onHover={setHover} onClick={onSelect} />
      <HexLabel number={number} station={station} state={state} lifted={hover || selected} style={{ left: 70, top: 18 }} />
    </div>
  );
}
