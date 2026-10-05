"use client";

import { Canvas } from "@react-three/fiber";
import type { CSSProperties, ReactNode } from "react";

type OwnCanvasProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

// 공용 캔버스 대신 자기 자리에 3D 캔버스를 따로 두어 스크롤과 함께 움직이도록 생성
export function OwnCanvas({ className = "", style, children }: OwnCanvasProps) {
  return (
    <div className={`relative shrink-0 ${className}`} style={style}>
      {/* 부모가 CSS 로 축소돼도 축소 전 크기로 그리도록 offset 크기로 재기 */}
      <Canvas flat dpr={[1, 2]} gl={{ antialias: true, alpha: true }} resize={{ offsetSize: true }} style={{ position: "absolute", inset: 0 }}>
        {children}
      </Canvas>
    </div>
  );
}
