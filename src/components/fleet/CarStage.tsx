"use client";

import { tint } from "@/lib/tone";
import { TrainCar3D } from "./TrainCar3D";
import { CAR_STATE, type CarState } from "./tone";

type CarStageProps = {
  number?: string;
  state?: CarState;
};

// 상태 색 바닥 빛 위에 전동차 옆모습을 크게 올려 미리보기로 표시
export function CarStage({ number = "03", state = "fault" }: CarStageProps) {
  const token = CAR_STATE[state];
  return (
    <div className="relative h-60 w-[340px] shrink-0">
      <div
        aria-hidden
        className="absolute top-40 left-2.5 h-[90px] w-80 animate-[glow-breathe_3.2s_ease-in-out_infinite] rounded-[50%]"
        style={{ background: `radial-gradient(closest-side, ${tint(token, 40)}, transparent)` }}
      />
      <div className="absolute top-6 left-4">
        <TrainCar3D number={number} state={state} scale={2.2} />
      </div>
    </div>
  );
}
