"use client";

import { type ReactNode, useSyncExternalStore } from "react";

// 디자인 기준 해상도 지정
const BASE_W = 1920;
const BASE_H = 1080;

function subscribe(listener: () => void) {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}

const readSize = () => `${window.innerWidth}x${window.innerHeight}`;

// 기준보다 작은 창에서만 화면 전체를 비율대로 축소
export function FitViewport({ children }: { children: ReactNode }) {
  const size = useSyncExternalStore(subscribe, readSize, () => null);

  // 창 크기를 알기 전에는 같은 구조로 숨겨 두어 화면이 다시 만들어지지 않게 유지
  const [vw, vh] = size ? size.split("x").map(Number) : [BASE_W, BASE_H];
  const scale = Math.min(1, vw / BASE_W, vh / BASE_H);

  return (
    <div className="relative h-dvh w-full overflow-hidden" style={{ visibility: size ? undefined : "hidden" }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: vw / scale, height: vh / scale, transform: scale < 1 ? `scale(${scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
