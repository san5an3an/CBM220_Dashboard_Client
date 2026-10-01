"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, Shape } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { TiltView } from "@/components/three/TiltView";
import { useAnimatedNumber } from "@/lib/motion";
import { GRADE, type Grade } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { useAnimatedList } from "./live";

// Figma 도넛 바깥·안쪽 반지름, 화면 두께 12px 에 맞춘 높이, 내려다보는 각도 지정
const OUTER = 75;
const INNER = 40;
const ELEVATION = 35;
const DEPTH = 12 / Math.cos((ELEVATION * Math.PI) / 180);
const ORDER: Grade[] = ["A", "B", "C", "D", "W"];

// 12시에서 시계 방향으로 도는 각도 구간을 바닥에 눕힐 고리 조각 모양 생성
function sectorShape(from: number, to: number) {
  const a0 = Math.PI / 2 - to;
  const a1 = Math.PI / 2 - from;
  const s = new Shape();
  s.absarc(0, 0, OUTER, a0, a1, false);
  s.absarc(0, 0, INNER, a1, a0, true);
  s.closePath();
  return s;
}

function Segment({ grade, from, to }: { grade: Grade; from: number; to: number }) {
  const token = GRADE[grade];
  const top = useMemo(() => new Color(cssColor(token)).lerp(new Color("#ffffff"), 0.18), [token]);
  const side = useMemo(() => new Color(cssColor(token)).multiplyScalar(0.55), [token]);
  const shape = useMemo(() => sectorShape(from, to), [from, to]);
  if (to - from < 0.002) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <extrudeGeometry args={[shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 48 }]} />
      <meshBasicMaterial attach="material-0" color={top} />
      <meshBasicMaterial attach="material-1" color={side} />
    </mesh>
  );
}

function Ring({ fractions }: { fractions: number[] }) {
  const spin = useRef<Group>(null);
  useFrame((_, delta) => {
    // 도넛 전체가 천천히 돌도록 갱신
    if (spin.current) spin.current.rotation.y -= delta * 0.18;
  });
  const ends = fractions.map((_, i) => fractions.slice(0, i + 1).reduce((a, b) => a + b, 0) * Math.PI * 2);
  return (
    <group ref={spin}>
      {ORDER.map((g, i) => (
        <Segment key={g} grade={g} from={i ? ends[i - 1] : 0} to={ends[i] - 0.02} />
      ))}
    </group>
  );
}

type Donut3DProps = {
  // A·B·C·D·W 등급 순서의 건수 지정
  counts: [number, number, number, number, number];
  unit?: string;
};

// 경보 등급별 건수를 두께 있는 기울어진 도넛과 가운데 합계로 표시
export function Donut3D({ counts, unit = "건" }: Donut3DProps) {
  const total = counts.reduce((a, b) => a + b, 0);
  const fractions = useAnimatedList(counts.map((c) => (total ? c / total : 0)), 1400);
  const shown = useAnimatedNumber(total, 1400);
  return (
    <div className="relative h-[110px] w-[150px]">
      <div aria-hidden className="absolute top-10 left-0 h-[70px] w-[150px] rounded-[50%] bg-[rgba(0,0,0,0.55)] blur-[14px]" />
      <TiltView width={150} height={110} elevation={ELEVATION} className="absolute! inset-0" standalone>
        <Ring fractions={fractions} />
      </TiltView>
      <div className="absolute top-[29px] left-1/2 z-10 flex -translate-x-1/2 items-baseline gap-0.5 whitespace-nowrap">
        <p className={`font-bold text-(--text-primary) tabular-nums ${TEXT.titleLarge}`}>{Math.round(shown)}</p>
        <p className={`font-medium text-(--text-secondary) ${TEXT.labelMedium}`}>{unit}</p>
      </div>
    </div>
  );
}
