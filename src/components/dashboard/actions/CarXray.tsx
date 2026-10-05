"use client";

import { Line, OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Matrix4, type Mesh } from "three";
import { cssColor, glowMaterial } from "@/components/dashboard/consist/three/materials";
import { DeviceHotspot, type DeviceState } from "@/components/fleet";
import { OwnCanvas } from "@/components/three/OwnCanvas";

// Figma 틀 크기와 차체 앞면 왼쪽 아래의 화면 위치 지정
const W = 1272;
const H = 640;
const ORIGIN = [100, 393.7] as const;
// 길이 1px 당 아래로 0.221px, 깊이 1px 당 위로 0.64px 밀리는 사선 투영 비율 지정
const SLOPE = 190 / 860;
const RISE = 96 / 150;
// Figma 옆면 860·끝면 150·높이 191 기준으로 차체 길이·폭·옆벽 높이 지정
const LEN = 860;
const DEPTH = 150;
const WALL = 191;
// 차체 단면(깊이, 높이)을 앞 아래부터 시계 방향으로 지정
const PROFILE: [number, number][] = [
  [0, 0],
  [0, WALL],
  [38.5, 206.4],
  [112.5, 207.5],
  [DEPTH, WALL],
  [DEPTH, 0],
];
const WINDOWS = Array.from({ length: 8 }, (_, i) => 51.6 + i * 98.9);
const DOORS = [172, 404.2, 636.4];
const WHEELS = [68.8, 137.6, 722.4, 791.2];
const AC_UNITS = [184.8, 511.6];
// 스캔 띠가 차체를 한 번 훑는 시간(초) 지정
const SCAN_S = 5;

type Vec = [number, number, number];

// 월드 좌표(길이, 높이, 깊이)를 Figma 화면 좌표로 옮기는 사선 투영 행렬 계산
const PROJECT = new Matrix4().set(1, 0, 1, ORIGIN[0], -SLOPE, 1, RISE, -ORIGIN[1], 0.3, 0, -1, 0, 0, 0, 0, 1);

// 월드 좌표를 3D 창 안 화면 좌표(위가 +)로 변환
const toView = (x: number, y: number, z: number): Vec => [ORIGIN[0] + x + z, -(ORIGIN[1] + SLOPE * x - RISE * z - y), 400];

// 꼭짓점마다 색과 불투명도를 칠한 면 생성
function faceGeometry(points: Vec[], colors: [string, number][]) {
  const g = new BufferGeometry();
  const pos = points.length === 4 ? [0, 1, 2, 0, 2, 3].map((i) => points[i]) : points;
  const col = points.length === 4 ? [0, 1, 2, 0, 2, 3].map((i) => colors[i]) : colors;
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos.flat()), 3));
  const rgba = col.flatMap(([token, a]) => {
    const c = new Color(cssColor(token));
    return [c.r, c.g, c.b, a];
  });
  g.setAttribute("color", new BufferAttribute(new Float32Array(rgba), 4));
  return g;
}

type FaceProps = { points: Vec[]; colors: [string, number][]; order: number };

function Face({ points, colors, order }: FaceProps) {
  const geo = useMemo(() => faceGeometry(points, colors), [points, colors]);
  return (
    <mesh geometry={geo} renderOrder={order}>
      <meshBasicMaterial vertexColors transparent depthWrite={false} depthTest={false} side={DoubleSide} />
    </mesh>
  );
}

type EdgeProps = { points: Vec[]; token?: string; opacity: number; dashed?: boolean; width?: number; order?: number };

function Edge({ points, token = "--accent-cyan", opacity, dashed = false, width = 1, order = 5 }: EdgeProps) {
  return (
    <Line
      points={points}
      color={cssColor(token)}
      transparent
      opacity={opacity}
      lineWidth={width}
      depthTest={false}
      renderOrder={order}
      {...(dashed ? { dashed: true, dashSize: 4, gapSize: 4 } : {})}
    />
  );
}

// 옆면(깊이 0)에 놓인 사각형 네 꼭짓점 생성
const sideRect = (x: number, w: number, y0: number, y1: number, z = 0): Vec[] => [
  [x, y0, z],
  [x + w, y0, z],
  [x + w, y1, z],
  [x, y1, z],
];
const flat = (a: string, b: string, alphaTop: number, alphaBottom: number): [string, number][] => [
  [b, alphaBottom],
  [b, alphaBottom],
  [a, alphaTop],
  [a, alphaTop],
];

