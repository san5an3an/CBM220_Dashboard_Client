"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ReactNode, useMemo, useRef } from "react";
import { BoxGeometry, BufferAttribute, Color, type Mesh } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { TiltView } from "./TiltView";

// 30도 내려다보고 45도 돌린 등각 화면의 가로·세로 투영 비율 지정
const C45 = Math.SQRT1_2;
const COS30 = Math.cos(Math.PI / 6);
const HALF = 0.5 * C45;

// 등각 공간 좌표를 화면 가운데 기준 px 위치(아래가 +)로 변환
export function isoToScreen(x: number, y: number, z: number) {
  return [C45 * (x + z), -COS30 * y + HALF * (z - x)] as const;
}

// 화면 가운데 기준 px 위치를 바닥(높이 0) 등각 좌표로 변환
export function screenToIso(sx: number, sy: number) {
  const a = sx / C45;
  const b = sy / HALF;
  return [(a - b) / 2, 0, (a + b) / 2] as const;
}

// Figma 마름모 가로 폭을 정사각 바닥 한 변 길이로 변환
export const isoSide = (diamondWidth: number) => diamondWidth / Math.SQRT2;

// Figma 화면 세로 길이를 등각 공간 높이로 변환
export const isoHeight = (px: number) => px / COS30;

export type IsoShade = {
  // 왼쪽 면 위·아래 불투명도 지정
  left: [number, number];
  // 오른쪽 면 위·아래 불투명도 지정
  right: [number, number];
  // 윗면 왼쪽 모서리의 흰빛 섞는 비율 지정
  topWhite: number;
  // 윗면 불투명도 지정
  topAlpha: number;
};

export const ISO_SHADE: IsoShade = { left: [0.85, 0.35], right: [0.5, 0.15], topWhite: 0.7, topAlpha: 1 };

// 면마다 Figma 등각 도형의 색·불투명도 흐름을 꼭짓점에 칠한 높이 1 짜리 상자 생성
export function isoBoxGeometry(token: string, shade: IsoShade = ISO_SHADE) {
  const g = new BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  const tone = new Color(cssColor(token));
  const white = new Color("#ffffff");
  const pos = g.getAttribute("position");
  const normal = g.getAttribute("normal");
  const colors = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const top = pos.getY(i) > 0.5;
    let c = tone;
    let a = 0.3;
    if (normal.getY(i) > 0.5) {
      // 화면 왼쪽 모서리일수록 흰빛이 많이 섞이도록 계산
      const t = (pos.getX(i) + pos.getZ(i) + 1) / 2;
      c = white.clone().lerp(tone, t);
      a = shade.topWhite + (shade.topAlpha - shade.topWhite) * t;
    } else if (normal.getX(i) < -0.5) {
      a = top ? shade.left[0] : shade.left[1];
    } else if (normal.getZ(i) > 0.5) {
      a = top ? shade.right[0] : shade.right[1];
    }
    colors.set([c.r, c.g, c.b, a], i * 4);
  }
  g.setAttribute("color", new BufferAttribute(colors, 4));
  return g;
}

type IsoPrismProps = {
  token: string;
  // 바닥 한 변 길이 지정
  side: number;
  // 목표 높이 지정
  height: number;
  position: readonly [number, number, number];
  shade?: IsoShade;
  // 윗면 테두리 선을 그리도록 지정
  outline?: boolean;
  // 위아래로 떠 있는 움직임 크기 지정
  bob?: number;
  phase?: number;
  onClick?: () => void;
  onHover?: (over: boolean) => void;
  // 목표 높이까지 다 자랐을 때 한 번 알림 지정
  onSettled?: () => void;
};

// 목표 높이까지 자라고 선택적으로 떠 있는 반투명 등각 기둥 표시
export function IsoPrism({ token, side, height, position, shade, outline = false, bob = 0, phase = 0, onClick, onHover, onSettled }: IsoPrismProps) {
  const mesh = useRef<Mesh>(null);
  const edge = useRef<{ position: { y: number } }>(null);
  const shown = useRef(0);
  const settled = useRef(false);
  const geo = useMemo(() => isoBoxGeometry(token, shade), [token, shade]);
  const h = side / 2;
  const ring = useMemo(() => [[-h, 0, -h], [h, 0, -h], [h, 0, h], [-h, 0, h], [-h, 0, -h]] as [number, number, number][], [h]);

  useFrame(({ clock }, delta) => {
    // 높이가 목표까지 부드럽게 자라고 떠 있는 기둥은 위아래로 흔들리도록 갱신
    shown.current += (height - shown.current) * (1 - Math.exp(-delta * 4));
    if (!settled.current && Math.abs(height - shown.current) <= Math.max(0.5, height * 0.02)) {
      settled.current = true;
      onSettled?.();
    }
    const lift = bob ? Math.sin(clock.elapsedTime * 1.4 + phase) * bob : 0;
    if (mesh.current) {
      mesh.current.scale.set(side, Math.max(0.01, shown.current), side);
      mesh.current.position.y = position[1] + lift;
    }
    if (edge.current) edge.current.position.y = position[1] + lift + Math.max(0.01, shown.current);
  });

  return (
    <>
      <mesh
        ref={mesh}
        geometry={geo}
        position={[position[0], position[1], position[2]]}
        onClick={onClick}
        onPointerOver={onHover ? () => onHover(true) : undefined}
        onPointerOut={onHover ? () => onHover(false) : undefined}
      >
        <meshBasicMaterial vertexColors transparent depthWrite={false} />
      </mesh>
      {outline && (
        <group ref={edge as never} position={[position[0], 0, position[2]]}>
          <Line points={ring} color={cssColor(token)} lineWidth={1.2} transparent opacity={0.9} />
        </group>
      )}
    </>
  );
}

type IsoViewProps = {
  width: number;
  height: number;
  // 틀 밖으로 나가는 그림이 잘리지 않도록 사방으로 넓힐 여백(px) 지정
  pad?: number;
  children: ReactNode;
};

// Figma 등각 그림처럼 30도 내려다보고 45도 돌린 3D 창을 틀보다 조금 넓게 생성
export function IsoView({ width, height, pad = 24, children }: IsoViewProps) {
  return (
    <TiltView width={width + pad * 2} height={height + pad * 2} elevation={30} className="absolute!" style={{ left: -pad, top: -pad }}>
      <group rotation={[0, Math.PI / 4, 0]}>{children}</group>
    </TiltView>
  );
}
