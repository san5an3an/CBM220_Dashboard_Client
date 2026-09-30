"use client";

import { useFrame } from "@react-three/fiber";
import { type CSSProperties, type ReactNode, useRef } from "react";
import type { Group } from "three";
import { TrainCar } from "@/components/dashboard/consist/three/TrainCar";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { ConsistView } from "./ConsistView";
import { CAR_STATE, type CarState } from "./tone";

// Figma 차량 틀 치수와 앞면 왼쪽 아래 기준점 지정
const W = 160;
const H = 108;
const ORIGIN = [0, 58] as const;
// 처음 나타날 때 오른쪽에서 미끄러져 들어오는 거리(월드 단위) 지정
const SLIDE = 60;

type IsoCarProps = {
  number?: string;
  state?: CarState;
  // 선두차는 운전석 앞머리, 중간차는 연결막 표시
  type?: "middle" | "cab";
  pantograph?: boolean;
  // 옆면 띠를 상태 색 대신 4호선 노선색으로 지정
  lineStripe?: boolean;
  onSelect?: () => void;
};

// 차량이 오른쪽에서 들어와 부드럽게 멈추도록 위치 갱신
function Arriving({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    const g = ref.current;
    if (g) g.position.x += (0 - g.position.x) * (1 - Math.exp(-delta * 5));
  });
  return (
    <group ref={ref} position={[SLIDE, 0, 0]}>
      {children}
    </group>
  );
}

type CarPlateTagProps = { number: string; state: CarState; className?: string; style?: CSSProperties; onClick?: () => void };

// 호차 번호판을 상태 색 테두리로 표시하고 누르면 해당 차량 선택
function CarPlateTag({ number, state, className = "", style, onClick }: CarPlateTagProps) {
  const token = CAR_STATE[state];
  const selected = state === "selected";
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${number}호차 선택`}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-[3px] rounded-[8px] border-[1.5px] px-2 py-0.5 whitespace-nowrap transition-colors ${className}`}
      style={{
        ...style,
        background: selected ? `var(${token})` : tint("--neutral-sheet", 92),
        borderColor: tint(token, 90),
        boxShadow: `0 2px 6px 0 rgba(0,0,0,0.5), 0 0 8px 0 ${tint(token, 70)}`,
      }}
    >
      <p className={`font-bold ${TEXT.titleSmall} ${selected ? "text-(--text-on-accent)" : "text-(--white)"}`}>{number}</p>
      <p className={`font-semibold ${TEXT.labelSmall}`} style={{ color: selected ? "var(--text-on-accent)" : `var(${token})` }}>
        호차
      </p>
    </button>
  );
}

// 아이소메트릭 전동차 1량을 상태 색 띠·반사광·번호판과 함께 3D 로 표시
export function IsoCar({ number = "00", state = "normal", type = "middle", pantograph = false, lineStripe = false, onSelect }: IsoCarProps) {
  const token = CAR_STATE[state];
  const selected = state === "selected";
  return (
    <div className="relative shrink-0" style={{ width: W, height: H }}>
      <ConsistView width={W} height={H} origin={ORIGIN} pad={24}>
        <Arriving>
          <TrainCar
            no={number}
            x={0}
            state={selected ? "selected" : "normal"}
            tone={token}
            stripeToken={lineStripe ? "--cyan-400" : token}
            ringAlways
            cab={type === "cab" ? "right" : undefined}
            pantograph={pantograph}
            onSelect={() => onSelect?.()}
          />
        </Arriving>
      </ConsistView>
      <CarPlateTag number={number} state={state} onClick={onSelect} className="absolute top-[3.5px] left-[46px] z-10 animate-[pop-in_400ms_ease-out_300ms_both]" />
    </div>
  );
}
