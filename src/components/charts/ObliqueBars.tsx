"use client";

import { useEffect, useId, useRef } from "react";
import { LAYER, subscribe } from "@/components/three/iso";

// Figma 비스듬한 막대의 깊이 1px 당 위로 밀리는 비율 지정
export const OBLIQUE_SLOPE = 0.6;
// 값 구간이 바뀌어 색이 바뀔 때 버튼 반전과 같은 0.3초 동안 넘어가도록 지정
const FADE = "300ms ease";

export type ObliqueBar = {
  // 앞면 왼쪽 x(px) 지정
  x: number;
  // 앞면 높이(px) 지정
  height: number;
  token: string;
};

type BarsProps = {
  bars: ObliqueBar[];
  // 앞면 폭(px) 지정
  front: number;
  // 옆면 가로 폭(px) 지정
  depth: number;
  // 막대 바닥의 화면 위쪽 기준 y(px) 지정
  baseline: number;
  // 마우스를 올린 막대 순서(벗어나면 null) 알림 지정
  onHover?: (index: number | null) => void;
};

type BarProps = { bar: ObliqueBar; index: number; front: number; depth: number; baseline: number; onHover?: (index: number | null) => void };

const pts = (list: readonly (readonly [number, number])[]) => list.map(([x, y]) => `${x},${y}`).join(" ");

// 앞면은 위가 진하고 아래가 옅게, 옆면은 더 옅게, 윗면은 흰빛으로 칠한 비스듬한 막대 하나를 목표 높이까지 자라게 표시
function Bar({ bar, index, front, depth, baseline, onHover }: BarProps) {
  const id = useId().replace(/:/g, "");
  const frontRef = useRef<SVGPolygonElement>(null);
  const topRef = useRef<SVGPolygonElement>(null);
  const sideRef = useRef<SVGPolygonElement>(null);
  const frontGrad = useRef<SVGLinearGradientElement>(null);
  const sideGrad = useRef<SVGLinearGradientElement>(null);
  const shown = useRef(0);
  const live = useRef({ bar, front, depth, baseline });
  useEffect(() => {
    live.current = { bar, front, depth, baseline };
  });

  useEffect(
    () =>
      subscribe((_, dt) => {
        const { bar: b, front: f, depth: d, baseline: base } = live.current;
        // 막대 높이가 목표까지 부드럽게 자라도록 계산
        shown.current += (b.height - shown.current) * (1 - Math.exp(-dt * 4));
        const h = Math.max(0.01, shown.current);
        const top = base - h;
        const dx = d;
        const dy = d * OBLIQUE_SLOPE;
        const x0 = b.x;
        const x1 = b.x + f;
        frontRef.current?.setAttribute("points", pts([[x0, top], [x1, top], [x1, base], [x0, base]]));
        topRef.current?.setAttribute("points", pts([[x0, top], [x1, top], [x1 + dx, top - dy], [x0 + dx, top - dy]]));
        sideRef.current?.setAttribute("points", pts([[x1, top], [x1 + dx, top - dy], [x1 + dx, base - dy], [x1, base]]));
        frontGrad.current?.setAttribute("y1", `${top}`);
        frontGrad.current?.setAttribute("y2", `${base}`);
        // 옆면 위 모서리에 수직인 방향으로 위→아래 불투명도가 바뀌도록 계산
        const len = Math.hypot(dx, dy);
        const nx = dy / len;
        const ny = dx / len;
        const l = h * ny;
        sideGrad.current?.setAttribute("x1", `${x1}`);
        sideGrad.current?.setAttribute("y1", `${top}`);
        sideGrad.current?.setAttribute("x2", `${x1 + nx * l}`);
        sideGrad.current?.setAttribute("y2", `${top + ny * l}`);
      }),
    [],
  );

  const fade = { transition: `stop-color ${FADE}` };
  const tone = `var(${bar.token})`;
  return (
    <g
      className={onHover ? "pointer-events-auto" : undefined}
      onPointerEnter={onHover ? () => onHover(index) : undefined}
      onPointerLeave={onHover ? () => onHover(null) : undefined}
    >
      <defs>
        <linearGradient ref={frontGrad} id={`${id}-f`} gradientUnits="userSpaceOnUse" x1="0" x2="0">
          <stop offset="0" style={{ ...fade, stopColor: tone, stopOpacity: 0.95 }} />
          <stop offset="1" style={{ ...fade, stopColor: tone, stopOpacity: 0.25 }} />
        </linearGradient>
        <linearGradient ref={sideGrad} id={`${id}-s`} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ ...fade, stopColor: tone, stopOpacity: 0.55 }} />
          <stop offset="1" style={{ ...fade, stopColor: tone, stopOpacity: 0.08 }} />
        </linearGradient>
      </defs>
      <polygon ref={sideRef} fill={`url(#${id}-s)`} />
      <polygon ref={topRef} fill="white" fillOpacity={0.55} />
      <polygon ref={frontRef} fill={`url(#${id}-f)`} />
    </g>
  );
}

type ObliqueBarsProps = BarsProps & {
  width: number;
  height: number;
};

// 앞면·옆면·윗면이 보이는 반투명 비스듬한 막대들을 SVG 로 표시
export function ObliqueBars({ width, height, bars, front, depth, baseline, onHover }: ObliqueBarsProps) {
  return (
    <svg className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: LAYER }} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {bars.map((b, i) => (
        <Bar key={i} bar={b} index={i} front={front} depth={depth} baseline={baseline} onHover={onHover} />
      ))}
    </svg>
  );
}
