"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ExtrudeGeometry, type Material, Mesh, MeshBasicMaterial, Shape } from "three";
import type { Car } from "../data";
import { cssColor, glowMaterial, MAT, STATE_TOKEN, stripeMaterial } from "./materials";

// 차체 치수 지정
export const CAR_LENGTH = 130;
export const CAR_WIDTH = 37.8;
const WALL = 36.3;
const CROWN = 8;
export const GROUND_Y = -18;

// 둥근 지붕 단면을 차량 길이만큼 밀어 차체 생성
const bodyGeometry = (() => {
  const s = new Shape();
  const r = 7;
  s.moveTo(0, 0);
  s.lineTo(CAR_WIDTH, 0);
  s.lineTo(CAR_WIDTH, WALL - r);
  s.quadraticCurveTo(CAR_WIDTH, WALL, CAR_WIDTH - r, WALL + 2);
  s.quadraticCurveTo(CAR_WIDTH / 2, WALL + CROWN, r, WALL + 2);
  s.quadraticCurveTo(0, WALL, 0, WALL - r);
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: CAR_LENGTH, bevelEnabled: false, curveSegments: 12 });
  // 밀어낸 방향이 열차 진행 방향이 되도록 회전
  g.rotateY(Math.PI / 2);
  return g;
})();

const NEAR = 0.25;
const MID_WINDOWS = [26.3, 58.8, 91.3];
const DOORS = [15.6, 48.1, 80.6, 113.1];
const BOGIES = [22, 107.5];

type BoxProps = {
  size: [number, number, number];
  // 왼쪽 아래 앞 모서리 기준으로 위치 지정
  at: [number, number, number];
  material: Material;
};

function Box({ size, at, material }: BoxProps) {
  const [w, h, d] = size;
  return (
    <mesh position={[at[0] + w / 2, at[1] + h / 2, at[2] - d / 2]} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -12, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.wheel}>
        <cylinderGeometry args={[6, 6, 2.4, 20]} />
      </mesh>
      <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]} material={MAT.hub}>
        <cylinderGeometry args={[2, 2, 0.4, 12]} />
      </mesh>
    </group>
  );
}

function Pantograph() {
  const arm = (x: number, y: number, len: number, rot: number) => (
    <mesh position={[x, y, -CAR_WIDTH / 2]} rotation={[0, 0, rot]} material={MAT.pantograph}>
      <boxGeometry args={[len, 0.9, 0.9]} />
    </mesh>
  );
  return (
    <group position={[66, WALL + CROWN, 0]}>
      <Box size={[16, 2, 14]} at={[-8, 0, -CAR_WIDTH / 2 + 7]} material={MAT.roofEquip} />
      {arm(-6, 9, 22, 0.95)}
      {arm(-6, 27, 22, -0.95)}
      <mesh position={[0, 36, -CAR_WIDTH / 2]} material={MAT.pantograph}>
        <boxGeometry args={[4, 1, 26]} />
      </mesh>
    </group>
  );
}

function FocusRing() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = (Math.sin(clock.elapsedTime * 2.4) + 1) / 2;
    (m.material as MeshBasicMaterial).opacity = 0.55 + t * 0.4;
    m.scale.setScalar(1 + t * 0.04);
  });
  return (
    <group position={[CAR_LENGTH / 2, GROUND_Y + 0.5, -CAR_WIDTH / 2]} scale={[92, 1, 36]}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.035, 96]} />
        <meshBasicMaterial color={cssColor("--accent-cyan")} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  );
}

type TrainCarProps = Car & { x: number };

