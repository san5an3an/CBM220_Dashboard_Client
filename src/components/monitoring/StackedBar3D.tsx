"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LAYER, subscribe } from "@/components/three/iso";
import { useValueTip, ValueTip } from "@/components/ui/ValueTip";
import { STATUS, STATUS_NAME, type Status } from "@/lib/tone";
import { clamp, useInterval } from "./live";

// Figma 막대 전체 폭·앞면 높이·두께와 구간 순서 지정
const BAR_W = 342;
const FRONT_H = 22;
const DEPTH = 8;
const VIEW_W = BAR_W + DEPTH;
const VIEW_H = FRONT_H + DEPTH;
const ORDER: Status[] = ["normal", "run", "inspect", "fault", "base", "end"];
const LIVE_MS = 3500;

// 앞면 위→아래 어두워짐을 3D 렌더러처럼 선형 색 공간에서 나눠 찍을 단계 수 지정
const FRONT_STOPS = 8;
// 구간이 바뀔 때 버튼 반전과 같은 0.3초 동안 색이 넘어가도록 지정
const FADE = "300ms ease";

type BarsProps = { values: number[]; onHover: (i: number | null, e?: { clientX: number; clientY: number }) => void };

// 앞면은 위에서 아래로 어두워지고 윗면은 밝고 옆면은 어두운 상자들을 구간 폭이 목표 비율까지 늘고 줄며 이어 붙도록 표시
function Bars({ values, onHover }: BarsProps) {
  const id = useId().replace(/:/g, "");
  const faces = useRef<{ front: SVGPolygonElement | null; top: SVGPolygonElement | null; side: SVGPolygonElement | null }[]>([]);
  const widths = useRef(values.map(() => 0));
  const live = useRef(values);
  useEffect(() => {
    live.current = values;
  });

  useEffect(
    () =>
      subscribe((_, dt) => {
        const vals = live.current;
        const total = vals.reduce((a, b) => a + b, 0) || 1;
        let x = 0;
        vals.forEach((v, i) => {
          const target = (v / total) * BAR_W;
          widths.current[i] += (target - widths.current[i]) * (1 - Math.exp(-dt * 5));
          const w = Math.max(0.001, widths.current[i]);
          const f = faces.current[i];
          if (f) {
            const x1 = x + w;
            f.front?.setAttribute("points", `${x},${DEPTH} ${x1},${DEPTH} ${x1},${VIEW_H} ${x},${VIEW_H}`);
            f.top?.setAttribute("points", `${x},${DEPTH} ${x1},${DEPTH} ${x1 + DEPTH},0 ${x + DEPTH},0`);
            f.side?.setAttribute("points", `${x1},${DEPTH} ${x1 + DEPTH},0 ${x1 + DEPTH},${FRONT_H} ${x1},${VIEW_H}`);
          }
          x += w;
        });
      }),
    [],
  );

  return (
    <svg className="pointer-events-none absolute inset-0" style={{ zIndex: LAYER }} width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      {ORDER.map((s, i) => {
        const tone = `var(${STATUS[s]})`;
        const fade = { transition: `fill ${FADE}, stop-color ${FADE}` };
        return (
          <g key={s} className="pointer-events-auto" onPointerEnter={(e) => onHover(i, e)} onPointerLeave={() => onHover(null)}>
            <defs>
              <linearGradient id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                {/* 3D 렌더러처럼 선형 색 공간에서 위는 원래 색, 아래는 0.55 배로 어둡게 섞은 단계 색 지정 */}
                {Array.from({ length: FRONT_STOPS + 1 }, (_, k) => (
                  <stop key={k} offset={k / FRONT_STOPS} style={{ ...fade, stopColor: `color-mix(in srgb-linear, ${tone} ${100 - (45 * k) / FRONT_STOPS}%, black)` }} />
                ))}
              </linearGradient>
            </defs>
            <polygon ref={(el) => void ((faces.current[i] ??= { front: null, top: null, side: null }).side = el)} style={{ ...fade, fill: `color-mix(in srgb-linear, ${tone} 35%, black)` }} />
            <polygon ref={(el) => void ((faces.current[i] ??= { front: null, top: null, side: null }).top = el)} style={{ ...fade, fill: `color-mix(in srgb-linear, ${tone} 65%, white)` }} />
            <polygon ref={(el) => void ((faces.current[i] ??= { front: null, top: null, side: null }).front = el)} fill={`url(#${id}-${i})`} />
          </g>
        );
      })}
    </svg>
  );
}

type StackedBar3DProps = {
  // 정상·운행·점검·고장·기지·종료 순서의 편성 수 지정
  values?: number[];
  // 몇 초마다 값이 조금씩 바뀌는 임시 실시간 표시 지정
  live?: boolean;
};

// 운행 상태별 편성 비율을 두께 있는 입체 누적 막대로 표시
export function StackedBar3D({ values = [227.7, 53.1, 27.3, 13.7, 10, 10], live = true }: StackedBar3DProps) {
  const [data, setData] = useState(values);
  const key = values.join(",");
  const [base, setBase] = useState(key);
  // 값을 새로 받으면 그 값부터 다시 표시하도록 처리
  if (base !== key) {
    setBase(key);
    setData(values);
  }
  useInterval(() => {
    if (!live) return;
    setData((d) => d.map((v, i) => (i < 4 ? clamp(v + (Math.random() - 0.5) * v * 0.25, 4, 400) : v)));
  }, LIVE_MS);

  const { tip, track, show, hide } = useValueTip<number>();
  const total = data.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="relative" style={{ width: VIEW_W, height: VIEW_H }} onPointerMove={track} onPointerLeave={hide}>
      <Bars values={data} onHover={(i, e) => (i === null ? hide() : show(i, e))} />
      {tip && (
        <ValueTip
          at={tip}
          label={STATUS_NAME[ORDER[tip.item]]}
          rows={[{ name: "비율", value: ((data[tip.item] / total) * 100).toFixed(1), unit: "%", color: `var(${STATUS[ORDER[tip.item]]})` }]}
        />
      )}
    </div>
  );
}
