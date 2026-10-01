"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import { OwnCanvas } from "./OwnCanvas";

type TiltViewProps = {
  width: number;
  height: number;
  // 바닥을 내려다보는 각도(도) 지정
  elevation: number;
  className?: string;
  style?: CSSProperties;
  // 공용 캔버스 대신 자기 캔버스에 그리도록 지정
  standalone?: boolean;
  children: ReactNode;
};

// 바닥 원이 납작한 타원으로 보이도록 비스듬히 내려다보는 3D 창 생성
export function TiltView({ width, height, elevation, className = "", style, standalone = false, children }: TiltViewProps) {
  const a = (elevation * Math.PI) / 180;
  const scene = (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, Math.sin(a) * 500, Math.cos(a) * 500]}
        zoom={1}
        near={1}
        far={2000}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <ambientLight intensity={1.4} />
      <directionalLight position={[-120, 300, 200]} intensity={1.6} />
      {children}
    </>
  );
  if (standalone) {
    return (
      <OwnCanvas className={className} style={{ ...style, width, height }}>
        {scene}
      </OwnCanvas>
    );
  }
  return (
    <View className={`relative shrink-0 ${className}`} style={{ ...style, width, height }}>
      {scene}
    </View>
  );
}
