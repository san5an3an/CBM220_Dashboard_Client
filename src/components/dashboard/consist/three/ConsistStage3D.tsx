"use client";

import { Line, OrthographicCamera } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Matrix4,
  type OrthographicCamera as OrthoCam,
  PerspectiveCamera,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three";
import { ARRIVAL_MS, easeInOut, INTRO_APPROACH_MS, introActive, INTRO_DEPART_MS, INTRO_HOLD_MS, INTRO_MS, introDelay, playIntro, reveal, REVEAL_MS, useArrival } from "../arrival";
import { CARS, CONNECTORS } from "../data";
import { useCarStates } from "../formation";
import { inspectorLayout, selectCar, useSelection } from "../selection";
import { AXIS_BACK, AXIS_RIGHT, AXIS_UP, cameraPosition, designToWorld, PX_PER_UNIT, SCENE_SCALE } from "../projection";
import { cssColor, glowMaterial } from "./materials";
import { CabEnvironment, NOSE } from "./CabFront";
import { CAR_LENGTH, CAR_WIDTH, GROUND_Y, TrainCar } from "./TrainCar";

const CAR_PITCH = 138;
const TRAIN_END = CAR_PITCH * (CARS.length - 1) + CAR_LENGTH;
const BRACKET = { y: 83.7, z: -CAR_WIDTH / 2, from: 19, to: TRAIN_END + 19, drop: 12.4 };
// 4K 화면 오른쪽 끝 밖에서 출발하도록 이동 거리 지정
const ARRIVAL_DISTANCE = TRAIN_END + 2200;
// 정면 연출 카메라를 선로 옆으로 비켜 세워 선로와 나란히 보도록 지정
const INTRO_CAM = { x: -260, y: 16, side: 26, fov: 44 };
// 선두 앞면이 출발하는 거리, 편성 번호가 보이게 서는 거리, 스쳐 지나가는 거리 지정
const INTRO_FAR = 1600;
const INTRO_NEAR = 66;
const INTRO_PASS = -1500;

const RAILS = [
  { z: -26.2, color: "--accent-cyan" },
  { z: -8.6, color: "--accent-violet" },
];
// 연결선을 화면과 평행한 면에 그려 항상 위에 표시
const OVERLAY_DEPTH = 1500;
// 카메라를 정면으로 바라보는 회전값 계산
export const FACING_CAMERA = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(AXIS_RIGHT, AXIS_UP, AXIS_BACK));
// 디자인 픽셀을 월드 단위로 변환
const px = (v: number) => v / SCENE_SCALE / PX_PER_UNIT;

// 정면 연출용 원근 카메라와 평소 정사영 카메라 보관
const cameras: { ortho: OrthoCam | null; intro: PerspectiveCamera } = {
  ortho: null,
  intro: new PerspectiveCamera(34, 16 / 9, 0.5, 9000),
};

