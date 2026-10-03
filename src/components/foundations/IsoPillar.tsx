"use client";

import { useEffect, useRef } from "react";
import { LAYER, subscribe } from "@/components/three/iso";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { STATUS, STATUS_NAME, type Status, tint } from "@/lib/tone";

// 정면 폭 22·깊이 10·기본 틀 높이 120 의 Figma 기둥 치수 지정
const FRONT = 22;
const DEPTH = 10;
const VIEW_W = 32;

type IsoPillarProps = {
  status: Status;
  // 기둥 높이 비율(0~1) 지정
  value?: number;
  // 기둥 틀 높이(px) 지정
  height?: number;
  // 마우스를 올리면 수치 말풍선 표시 지정
  tip?: boolean;
};

// 기존 3D 조명 결과를 상태 5색으로 재서 맞춘 면별 밝기 배수(선형 색 공간) 지정
const LIT = {
  front: (c: string) => `color(from ${c} srgb-linear calc(r * 1.0483 + 0.0012) calc(g * 1.0483 + 0.0012) calc(b * 1.0483 + 0.0012))`,
  top: (c: string) => `color(from ${c} srgb-linear calc(r * 0.7454 + 0.6107) calc(g * 0.7454 + 0.6107) calc(b * 0.7454 + 0.6107))`,
  side: (c: string) => `color(from ${c} srgb-linear calc(r * 0.3092 + 0.0006) calc(g * 0.3092 + 0.0006) calc(b * 0.3092 + 0.0006))`,
};
// 조명을 받은 흰 광택 띠 색 지정
const SHINE = "color(srgb-linear 0.7995 0.7995 0.7995)";
// 상태가 바뀔 때 버튼 반전과 같은 0.3초 동안 색이 넘어가도록 지정
const FADE = { transition: "fill 300ms ease" };

// 목표 높이까지 부드럽게 자라고 앞면 광택 띠가 천천히 오르내리는 기둥을 SVG 면으로 표시
function Pillar({ status, value, height: viewH }: Required<Omit<IsoPillarProps, "tip">>) {
  const MAX_H = viewH - DEPTH;
  const front = useRef<SVGRectElement>(null);
  const top = useRef<SVGPolygonElement>(null);
  const side = useRef<SVGPolygonElement>(null);
  const shine = useRef<SVGRectElement>(null);
  const shown = useRef(0);
  const live = useRef({ value, MAX_H });
  useEffect(() => {
    live.current = { value, MAX_H };
  });

  useEffect(
    () =>
      subscribe((t, dt) => {
        const { value: v, MAX_H: max } = live.current;
        // 목표 높이까지 부드럽게 자라고 표면 광택이 천천히 오르내리도록 계산
        const target = Math.max(0.02, Math.min(1, v)) * max;
        shown.current += (target - shown.current) * (1 - Math.exp(-dt * 4));
        const h = shown.current;
        const y = viewH - h;
        front.current?.setAttribute("y", `${y}`);
        front.current?.setAttribute("height", `${h}`);
        top.current?.setAttribute("points", `0,${y} ${FRONT},${y} ${VIEW_W},${y - DEPTH} ${DEPTH},${y - DEPTH}`);
        side.current?.setAttribute("points", `${FRONT},${y} ${VIEW_W},${y - DEPTH} ${VIEW_W},${viewH - DEPTH} ${FRONT},${viewH}`);
        const s = h / max;
        if (shine.current) {
          shine.current.setAttribute("y", `${viewH - (max - 3) * s + 0.1}`);
          shine.current.setAttribute("height", `${Math.max(0, (max - 6) * s)}`);
          shine.current.setAttribute("fill-opacity", `${0.25 + 0.2 * (Math.sin(t * 1.6) + 1) * 0.5}`);
        }
      }),
    [viewH],
  );

  const tone = `var(${STATUS[status]})`;
  return (
    <svg className="pointer-events-none absolute inset-0" style={{ zIndex: LAYER }} width={VIEW_W} height={viewH} viewBox={`0 0 ${VIEW_W} ${viewH}`}>
      <polygon ref={side} style={{ ...FADE, fill: LIT.side(tone) }} />
      <polygon ref={top} style={{ ...FADE, fill: LIT.top(tone) }} />
      <rect ref={front} x={0} width={FRONT} style={{ ...FADE, fill: LIT.front(tone) }} />
      <rect ref={shine} x={2.9} width={3} fill={SHINE} />
    </svg>
  );
}

// 운행 상태별 색의 입체 기둥을 목표 높이까지 자라게 표시
export function IsoPillar({ status, value = 1, height = 120, tip: withTip = true }: IsoPillarProps) {
  const { tip, track, show, hide } = useValueTip<true>();
  return (
    <div
      className="relative shrink-0"
      style={{ width: VIEW_W, height }}
      onPointerEnter={withTip ? (e) => show(true, e) : undefined}
      onPointerMove={withTip ? track : undefined}
      onPointerLeave={withTip ? hide : undefined}
    >
      {/* 기둥 아래로 번지는 상태 색 그림자 표시 */}
      <div
        aria-hidden
        className="absolute right-0 bottom-0 left-0 rounded-full blur-[11px]"
        style={{ height: "60%", translate: "0 10px", background: tint(STATUS[status], 35) }}
      />
      <Pillar status={status} value={value} height={height} />
      <ValueTip at={tip} label={STATUS_NAME[status]} rows={[{ name: "비율", value: Math.round(Math.max(0, Math.min(1, value)) * 100), unit: "%", color: `var(${STATUS[status]})` }]} />
    </div>
  );
}
