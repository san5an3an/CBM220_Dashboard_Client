"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { BoxGeometry, BufferAttribute, Color, type Mesh } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { ObliqueView } from "@/components/three/ObliqueView";
import { STATUS, type Status, tint } from "@/lib/tone";
import { clamp, useInterval } from "./live";

// Figma 막대 전체 폭·앞면 높이·두께와 구간 순서 지정
const BAR_W = 342;
const FRONT_H = 22;
const DEPTH = 8;
const VIEW_W = BAR_W + DEPTH;
const VIEW_H = FRONT_H + DEPTH;
const ORDER: Status[] = ["normal", "run", "inspect", "fault", "base", "end"];
const LIVE_MS = 3500;

// 앞면은 위에서 아래로 어두워지고 윗면은 밝고 옆면은 어두운 색을 꼭짓점에 칠한 상자 생성
function toneBox(token: string) {
  const g = new BoxGeometry(1, FRONT_H, DEPTH);
  const base = new Color(cssColor(token));
  const top = base.clone().lerp(new Color("#ffffff"), 0.35);
  const dark = base.clone().multiplyScalar(0.55);
  const side = base.clone().multiplyScalar(0.35);
  const pos = g.getAttribute("position");
  const normal = g.getAttribute("normal");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const c = normal.getY(i) > 0.5 ? top : normal.getX(i) > 0.5 ? side : pos.getY(i) > 0 ? base : dark;
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new BufferAttribute(colors, 3));
  return g;
}

function Bars({ values }: { values: number[] }) {
  const meshes = useRef<(Mesh | null)[]>([]);
  const widths = useRef(values.map(() => 0));
  const geos = useMemo(() => ORDER.map((s) => toneBox(STATUS[s])), []);

  useFrame((_, delta) => {
    // 구간 폭이 목표 비율까지 부드럽게 늘고 줄며 차례로 이어 붙도록 갱신
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let x = 0;
    values.forEach((v, i) => {
      const target = (v / total) * BAR_W;
      widths.current[i] += (target - widths.current[i]) * (1 - Math.exp(-delta * 5));
      const w = Math.max(0.001, widths.current[i]);
      const m = meshes.current[i];
      if (m) {
        m.scale.x = w;
        m.position.set(x + w / 2, -DEPTH - FRONT_H / 2, -DEPTH / 2);
      }
      x += w;
    });
  });

  return (
    <>
      {geos.map((g, i) => (
        <mesh key={ORDER[i]} ref={(m) => void (meshes.current[i] = m)} geometry={g}>
          <meshBasicMaterial vertexColors />
        </mesh>
      ))}
    </>
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

  return (
    <div className="relative" style={{ width: VIEW_W, height: VIEW_H, filter: `drop-shadow(0 10px 10px ${tint("--accent-cyan", 18)})` }}>
      <ObliqueView width={VIEW_W} height={VIEW_H} className="absolute! inset-0">
        <Bars values={data} />
      </ObliqueView>
    </div>
  );
}
