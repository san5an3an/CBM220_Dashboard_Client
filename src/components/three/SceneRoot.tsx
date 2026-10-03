"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// 페이지 전체에 3D 캔버스를 하나만 깔고 각 컴포넌트 자리에 나눠 표시
export default function SceneRoot() {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      eventSource={typeof document === "undefined" ? undefined : document.body}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <View.Port />
    </Canvas>
  );
}
