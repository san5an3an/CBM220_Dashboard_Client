"use client";

import { Line, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
} from "three";
import { ARRIVAL_MS, replayArrival, useArrivalTick } from "../arrival";
import { CARS, CONNECTORS, LEADER, SELECTED_ANCHOR } from "../data";
import { AXIS_BACK, AXIS_RIGHT, AXIS_UP, cameraPosition, designToWorld, PX_PER_UNIT, SCENE_SCALE } from "../projection";
import { cssColor, glowMaterial } from "./materials";
import { CAR_LENGTH, CAR_WIDTH, GROUND_Y, TrainCar } from "./TrainCar";

const CAR_PITCH = 138;
const TRAIN_END = CAR_PITCH * (CARS.length - 1) + CAR_LENGTH;
const BRACKET = { y: 83.7, z: -CAR_WIDTH / 2, from: 19, to: TRAIN_END + 19, drop: 12.4 };
// 4K 화면 오른쪽 끝 밖에서 출발하도록 이동 거리 지정
const ARRIVAL_DISTANCE = TRAIN_END + 2200;
const RAILS = [
  { z: -26.2, color: "--accent-cyan" },
  { z: -8.6, color: "--accent-violet" },
];
// 연결선을 화면과 평행한 면에 그려 항상 위에 표시
const OVERLAY_DEPTH = 1500;
// 카메라를 정면으로 바라보는 회전값 계산
const FACING_CAMERA = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(AXIS_RIGHT, AXIS_UP, AXIS_BACK));
// 디자인 픽셀을 월드 단위로 변환
const px = (v: number) => v / SCENE_SCALE / PX_PER_UNIT;

// 캔버스 크기가 바뀌면 카메라 다시 배치
function CameraRig() {
  const size = useThree((s) => s.size);
  const { zoom, position } = useMemo(() => cameraPosition(size.width, size.height), [size.width, size.height]);
  return <OrthographicCamera makeDefault zoom={zoom} position={position} quaternion={FACING_CAMERA} near={1} far={6000} />;
}

function FloorGrid() {
  const geometry = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const base = new Color(cssColor("--blue-500"));
    const cx = TRAIN_END / 2;
    const fade = (x: number, z: number) => Math.max(0, 1 - Math.hypot((x - cx) / 2200, z / 1300));
    const y = GROUND_Y - 0.5;
    const push = (x: number, z: number) => {
      pos.push(x, y, z);
      const f = fade(x, z) * 0.32;
      col.push(base.r * f, base.g * f, base.b * f);
    };
    for (let z = -1400; z <= 1400; z += 80)
      for (let x = -2000; x < 3800; x += 80) {
        push(x, z);
        push(x + 80, z);
      }
    for (let x = -2000; x <= 3800; x += 80)
      for (let z = -1400; z < 1400; z += 80) {
        push(x, z);
        push(x, z + 80);
      }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new Float32BufferAttribute(col, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent depthWrite={false} />
    </lineSegments>
  );
}

function FloorGlow() {
  const material = useMemo(() => glowMaterial(cssColor("--accent-cyan"), 0.28), []);
  return (
    <mesh position={[TRAIN_END / 2 + 200, GROUND_Y - 0.4, 300]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[1700, 520]} />
    </mesh>
  );
}

function Rails() {
  return (
    <>
      {RAILS.map((r) => (
        <Line
          key={r.z}
          points={[
            [-2000, GROUND_Y, r.z],
            [3800, GROUND_Y, r.z],
          ]}
          color={cssColor(r.color)}
          transparent
          opacity={0.55}
          lineWidth={1.9}
        />
      ))}
    </>
  );
}

function Bracket() {
  const { y, z, from, to, drop } = BRACKET;
  const points: [number, number, number][] = [
    [from - 3, y - drop, z],
    [from, y, z],
    [to, y, z],
    [to - 3, y - drop, z],
  ];
  return (
    <>
      <Line points={points} color={cssColor("--accent-cyan")} transparent opacity={0.25} lineWidth={9} />
      <Line points={points} color={cssColor("--accent-cyan")} transparent opacity={0.9} lineWidth={2.4} />
    </>
  );
}