// 차체 단면을 길이 방향으로 이어 반투명 면과 윤곽선으로 그린 차체 표시
function Body() {
  const at = (x: number, [z, y]: [number, number]): Vec => [x, y, z];
  const roofLines = PROFILE.slice(1, 5);
  const profileAt = (x: number) => PROFILE.map((p) => at(x, p));
  return (
    <>
      <Face points={sideRect(0, LEN, 0, WALL)} colors={flat("--accent-cyan", "--blue-500", 0.1, 0.04)} order={2} />
      {roofLines.slice(0, 3).map((p, i) => {
        const q = roofLines[i + 1];
        return (
          <Face
            key={i}
            points={[at(0, p), at(LEN, p), at(LEN, q), at(0, q)]}
            colors={[["--accent-cyan", 0.14], ["--accent-cyan", 0.14], ["--accent-violet", 0.06], ["--accent-violet", 0.06]]}
            order={2}
          />
        );
      })}
      <Face
        points={[at(0, [DEPTH, 14]), at(LEN, [DEPTH, 14]), at(LEN, [0, 14]), at(0, [0, 14])]}
        colors={Array.from({ length: 4 }, () => ["--blue-500", 0.08] as [string, number])}
        order={1}
      />
      {/* 운전석 끝면을 단면 모양 그대로 채워 표시 */}
      <Face
        points={[1, 2, 3, 4, 5].flatMap((i) => (i < 5 ? [at(LEN, PROFILE[0]), at(LEN, PROFILE[i]), at(LEN, PROFILE[i + 1] ?? PROFILE[5])] : []))}
        colors={Array.from({ length: 12 }, () => ["--accent-cyan", 0.07] as [string, number])}
        order={2}
      />
      <Edge points={[...profileAt(LEN), at(LEN, PROFILE[0])]} opacity={0.5} width={1.5} />
      <Edge points={[at(0, [0, 0]), at(LEN, [0, 0])]} opacity={0.55} width={1.5} />
      <Edge points={[at(0, [0, 0]), at(0, [0, WALL])]} opacity={0.55} width={1.5} />
      <Edge points={roofLines.map((p) => at(0, p))} opacity={0.55} width={1.5} />
      {roofLines.map((p, i) => (
        <Edge key={i} points={[at(0, p), at(LEN, p)]} opacity={[0.55, 0.55, 0.7, 0.35][i]} width={i === 2 ? 1.5 : 1} />
      ))}
      {/* 가려진 뒤쪽 모서리를 점선으로 표시 */}
      <Edge points={[at(0, [DEPTH, WALL]), at(0, [DEPTH, 0]), at(LEN, [DEPTH, 0])]} opacity={0.25} dashed />
      <Edge points={[at(0, [0, 0]), at(0, [DEPTH, 0])]} opacity={0.25} dashed />
      <Edge points={[...[at(0, [DEPTH, 14]), at(LEN, [DEPTH, 14]), at(LEN, [0, 14])]]} token="--blue-500" opacity={0.3} />
    </>
  );
}

