"use client";

import { IsoPrism, IsoView, isoHeight, isoSide, screenToIso } from "@/components/three/iso";
import { tint } from "@/lib/tone";

// Figma 크기와 큐브 세 개의 바닥 중심·높이·색 지정
const W = 360;
const H = 150;
const SIDE = isoSide(60);

export type ModelCube = { token: string; height: number };

const DEFAULT_CUBES: ModelCube[] = [
  { token: "--accent-violet", height: 30 },
  { token: "--accent-cyan", height: 52 },
  { token: "--status-success", height: 22 },
];

const BASES = [
  [130, 93],
  [180, 119],
  [230, 93],
] as const;

type ModelCubesProps = {
  cubes?: ModelCube[];
};

// 모델 카드용 등각 큐브 세 개를 서로 다른 박자로 떠 있게 표시
export function ModelCubes({ cubes = DEFAULT_CUBES }: ModelCubesProps) {
  return (
    <div className="relative h-[150px] w-[360px]">
      <div className="absolute top-24 left-[50px] h-[60px] w-[260px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint("--accent-violet", 45)}, transparent)` }} />
      <IsoView width={W} height={H}>
        {cubes.slice(0, 3).map((c, i) => (
          <IsoPrism
            key={i}
            token={c.token}
            side={SIDE}
            height={isoHeight(c.height)}
            position={screenToIso(BASES[i][0] - W / 2, BASES[i][1] - H / 2)}
            bob={3}
            phase={i * 1.3}
          />
        ))}
      </IsoView>
    </div>
  );
}
