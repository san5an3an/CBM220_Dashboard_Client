import type { CSSProperties } from "react";
import { tint } from "@/lib/tone";

type IsoCubeProps = {
  // 큐브 색 토큰 CSS 변수 이름 지정
  token: string;
  // Figma 윗면 마름모 가로 폭(px) 지정
  width: number;
  // 계속 도는 큐브로 지정
  spinning?: boolean;
  // 한 바퀴 도는 데 걸리는 시간(ms) 지정
  period?: number;
  className?: string;
};

// 면마다 Figma 등각 큐브의 색 흐름을 담은 CSS 3D 큐브 표시
export function IsoCube({ token, width, spinning = false, period = 6000, className = "" }: IsoCubeProps) {
  const edge = width / Math.SQRT2;
  const half = edge / 2;
  const lit = `linear-gradient(to bottom, ${tint(token, 85)}, ${tint(token, 35)})`;
  const dim = `linear-gradient(to bottom, ${tint(token, 50)}, ${tint(token, 15)})`;
  const faces: { key: string; transform: string; background: string }[] = [
    { key: "front", transform: `translateZ(${half}px)`, background: dim },
    { key: "back", transform: `rotateY(180deg) translateZ(${half}px)`, background: lit },
    { key: "right", transform: `rotateY(90deg) translateZ(${half}px)`, background: lit },
    { key: "left", transform: `rotateY(-90deg) translateZ(${half}px)`, background: dim },
    { key: "top", transform: `rotateX(90deg) translateZ(${half}px)`, background: `linear-gradient(to right, rgba(255,255,255,0.7), var(${token}))` },
    { key: "bottom", transform: `rotateX(-90deg) translateZ(${half}px)`, background: tint(token, 15) },
  ];
  const cube: CSSProperties = {
    width: edge,
    height: edge,
    transformStyle: "preserve-3d",
    transform: "rotateX(-30deg) rotateY(45deg)",
    animation: spinning ? `cube-spin ${period}ms linear infinite` : undefined,
  };
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center ${className}`}
      style={{ perspective: 600, filter: `drop-shadow(0 0 ${Math.round(width / 3)}px ${tint(token, 55)})` }}
    >
      <div className="relative" style={cube}>
        {faces.map((f) => (
          <span key={f.key} className="absolute inset-0 backface-hidden" style={{ transform: f.transform, background: f.background }} />
        ))}
      </div>
    </div>
  );
}