// 창문·출입문·노선 띠·치마판·대차·냉방기·앞유리 등 차체 부품 표시
function Parts() {
  return (
    <>
      <Face points={sideRect(0, LEN, 67.2, 76, -0.2)} colors={Array.from({ length: 4 }, () => ["--accent-cyan", 0.35] as [string, number])} order={3} />
      {WINDOWS.map((x) => (
        <group key={x}>
          <Face points={sideRect(x, 60.2, 115.5, 168.3, -0.3)} colors={Array.from({ length: 4 }, () => ["--accent-cyan", 0.05] as [string, number])} order={3} />
          <Edge points={[...sideRect(x, 60.2, 115.5, 168.3, -0.3), [x, 115.5, -0.3]]} opacity={0.35} />
        </group>
      ))}
      {DOORS.map((x) => (
        <group key={x}>
          <Face points={sideRect(x, 43, 18.7, 177.1, -0.3)} colors={Array.from({ length: 4 }, () => ["--accent-violet", 0.06] as [string, number])} order={3} />
          <Edge points={[...sideRect(x, 43, 18.7, 177.1, -0.3), [x, 18.7, -0.3]]} token="--accent-violet" opacity={0.45} />
        </group>
      ))}
      <Face points={sideRect(25.8, 808.4, -12.2, 1, -0.4)} colors={Array.from({ length: 4 }, () => ["--blue-500", 0.15] as [string, number])} order={3} />
      <Edge points={[...sideRect(25.8, 808.4, -12.2, 1, -0.4), [25.8, -12.2, -0.4]]} opacity={0.4} />
      {[43, 696.6].map((x) => (
        <group key={x}>
          <Face points={sideRect(x, 120.4, -25.6, -8, -0.5)} colors={Array.from({ length: 4 }, () => ["--blue-500", 0.15] as [string, number])} order={3} />
          <Edge points={[...sideRect(x, 120.4, -25.6, -8, -0.5), [x, -25.6, -0.5]]} opacity={0.4} />
        </group>
      ))}
      {AC_UNITS.map((x) => {
        const pts: Vec[] = [
          [x, 208, 53.9],
          [x + 120.4, 208, 53.9],
          [x + 120.4, 208, 104.9],
          [x, 208, 104.9],
        ];
        return (
          <group key={x}>
            <Face points={pts} colors={Array.from({ length: 4 }, () => ["--accent-cyan", 0.12] as [string, number])} order={4} />
            <Edge points={[...pts, pts[0]]} opacity={0.6} />
          </group>
        );
      })}
      {(() => {
        const glass: Vec[] = [
          [LEN + 0.3, 124, 18],
          [LEN + 0.3, 124, 132],
          [LEN + 0.3, 185.7, 132],
          [LEN + 0.3, 185.7, 18],
        ];
        const sign: Vec[] = [
          [LEN + 0.4, 192.3, 45],
          [LEN + 0.4, 192.3, 105],
          [LEN + 0.4, 201.1, 105],
          [LEN + 0.4, 201.1, 45],
        ];
        return (
          <>
            <Face points={glass} colors={flat("--accent-cyan", "--blue-500", 0.25, 0.08)} order={4} />
            <Edge points={[...glass, glass[0]]} opacity={0.8} width={1.5} />
            <Face points={sign} colors={Array.from({ length: 4 }, () => ["--accent-cyan", 0.8] as [string, number])} order={4} />
          </>
        );
      })()}
    </>
  );
}

// 바닥 격자선을 길이·깊이 방향으로 표시
function FloorGrid() {
  const y = -60.5;
  const lines: Vec[][] = [
    ...Array.from({ length: 11 }, (_, k): Vec[] => [
      [-29.7 + 86 * k, y, 0],
      [-29.7 + 86 * k, y, 195],
    ]),
    ...Array.from({ length: 7 }, (_, k): Vec[] => [
      [-72.8, y, 194.9 - 32.55 * k],
      [873.2, y, 194.9 - 32.55 * k],
    ]),
  ];
  const glow = useMemo(() => glowMaterial(cssColor("--accent-cyan"), 0.35), []);
  return (
    <>
      <mesh position={[LEN / 2, y, DEPTH / 2]} rotation={[-Math.PI / 2, 0, 0]} material={glow} renderOrder={0}>
        <planeGeometry args={[LEN * 1.3, 420]} />
      </mesh>
      {lines.map((p, i) => (
        <Edge key={i} points={p} opacity={0.08} order={0} />
      ))}
    </>
  );
}

// 스캔 띠가 차체 앞쪽에서 운전석 쪽으로 반복해 훑고 지나가도록 표시
function ScanBand() {
  const ref = useRef<Mesh>(null);
  const geo = useMemo(() => {
    // 위(먼 쪽)는 길이 43 폭, 아래(가까운 쪽)는 15만큼 앞으로 기운 띠 모양 생성
    const top = (dx: number): Vec => [dx, 225, DEPTH];
    const bottom = (dx: number): Vec => [dx - 15, -30, 0];
    const cols = [0, 21.5, 43];
    const alpha = [0, 0.22, 0];
    const pts: Vec[] = [];
    const col: [string, number][] = [];
    for (let i = 0; i < 2; i++) {
      const quad = [bottom(cols[i]), bottom(cols[i + 1]), top(cols[i + 1]), top(cols[i])];
      const a = [alpha[i], alpha[i + 1], alpha[i + 1], alpha[i]];
      [0, 1, 2, 0, 2, 3].forEach((k) => {
        pts.push(quad[k]);
        col.push(["--accent-cyan", a[k]]);
      });
    }
    return faceGeometry(pts, col);
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = -40 + ((clock.elapsedTime % SCAN_S) / SCAN_S) * (LEN + 80);
  });
  return (
    <mesh ref={ref} geometry={geo} renderOrder={6}>
      <meshBasicMaterial vertexColors transparent depthWrite={false} depthTest={false} side={DoubleSide} />
    </mesh>
  );
}