export function TrainCar({ x, state, cab, pantograph }: TrainCarProps) {
  const color = cssColor(STATE_TOKEN[state]);
  const stripe = stripeMaterial(color);
  const underGlow = useMemo(() => glowMaterial(color, state === "selected" ? 0.75 : 0.5), [color, state]);
  const shadow = useMemo(() => glowMaterial("#000000", 0.9), []);

  return (
    <group position={[x, 0, 0]}>
      {/* 바닥 그림자와 상태 색 반사광 표시 */}
      <mesh position={[CAR_LENGTH / 2, GROUND_Y + 0.2, -CAR_WIDTH / 2]} rotation={[-Math.PI / 2, 0, 0]} material={shadow}>
        <planeGeometry args={[CAR_LENGTH + 20, CAR_WIDTH + 26]} />
      </mesh>
      <mesh position={[CAR_LENGTH / 2, GROUND_Y + 0.3, -CAR_WIDTH / 2 + 8]} rotation={[-Math.PI / 2, 0, 0]} material={underGlow}>
        <planeGeometry args={[CAR_LENGTH + 40, CAR_WIDTH + 50]} />
      </mesh>
      {state === "selected" && <FocusRing />}

      {/* 대차와 바퀴, 하부 기기 배치 */}
      {BOGIES.map((bx) => (
        <group key={bx}>
          <Box size={[22, 5, CAR_WIDTH - 6]} at={[bx - 11, -14, -3]} material={MAT.under} />
          <Wheel x={bx - 6} z={-1} />
          <Wheel x={bx + 6} z={-1} />
          <Wheel x={bx - 6} z={-CAR_WIDTH + 1} />
          <Wheel x={bx + 6} z={-CAR_WIDTH + 1} />
        </group>
      ))}
      <Box size={[122, 7, CAR_WIDTH - 4]} at={[4, -7, -2]} material={MAT.skirt} />
      <Box size={[44, 9, CAR_WIDTH - 10]} at={[43, -12, -5]} material={MAT.under} />

      {/* 차체와 지붕 냉방기 배치 */}
      <mesh geometry={bodyGeometry} material={MAT.body} />
      <Box size={[22, 4, 14]} at={[44, WALL + CROWN - 2, -CAR_WIDTH / 2 + 7]} material={MAT.roofEquip} />
      <Box size={[22, 4, 14]} at={[88, WALL + CROWN - 2, -CAR_WIDTH / 2 + 7]} material={MAT.roofEquip} />

      {/* 옆면 노선 띠 표시 */}
      <Box size={[CAR_LENGTH, 5, 0.3]} at={[0, 8, NEAR]} material={stripe} />
      <Box size={[CAR_LENGTH, 1.4, 0.3]} at={[0, 31, NEAR]} material={stripe} />

      {/* 창문과 출입문 배치 */}
      <Box size={[12, 12, 0.3]} at={[2, 16, NEAR + 0.1]} material={MAT.glass} />
      {MID_WINDOWS.map((wx) => (
        <group key={wx}>
          <Box size={[20, 12, 0.3]} at={[wx, 16, NEAR + 0.1]} material={MAT.glass} />
          <Box size={[0.8, 12, 0.35]} at={[wx + 9.7, 16, NEAR + 0.2]} material={MAT.mullion} />
        </group>
      ))}
      <Box size={[4.3, 10, 0.3]} at={[123.8, 17, NEAR + 0.1]} material={MAT.glass} />
      {DOORS.map((dx) => (
        <group key={dx}>
          <Box size={[9.1, 32, 0.4]} at={[dx, 1.5, NEAR + 0.1]} material={MAT.door} />
          <Box size={[0.4, 31, 0.45]} at={[dx + 4.35, 2, NEAR + 0.2]} material={MAT.seam} />
          <Box size={[2.7, 10, 0.45]} at={[dx + 1, 17, NEAR + 0.25]} material={MAT.glass} />
          <Box size={[2.7, 10, 0.45]} at={[dx + 5.4, 17, NEAR + 0.25]} material={MAT.glass} />
        </group>
      ))}

      {cab ? (
        // 선두차 운전석 표시
        <group position={[CAR_LENGTH + 0.2, 0, 0]}>
          <Box size={[0.4, 16, 24]} at={[0, 15, -7]} material={MAT.windshield} />
          <Box size={[0.4, 4.5, 16]} at={[0.1, 32, -11]} material={MAT.destSign} />
          <mesh position={[0.55, 34.2, -19]}>
            <boxGeometry args={[0.3, 2.4, 12]} />
            <meshBasicMaterial color={cssColor("--accent-cyan")} />
          </mesh>
          <Box size={[0.4, 5, CAR_WIDTH]} at={[0, 8, 0]} material={stripe} />
          <Box size={[2, 8, CAR_WIDTH - 2]} at={[0, -7, -1]} material={stripe} />
          <mesh position={[0.8, 11, -4]} material={MAT.headlight}>
            <sphereGeometry args={[1.8, 12, 12]} />
          </mesh>
          <mesh position={[0.8, 11, -CAR_WIDTH + 4]} material={MAT.headlight}>
            <sphereGeometry args={[1.8, 12, 12]} />
          </mesh>
        </group>
      ) : (
        // 중간차 연결부 표시
        <group position={[CAR_LENGTH, 0, 0]}>
          <Box size={[0.4, 30, 10]} at={[0.1, 3, -14]} material={MAT.gangway} />
          <Box size={[0.4, 12, 5]} at={[0.2, 16, -16.5]} material={MAT.glass} />
          <Box size={[0.4, 5, CAR_WIDTH]} at={[0.1, 8, 0]} material={stripe} />
          <Box size={[8, 34, CAR_WIDTH - 12]} at={[0, 1, -6]} material={MAT.bellows} />
        </group>
      )}

      {pantograph && <Pantograph />}
    </group>
  );
}
