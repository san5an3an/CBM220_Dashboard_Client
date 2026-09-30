"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ArrowDownRight, ArrowUpRight, Undo2 } from "lucide-react";
import { type CSSProperties, useMemo, useRef, useState } from "react";
import { Color, type Group, SRGBColorSpace } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { TiltView } from "@/components/three/TiltView";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

// Figma 윗면 140×80·옆면 16px 에서 역산한 내려다보는 각도(도)와 프리즘 두께 지정
const HEX_ELEVATION = (Math.asin(80 / (140 * Math.sin(Math.PI / 3))) * 180) / Math.PI;
const COS = Math.cos((HEX_ELEVATION * Math.PI) / 180);
export const HEX_HEIGHT = 16 / COS;
export const HEX_W = 140;
export const HEX_H = 96;
// 윗면 가운데가 타일 틀 위에서 40px 에 오도록 프리즘 가운데 높이 계산
const HEX_TOP_Y = HEX_HEIGHT / 2;
// 마우스를 올리면 떠오르는 높이(월드 단위) 지정
const LIFT = 8;

export const DEPOT_STATE = {
  up: { token: "--status-success", icon: ArrowUpRight },
  down: { token: "--status-warning", icon: ArrowDownRight },
  depot: { token: "--grade-d", icon: Undo2 },
} as const;

export type DepotState = keyof typeof DEPOT_STATE;

// 윗면 여섯 꼭짓점을 좌우 꼭짓점·앞뒤 평평한 변 순서로 계산
const RING: [number, number, number][] = Array.from({ length: 7 }, (_, i) => {
  const a = Math.PI / 6 + (i * Math.PI) / 3;
  return [70 * Math.sin(a), HEX_TOP_Y + 0.2, 70 * Math.cos(a)];
});

// Figma 처럼 화면 색(sRGB) 기준으로 상태 색과 남색을 섞은 색 생성
function mixSrgb(token: string, t: number) {
  const a = new Color(cssColor(token)).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  const b = new Color(cssColor("--navy-800")).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  return new Color().setRGB(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, SRGBColorSpace);
}

type HexPrismProps = {
  state: DepotState;
  position: readonly [number, number, number];
  hovered?: boolean;
  selected?: boolean;
  // 처음 솟아오르는 순서 지연(초) 지정
  delay?: number;
  onHover?: (over: boolean) => void;
  onClick?: () => void;
};

// 상태 색 육각 프리즘을 아래에서 솟아오르게 하고 마우스를 올리거나 고르면 떠오르도록 갱신
function HexPrism({ state, position, hovered = false, selected = false, delay = 0, onHover, onClick }: HexPrismProps) {
  const ref = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const token = DEPOT_STATE[state].token;
  const [top, side] = useMemo(() => [mixSrgb(token, 0.45), mixSrgb(token, 0.55)], [token]);
  useFrame(({ clock }, delta) => {
    const g = ref.current;
    if (!g) return;
    if (start.current === null) start.current = clock.elapsedTime;
    // 처음에는 아래에서 솟아오르고 이후에는 떠오름 높이를 부드럽게 따라가도록 계산
    const t = Math.min(1, Math.max(0, (clock.elapsedTime - start.current - delay) / 0.6));
    const lift = hovered || selected ? LIFT : 0;
    const target = position[1] - (1 - t) ** 3 * 40 + lift;
    g.position.y = t < 1 ? target : g.position.y + (target - g.position.y) * (1 - Math.exp(-delta * 10));
    g.visible = t > 0;
  });
  return (
    <group ref={ref} position={[position[0], position[1] - 40, position[2]]} visible={false}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(true);
        }}
        onPointerOut={() => onHover?.(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <cylinderGeometry args={[70, 70, HEX_HEIGHT, 6, 1, false, Math.PI / 6]} />
        <meshBasicMaterial attach="material-0" color={side} />
        <meshBasicMaterial attach="material-1" color={top} />
        <meshBasicMaterial attach="material-2" color={side} />
      </mesh>
      <Line points={RING} color={cssColor(token)} transparent opacity={selected ? 1 : 0.8} lineWidth={selected ? 2.4 : 1.5} />
    </group>
  );
}

type HexLabelProps = { number: string; station: string; state: DepotState; lifted?: boolean; style?: CSSProperties };

// 타일 윗면에 편성 번호·방향 아이콘·위치를 표시
function HexLabel({ number, station, state, lifted = false, style }: HexLabelProps) {
  const { token, icon: Icon } = DEPOT_STATE[state];
  return (
    <div
      className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center transition-transform duration-300"
      style={{ ...style, transform: `translateY(${lifted ? -LIFT * COS : 0}px)` }}
    >
      <div className="flex items-center gap-1">
        <Icon size={16} strokeWidth={2} absoluteStrokeWidth style={{ color: `var(${token})` }} />
        <p className={`font-bold whitespace-nowrap text-(--text-primary) ${TEXT.titleLarge}`}>{number}</p>
      </div>
      <p className={`font-medium whitespace-nowrap text-(--text-secondary) ${TEXT.labelSmall}`}>{station}</p>
    </div>
  );
}

type DepotHexProps = {
  number?: string;
  state?: DepotState;
  station?: string;
  selected?: boolean;
  onSelect?: () => void;
};

// 편성 하나를 상태 색 3D 육각 타일로 표시하고 마우스를 올리면 떠오르도록 갱신
export function DepotHex({ number = "401", state = "up", station = "당고개", selected = false, onSelect }: DepotHexProps) {
  const [hover, setHover] = useState(false);
  const token = DEPOT_STATE[state].token;
  return (
    <div className="relative shrink-0" style={{ width: HEX_W, height: HEX_H }}>
      <div aria-hidden className="absolute inset-x-3 bottom-0 h-6 rounded-full blur-[10px]" style={{ background: tint(token, state === "depot" ? 15 : 35) }} />
      <TiltView width={HEX_W + 24} height={HEX_H + 24} elevation={HEX_ELEVATION} className="absolute!" style={{ left: -12, top: -12 }}>
        <HexPrism state={state} position={[0, 0, 0]} hovered={hover} selected={selected} onHover={setHover} onClick={onSelect} />
      </TiltView>
      <HexLabel number={number} station={station} state={state} lifted={hover || selected} style={{ left: 70, top: 18 }} />
    </div>
  );
}