// 캔버스 크기가 바뀌면 카메라 다시 배치
function CameraRig() {
  const size = useThree((s) => s.size);
  const { zoom, position } = useMemo(() => cameraPosition(size.width, size.height), [size.width, size.height]);
  return (
    <OrthographicCamera
      ref={(c: OrthoCam | null) => void (cameras.ortho = c)}
      makeDefault
      zoom={zoom}
      position={position}
      quaternion={FACING_CAMERA}
      near={1}
      far={6000}
    />
  );
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

// 괄호선과 빛 번짐을 열차가 멈춘 뒤 서서히 표시
function Bracket() {
  const glow = useRef<Line2>(null);
  const line = useRef<Line2>(null);
  useFrame(() => {
    if (glow.current) glow.current.material.opacity = 0.25 * reveal.value;
    if (line.current) line.current.material.opacity = 0.9 * reveal.value;
  });
  const { y, z, from, to, drop } = BRACKET;
  const points: [number, number, number][] = [
    [from - 3, y - drop, z],
    [from, y, z],
    [to, y, z],
    [to - 3, y - drop, z],
  ];
  return (
    <>
      <Line ref={glow} points={points} color={cssColor("--accent-cyan")} transparent opacity={0} lineWidth={9} />
      <Line ref={line} points={points} color={cssColor("--accent-cyan")} transparent opacity={0} lineWidth={2.4} />
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

const toWorld = (pts: [number, number][]) => pts.map(([x, y]) => designToWorld(x, y, OVERLAY_DEPTH));
const DASH = { dashed: true, dashSize: px(3.88), gapSize: px(2.91), lineWidth: 1.45 };
// 점선이 카드에서 열차 쪽으로 흐르는 속도(월드 단위/초) 지정
const FLOW_SPEED = 14;
// 선택 차량이 바뀔 때 연결 점선이 따라가는 빠르기 지정
const FOLLOW_RATE = 7;

type FlowLineProps = { points: [number, number][]; color: string; opacity: number };

// 점선 무늬를 계속 흘려 보내며 그리기
function FlowLine({ points, color, opacity }: FlowLineProps) {
  const ref = useRef<Line2>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.material.dashOffset -= delta * FLOW_SPEED;
    ref.current.material.opacity = opacity * reveal.value;
  });
  return <Line ref={ref} points={toWorld(points)} color={cssColor(color)} transparent opacity={0} depthTest={false} {...DASH} />;
}

// 선택 차량이 바뀌면 연결 점선 모양을 부드럽게 옮기며 그리기
function LeaderLine({ points }: { points: [number, number][] }) {
  const ref = useRef<Line2>(null);
  const current = useRef<number[] | null>(null);
  // 첫 모양만 넘기고 이후는 프레임마다 직접 갱신
  const [initial] = useState(() => toWorld(points));
  useFrame((_, delta) => {
    const line = ref.current;
    if (!line) return;
    const target = toWorld(points).flatMap((v) => [v.x, v.y, v.z]);
    if (!current.current) current.current = target;
    const k = 1 - Math.exp(-delta * FOLLOW_RATE);
    current.current = current.current.map((v, i) => v + (target[i] - v) * k);
    line.geometry.setPositions(current.current);
    line.computeLineDistances();
    line.material.dashOffset -= delta * FLOW_SPEED;
    line.material.opacity = 0.9 * reveal.value;
  });
  return <Line ref={ref} points={initial} color={cssColor("--accent-cyan")} transparent opacity={0} depthTest={false} {...DASH} />;
}

// 선택 차량을 가리키는 점을 부드럽게 옮기기
function FollowingPulse({ target }: { target: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const k = 1 - Math.exp(-delta * FOLLOW_RATE);
    ref.current.position.lerp(new Vector3(...target), k);
  });
  return (
    <group ref={ref} position={target}>
      <Pulse position={[0, 0, 0]} color="--accent-cyan" size={6} />
    </group>
  );
}

function Connectors({ selected }: { selected: number }) {
  return (
    <group renderOrder={10}>
      {CONNECTORS.map((c) => (
        <FlowLine key={c.color} points={c.points} color={c.color} opacity={0.75} />
      ))}
      <LeaderLine points={inspectorLayout(selected).leader} />
    </group>
  );
}

// 연결선 끝점을 괄호선 위 좌표로 변환
function tapPosition(designX: number): [number, number, number] {
  return [designX - 176 + 0.582 * BRACKET.z, BRACKET.y, BRACKET.z];
}

type ArrivingTrainProps = { selected: number; revealed: boolean };

