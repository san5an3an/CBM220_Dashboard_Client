"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, BufferAttribute, Color, type Mesh } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { ObliqueView } from "@/components/three/ObliqueView";

// Figma 비스듬한 막대의 깊이 1px 당 위로 밀리는 비율 지정
export const OBLIQUE_SLOPE = 0.6;

// 앞면은 위가 진하고 아래가 옅게, 옆면은 더 옅게, 윗면은 흰빛으로 칠한 크기 1 상자 생성
function barGeometry(token: string) {
  const g = new BoxGeometry(1, 1, 1);
  g.translate(0.5, 0.5, -0.5);
  const tone = new Color(cssColor(token));
  const white = new Color("#ffffff");
  const pos = g.getAttribute("position");
  const normal = g.getAttribute("normal");
  const colors = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const top = pos.getY(i) > 0.5;
    let c = tone;
    let a = 0.2;
    if (normal.getY(i) > 0.5) {
      c = white;
      a = 0.55;
    } else if (normal.getZ(i) > 0.5) {
      a = top ? 0.95 : 0.25;
    } else if (normal.getX(i) > 0.5) {
      a = top ? 0.55 : 0.08;
    }
    colors.set([c.r, c.g, c.b, a], i * 4);
  }
  g.setAttribute("color", new BufferAttribute(colors, 4));
  return g;
}

export type ObliqueBar = {
  // 앞면 왼쪽 x(px) 지정
  x: number;
  // 앞면 높이(px) 지정
  height: number;
  token: string;
};

type BarsProps = {
  bars: ObliqueBar[];
  // 앞면 폭(px) 지정
  front: number;
  // 옆면 가로 폭(px) 지정
  depth: number;
  // 막대 바닥의 화면 위쪽 기준 y(px) 지정
  baseline: number;
};

function Bars({ bars, front, depth, baseline }: BarsProps) {
  const tokens = useMemo(() => [...new Set(bars.map((b) => b.token))], [bars]);
  const geos = useMemo(() => Object.fromEntries(tokens.map((t) => [t, barGeometry(t)])), [tokens]);
  const meshes = useRef<(Mesh | null)[]>([]);
  const heights = useRef<number[]>([]);

  useFrame((_, delta) => {
    // 막대 높이가 목표까지 부드럽게 자라도록 갱신
    bars.forEach((b, i) => {
      const cur = heights.current[i] ?? 0;
      const next = cur + (b.height - cur) * (1 - Math.exp(-delta * 4));
      heights.current[i] = next;
      const m = meshes.current[i];
      if (m) {
        m.scale.set(front, Math.max(0.01, next), depth);
        m.position.set(b.x, -baseline, 0);
      }
    });
  });

  return (
    <>
      {bars.map((b, i) => (
        <mesh key={i} ref={(m) => void (meshes.current[i] = m)} geometry={geos[b.token]}>
          <meshBasicMaterial vertexColors transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

type ObliqueBarsProps = BarsProps & {
  width: number;
  height: number;
};

// 앞면·옆면·윗면이 보이는 반투명 비스듬한 3D 막대들을 공용 캔버스에 표시
export function ObliqueBars({ width, height, ...rest }: ObliqueBarsProps) {
  return (
    <ObliqueView width={width} height={height} slope={OBLIQUE_SLOPE} className="absolute! inset-0">
      <Bars {...rest} />
    </ObliqueView>
  );
}
