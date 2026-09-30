"use client";

import { OrthographicCamera, View } from "@react-three/drei";
import { type ReactNode, useMemo } from "react";
import { Matrix4 } from "three";

type ObliqueViewProps = {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
};

// Figma 등각 그림처럼 깊이 1px 당 오른쪽 위로 1px 밀리는 비스듬한 3D 창 생성
export function ObliqueView({ width, height, className = "", children }: ObliqueViewProps) {
  // 깊이(z)가 멀어질수록 화면 오른쪽 위로 밀리도록 기울기 행렬 계산
  const shear = useMemo(() => new Matrix4().makeShear(0, 0, 0, 0, -1, -1), []);
  return (
    <View className={`relative shrink-0 ${className}`} style={{ width, height }}>
      <OrthographicCamera makeDefault position={[width / 2, -height / 2, 500]} zoom={1} near={1} far={2000} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[-2, 4, 3]} intensity={1.8} />
      <group matrixAutoUpdate={false} matrix={shear}>
        {children}
      </group>
    </View>
  );
}