// 정면 연출이 있으면 원근 카메라로 열차가 다가와 편성 번호를 보여주고 스쳐 지나간 뒤, 오른쪽 화면 밖에서 들어와 감속하며 정차
function ArrivingTrain({ selected, revealed }: ArrivingTrainProps) {
  const rig = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const arrival = useArrival();
  const states = useCarStates();

  useEffect(() => {
    start.current = null;
  }, [arrival]);

  useFrame(({ clock, camera, set, size }) => {
    const g = rig.current;
    if (!g) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const elapsed = (clock.elapsedTime - start.current) * 1000 - introDelay(arrival);
    introActive.value = elapsed < 0;
    if (elapsed < 0) {
      const cam = cameras.intro;
      if (camera !== cam) set({ camera: cam });
      const since = elapsed + INTRO_MS;
      let gap = INTRO_NEAR;
      if (since < INTRO_APPROACH_MS) {
        // 거리를 비율로 줄여 멀리서 다가오다 부드럽게 서도록 앞면 거리 계산
        const q = easeInOut(since / INTRO_APPROACH_MS);
        gap = INTRO_FAR * (INTRO_NEAR / INTRO_FAR) ** (q ** 1.4);
      } else if (since > INTRO_APPROACH_MS + INTRO_HOLD_MS) {
        // 편성 번호를 보여준 뒤 가속하며 카메라 옆을 스쳐 지나가도록 거리 계산
        const u = (since - INTRO_APPROACH_MS - INTRO_HOLD_MS) / INTRO_DEPART_MS;
        gap = INTRO_NEAR + (INTRO_PASS - INTRO_NEAR) * u ** 2;
      }
      g.position.set(INTRO_CAM.x + gap + NOSE, GROUND_Y, -CAR_WIDTH / 2);
      g.rotation.y = 0;
      g.scale.setScalar(1);
      cam.fov = INTRO_CAM.fov;
      cam.aspect = size.width / size.height;
      // 보는 각도는 그대로 두고 정차한 정면이 화면 가운데 오도록 화면만 옆으로 이동
      const halfWidth = Math.tan(((cam.fov / 2) * Math.PI) / 180) * cam.aspect;
      const shift = (-INTRO_CAM.side / INTRO_NEAR / halfWidth) * (size.width / 2);
      cam.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
      const camZ = -CAR_WIDTH / 2 + INTRO_CAM.side;
      cam.position.set(INTRO_CAM.x, INTRO_CAM.y, camZ);
      cam.lookAt(INTRO_CAM.x + 1000, INTRO_CAM.y, camZ);
      cam.updateProjectionMatrix();
      reveal.value = 0;
      return;
    }
    if (cameras.ortho && camera !== cameras.ortho) set({ camera: cameras.ortho });
    const p = Math.min(1, elapsed / ARRIVAL_MS);
    g.position.set(ARRIVAL_DISTANCE * (1 - easeInOut(p)), GROUND_Y, -CAR_WIDTH / 2);
    g.rotation.y = 0;
    g.scale.setScalar(1);
    reveal.value = Math.min(1, Math.max(0, (elapsed - ARRIVAL_MS) / REVEAL_MS));
  });

  return (
    <group ref={rig}>
      {/* 00호차 끝 가운데 바닥을 기준점으로 차량 배치 */}
      <group position={[0, -GROUND_Y, CAR_WIDTH / 2]}>
        {CARS.map((car, i) => (
          <TrainCar
            key={car.no}
            {...car}
            // 선택 차량 표시는 열차가 멈춘 뒤 적용
            state={i === selected && revealed ? "selected" : states[i]}
            x={i * CAR_PITCH}
            onSelect={() => selectCar(i)}
          />
        ))}
      </group>
    </group>
  );
}

// 열차가 멈췄는지 여부를 화면 갱신마다 확인
function useRevealed() {
  const [revealed, setRevealed] = useState(false);
  useFrame(() => {
    const now = reveal.value > 0;
    if (now !== revealed) setRevealed(now);
  });
  return revealed;
}

// 열차가 멈춘 뒤 끝점 표시
function RevealGroup({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = reveal.value > 0;
  });
  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}

function Scene() {
  const { index: selected } = useSelection();
  const revealed = useRevealed();
  return (
    <>
      <CameraRig />
      <CabEnvironment />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={["#cfe0ff", "#0a1230", 1.1]} />
      <directionalLight position={[-400, 900, 700]} intensity={2.2} />
      <directionalLight position={[200, 250, 1000]} intensity={1.2} />
      <directionalLight position={[900, 300, -200]} intensity={0.6} color={cssColor("--accent-violet")} />
      <FloorGrid />
      <FloorGlow />
      <Rails />
      <ArrivingTrain selected={selected} revealed={revealed} />
      <Bracket />
      <RevealGroup>
        {CONNECTORS.map((c, i) => (
          <Pulse key={c.color} position={tapPosition(c.points[c.points.length - 1][0])} color={c.color} phase={i * 1.1} />
        ))}
        <FollowingPulse target={inspectorLayout(selected).anchor} />
      </RevealGroup>
      <Connectors selected={selected} />
    </>
  );
}

export default function ConsistStage3D() {
  return (
    <Canvas onCreated={playIntro} resize={{ offsetSize: true }} flat dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ position: "absolute", inset: 0 }}>
      <Scene />
    </Canvas>
  );
}
