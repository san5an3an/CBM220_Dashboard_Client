"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import type { ReactNode } from "react";

type TiltViewProps = {
  width: number;
  height: number;
  // 바닥을 내려다보는 각도(도) 지정
  elevation: number;
  className?: string;
  children: ReactNode;
};

// 바닥 원이 납작한 타원으로 보이도록 비스듬히 내려다보는 3D 창 생성
export function TiltView({ width, height, elevation, className = "", children }: TiltViewProps) {
  const a = (elevation * Math.PI) / 180;
  return (
    <View className={`relative shrink-0 ${className}`} style={{ width, height }}>
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
    </View>
  );
}
