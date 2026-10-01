"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group, type MeshStandardMaterial } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { ObliqueView } from "@/components/three/ObliqueView";
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

function Pillar({ status, value, height: viewH }: Required<Omit<IsoPillarProps, "tip">>) {
  const MAX_H = viewH - DEPTH;
  const body = useRef<Group>(null);
  const shine = useRef<MeshStandardMaterial>(null);
  const height = useRef(0);
  const base = useMemo(() => new Color(cssColor(STATUS[status])), [status]);
  const top = useMemo(() => base.clone().lerp(new Color("#ffffff"), 0.45), [base]);
  const side = useMemo(() => base.clone().multiplyScalar(0.55), [base]);

  useFrame(({ clock }, delta) => {
    // 목표 높이까지 부드럽게 자라고 표면 광택이 천천히 오르내리도록 갱신
    const target = Math.max(0.02, Math.min(1, value)) * MAX_H;
    height.current += (target - height.current) * (1 - Math.exp(-delta * 4));
    if (body.current) body.current.scale.y = height.current / MAX_H;
    if (shine.current) shine.current.opacity = 0.25 + 0.2 * (Math.sin(clock.elapsedTime * 1.6) + 1) * 0.5;
  });

  return (
    <group position={[0, -viewH, 0]}>
      <group ref={body} scale={[1, 0, 1]}>
        <mesh position={[FRONT / 2, MAX_H / 2, -DEPTH / 2]}>
          <boxGeometry args={[FRONT, MAX_H, DEPTH]} />
          <meshStandardMaterial attach="material-0" color={side} roughness={0.5} />
          <meshStandardMaterial attach="material-1" color={side} roughness={0.5} />
          <meshStandardMaterial attach="material-2" color={top} emissive={top} emissiveIntensity={0.35} roughness={0.4} />
          <meshStandardMaterial attach="material-3" color={side} roughness={0.5} />
          <meshStandardMaterial attach="material-4" color={base} emissive={base} emissiveIntensity={0.25} roughness={0.35} />
          <meshStandardMaterial attach="material-5" color={side} roughness={0.5} />
        </mesh>
        <mesh position={[4.5, MAX_H / 2, 0.1]}>
          <planeGeometry args={[3, MAX_H - 6]} />
          <meshStandardMaterial ref={shine} color="#ffffff" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// 운행 상태별 색의 등각 3D 기둥을 목표 높이까지 자라게 표시
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
      <ObliqueView width={VIEW_W} height={height} className="absolute! inset-0">
        <Pillar status={status} value={value} height={height} />
      </ObliqueView>
      <ValueTip at={tip} label={STATUS_NAME[status]} rows={[{ name: "비율", value: Math.round(Math.max(0, Math.min(1, value)) * 100), unit: "%", color: `var(${STATUS[status]})` }]} />
    </div>
  );
}