type PulseProps = { position: [number, number, number]; color: string; size?: number; phase?: number };

function Pulse({ position, color, size = 5, phase = 0 }: PulseProps) {
  const halo = useRef<Mesh>(null);
  const hex = cssColor(color);
  const glow = useMemo(() => glowMaterial(hex, 0.9), [hex]);
  useFrame(({ clock }) => {
    const t = (Math.sin(clock.elapsedTime * 2 + phase) + 1) / 2;
    if (halo.current) {
      halo.current.scale.setScalar(1 + t * 0.6);
      (halo.current.material as MeshBasicMaterial).opacity = 0.5 + t * 0.4;
    }
  });
  return (
    <group position={position} quaternion={FACING_CAMERA}>
      <mesh ref={halo} material={glow}>
        <planeGeometry args={[size * 4, size * 4]} />
      </mesh>
      <mesh>
        <circleGeometry args={[size * 0.5, 24]} />
        <meshBasicMaterial color={cssColor("--white")} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[size * 0.75, 24]} />
        <meshBasicMaterial color={hex} />
      </mesh>
    </group>
  );
}

function Connectors() {
  const toWorld = (pts: [number, number][]) => pts.map(([x, y]) => designToWorld(x, y, OVERLAY_DEPTH));
  const dash = { dashed: true, dashSize: px(3.88), gapSize: px(2.91), lineWidth: 1.45 };
  return (
    <group renderOrder={10}>
      {CONNECTORS.map((c) => (
        <Line key={c.color} points={toWorld(c.points)} color={cssColor(c.color)} transparent opacity={0.75} depthTest={false} {...dash} />
      ))}
      <Line points={toWorld(LEADER)} color={cssColor("--accent-cyan")} transparent opacity={0.9} depthTest={false} {...dash} />
    </group>
  );
}

// 연결선 끝점을 괄호선 위 좌표로 변환
function tapPosition(designX: number): [number, number, number] {
  return [designX - 176 + 0.582 * BRACKET.z, BRACKET.y, BRACKET.z];
}

// 열차가 오른쪽 화면 밖에서 들어와 감속하며 정차
function ArrivingTrain({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const tick = useArrivalTick();

  useEffect(() => {
    start.current = null;
  }, [tick]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const p = Math.min(1, ((clock.elapsedTime - start.current) * 1000) / ARRIVAL_MS);
    const eased = 1 - (1 - p) ** 3;
    ref.current.position.x = ARRIVAL_DISTANCE * (1 - eased);
  });

  return <group ref={ref}>{children}</group>;
}

function Scene() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#cfe0ff", "#0a1230", 1.1]} />
      <directionalLight position={[-400, 900, 700]} intensity={2.2} />
      <directionalLight position={[200, 250, 1000]} intensity={1.2} />
      <directionalLight position={[900, 300, -200]} intensity={0.6} color={cssColor("--accent-violet")} />
      <FloorGrid />
      <FloorGlow />
      <Rails />
      <ArrivingTrain>
        {CARS.map((car, i) => (
          <TrainCar key={car.no} {...car} x={i * CAR_PITCH} />
        ))}
      </ArrivingTrain>
      <Bracket />
      {CONNECTORS.map((c, i) => (
        <Pulse key={c.color} position={tapPosition(c.points[c.points.length - 1][0])} color={c.color} phase={i * 1.1} />
      ))}
      <Pulse position={SELECTED_ANCHOR} color="--accent-cyan" size={6} />
      <Connectors />
    </>
  );
}

export default function ConsistStage3D() {
  return (
    <Canvas onCreated={replayArrival} flat dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0 }}>
      <Scene />
    </Canvas>
  );
}