// 바퀴와 전조등을 화면에 똑바로 선 원으로 표시
function Rounds() {
  const lamp = useMemo(() => glowMaterial(cssColor("--yellow-400"), 0.9), []);
  return (
    <>
      {WHEELS.map((x) => (
        <group key={x} position={toView(x, -18.3, 0)} renderOrder={7}>
          <mesh renderOrder={7}>
            <circleGeometry args={[18, 40]} />
            <meshBasicMaterial color={cssColor("--navy-850")} depthTest={false} />
          </mesh>
          <mesh renderOrder={8}>
            <ringGeometry args={[16, 18, 40]} />
            <meshBasicMaterial color={cssColor("--accent-cyan")} transparent opacity={0.6} depthTest={false} />
          </mesh>
        </group>
      ))}
      {[30, 120].map((z) => (
        <group key={z} position={toView(LEN, 64.7, z)}>
          <mesh material={lamp} renderOrder={8}>
            <planeGeometry args={[34, 34]} />
          </mesh>
          <mesh renderOrder={9}>
            <circleGeometry args={[6, 24]} />
            <meshBasicMaterial color={cssColor("--white")} depthTest={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Figma 장치 이름표 위치(원래 틀 1272×640 기준) 지정
export const XRAY_AT: Record<string, readonly [number, number]> = {
  "차축 베어링": [192.2, 417.8],
  "드라이빙 기어": [295.4, 431.8],
  "견인 전동기": [417.8, 424.5],
  "추진 제어 장치": [519, 472.4],
  "화재 감지 장치": [697.2, 249.2],
  "주공기 압축기": [691, 517],
  "제동 장치": [828.6, 554],
  "냉방 장치": [422, 184],
  "공기질 개선 장치": [583.2, 206.7],
  "보조 전원 장치": [540.2, 404],
  "열차 종합 제어": [1054, 330.8],
  "무정전 장치": [293, 217.1],
  "통신 장치": [983, 269.2],
  "차상 신호 장치": [1031.5, 488.2],
  배전반: [686.6, 402.2],
  축전지: [692.8, 433.6],
  "주간 제어기": [971.5, 434.2],
  엔코더: [183.4, 357.6],
  "출입문 장치": [497.5, 375.25],
  "방송 장치": [802.6, 311.8],
  "표시기 장치": [802.8, 354.7],
};

export type XrayDevice = { name: string; status: DeviceState };

type CarXrayProps = {
  // 이름표를 띄울 장치와 상태 지정
  devices: XrayDevice[];
  selected?: string;
  // 원래 틀(1272×640) 대비 배율 지정
  scale?: number;
};

// 차량을 투명한 와이어프레임 3D 로 그리고 스캔 띠가 훑는 동안 고른 장치 위치에 이름표 표시
export function CarXray({ devices, selected, scale = 1 }: CarXrayProps) {
  return (
    <div className="relative shrink-0" style={{ width: W * scale, height: H * scale }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <OwnCanvas className="absolute! inset-0" style={{ width: W, height: H }}>
          <OrthographicCamera makeDefault position={[W / 2, -H / 2, 500]} zoom={1} near={1} far={2000} />
          <group matrixAutoUpdate={false} matrix={PROJECT}>
            <FloorGrid />
            <Body />
            <Parts />
            <ScanBand />
          </group>
          <Rounds />
        </OwnCanvas>
        {devices.map((d) => {
          const at = XRAY_AT[d.name];
          return at ? (
            <DeviceHotspot
              key={d.name}
              name={d.name}
              status={d.status}
              selected={d.name === selected}
              className="pointer-events-none absolute z-10"
              style={{ left: at[0], top: at[1] }}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}
