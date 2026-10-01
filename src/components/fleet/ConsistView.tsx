"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { Vector3 } from "three";
import { AXIS_BACK, AXIS_RIGHT, AXIS_UP, PX_PER_UNIT } from "@/components/dashboard/consist/projection";
import { CabEnvironment } from "@/components/dashboard/consist/three/CabFront";
import { FACING_CAMERA } from "@/components/dashboard/consist/three/ConsistStage3D";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { OwnCanvas } from "@/components/three/OwnCanvas";

type ConsistViewProps = {
  width: number;
  height: number;
  // 차량 앞면 왼쪽 아래(월드 원점)가 놓일 틀 안 px 위치 지정
  origin: readonly [number, number];
  // 틀 밖으로 나가는 링·앞머리가 잘리지 않도록 사방으로 넓힐 여백(px) 지정
  pad?: number;
  className?: string;
  style?: CSSProperties;
  // 공용 캔버스 대신 자기 캔버스에 그리도록 지정
  standalone?: boolean;
  children: ReactNode;
};

// 편성 무대와 같은 조명과 운전석 반사 환경 배치
function Lights() {
  return (
    <>
      <CabEnvironment />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#cfe0ff", "#0a1230", 1.1]} />
      <directionalLight position={[-400, 900, 700]} intensity={2.2} />
      <directionalLight position={[200, 250, 1000]} intensity={1.2} />
      <directionalLight position={[900, 300, -200]} intensity={0.6} color={cssColor("--accent-violet")} />
    </>
  );
}

// 대시보드 편성 무대와 같은 카메라 축으로 전동차를 비스듬히 보는 3D 창 생성
export function ConsistView({ width, height, origin, pad = 0, className = "", style, standalone = false, children }: ConsistViewProps) {
  const w = width + pad * 2;
  const h = height + pad * 2;
  const position = useMemo(
    () =>
      new Vector3()
        .addScaledVector(AXIS_RIGHT, (w / 2 - origin[0] - pad) / PX_PER_UNIT)
        .addScaledVector(AXIS_UP, (origin[1] + pad - h / 2) / PX_PER_UNIT)
        .addScaledVector(AXIS_BACK, 3000),
    [w, h, origin, pad],
  );
  const scene = (
    <>
      <OrthographicCamera makeDefault zoom={PX_PER_UNIT} position={position} quaternion={FACING_CAMERA} near={1} far={6000} />
      <Lights />
      {children}
    </>
  );
  const frame = { ...style, width: w, height: h, left: -pad, top: -pad };
  if (standalone) {
    return (
      <OwnCanvas className={`absolute! ${className}`} style={frame}>
        {scene}
      </OwnCanvas>
    );
  }
  return (
    <View className={`absolute! ${className}`} style={frame}>
      {scene}
    </View>
  );
}
