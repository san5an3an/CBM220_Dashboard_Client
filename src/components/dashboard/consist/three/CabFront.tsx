"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  type Material,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  Shape,
  SRGBColorSpace,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useFormation } from "../formation";
import { cssColor, glowMaterial, stripeMaterial } from "./materials";

// 차체 단면 치수 지정
const WIDTH = 37.8;
const WALL = 36.3;
const CROWN = 8;
const MID = -WIDTH / 2;
// 앞머리가 차체 끝에서 튀어나오는 길이 지정
export const NOSE = 11;
const FACE = NOSE;

// 둥근 모서리 앞머리를 차체 단면으로 만들어 진행 방향으로 회전
const noseGeometry = (() => {
  const s = new Shape();
  const r = 7;
  s.moveTo(0, -1);
  s.lineTo(WIDTH, -1);
  s.lineTo(WIDTH, WALL - r);
  s.quadraticCurveTo(WIDTH, WALL, WIDTH - r, WALL + 2);
  s.quadraticCurveTo(WIDTH / 2, WALL + CROWN, r, WALL + 2);
  s.quadraticCurveTo(0, WALL, 0, WALL - r);
  s.closePath();
  const bevel = 4;
  const g = new ExtrudeGeometry(s, {
    depth: NOSE - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: 3.2,
    bevelOffset: -3.2,
    bevelSegments: 6,
    curveSegments: 16,
  });
  g.translate(0, 0, bevel);
  g.rotateY(Math.PI / 2);
  return g;
})();

const std = (color: string, extra: Partial<MeshStandardMaterial> = {}) =>
  Object.assign(new MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.4 }), extra);

// 운전석 앞면 부품 재질 정의
const CAB = {
  nose: std("#dfe6f3", { metalness: 0.35, roughness: 0.26, envMapIntensity: 0.9 }),
  glass: new MeshPhysicalMaterial({
    color: "#0a1633",
    metalness: 0.25,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.8,
  }),
  gasket: std("#0a0e1a", { roughness: 0.85, metalness: 0.1 }),
  chrome: std("#d4dcec", { metalness: 0.95, roughness: 0.16, envMapIntensity: 1.4 }),
  housing: std("#1a2036", { metalness: 0.7, roughness: 0.3, envMapIntensity: 1.2 }),
  rubber: std("#11151f", { roughness: 0.9, metalness: 0 }),
  steel: std("#3a425e", { metalness: 0.75, roughness: 0.35, envMapIntensity: 1.1 }),
  headlamp: new MeshBasicMaterial({ color: "#fffbea" }),
  taillamp: new MeshBasicMaterial({ color: "#ff3148" }),
};

// 유리와 금속이 비치도록 방 모양 환경 반사를 한 번 생성해 적용
export function CabEnvironment() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    Object.values(CAB).forEach((m) => {
      if (m instanceof MeshStandardMaterial) {
        m.envMap = env;
        m.needsUpdate = true;
      }
    });
    pmrem.dispose();
    return () => env.dispose();
  }, [gl]);
  return null;
}

type FaceBoxProps = {
  y: [number, number];
  z: [number, number];
  depth: number;
  material: Material;
  at?: number;
};

// 앞면 위에 부품을 y·z 범위와 두께로 배치
function FaceBox({ y, z, depth, material, at = 0 }: FaceBoxProps) {
  const h = y[1] - y[0];
  const w = z[0] - z[1];
  return (
    <mesh position={[FACE + at + depth / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]} material={material}>
      <boxGeometry args={[depth, h, w]} />
    </mesh>
  );
}

// 앞면에 붙는 전조등·미등 한 쌍과 빛 번짐 표시
function Lamps({ side }: { side: 1 | -1 }) {
  const edge = side === 1 ? -2.4 : -WIDTH + 2.4;
  const inner = edge - side * 7.4;
  const head = edge - side * 2.4;
  const tail = edge - side * 5.6;
  const glow = useMemo(() => glowMaterial("#fff4d6", 0.85), []);
  const [z0, z1] = side === 1 ? [edge, inner] : [inner, edge];
  return (
    <group>
      <FaceBox y={[6.8, 12.6]} z={[z0, z1]} depth={0.9} material={CAB.housing} />
      <mesh position={[FACE + 1.0, 9.7, head]} rotation={[0, 0, -Math.PI / 2]} material={CAB.headlamp}>
        <cylinderGeometry args={[1.7, 1.7, 0.4, 24]} />
      </mesh>
      <mesh position={[FACE + 1.0, 9.7, tail]} rotation={[0, 0, -Math.PI / 2]} material={CAB.taillamp}>
        <cylinderGeometry args={[1.0, 1.0, 0.4, 18]} />
      </mesh>
      <mesh position={[FACE + 1.4, 9.7, head]} rotation={[0, Math.PI / 2, 0]} material={glow}>
        <planeGeometry args={[16, 16]} />
      </mesh>
    </group>
  );
}

// 행선 표시기에 편성 번호를 빛나는 글자로 표시
function FormationSign({ mirrored }: { mirrored: boolean }) {
  const no = useFormation();
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#03060f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = cssColor("--status-warning");
    ctx.shadowColor = cssColor("--status-warning");
    ctx.shadowBlur = 14;
    ctx.font = "700 64px Roboto, 'Noto Sans KR', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${no} 편성`, canvas.width / 2, canvas.height / 2 + 3);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [no]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    // 좌우 반전된 운전석에서도 글자가 바로 읽히도록 방향 지정
    <mesh position={[FACE + 0.75, 35.2, MID]} rotation={[0, Math.PI / 2, 0]} scale={[mirrored ? -1 : 1, 1, 1]}>
      <planeGeometry args={[19, 3.6]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

type CabFrontProps = { mirrored?: boolean };

// 실제 전동차처럼 입체 앞머리와 운전석 부품 배치
export function CabFront({ mirrored = false }: CabFrontProps) {
  // 앞면 띠는 차량 상태와 관계없이 4호선 노선색으로 지정
  const line = stripeMaterial(cssColor("--cyan-400"));
  return (
    <group>
      <mesh geometry={noseGeometry} material={CAB.nose} />

      {/* 앞유리 테두리와 좌우 유리 배치 */}
      <FaceBox y={[15.6, 33]} z={[-2.8, -35]} depth={0.3} material={CAB.gasket} />
      <FaceBox y={[16.4, 32.2]} z={[-3.6, -12]} depth={0.45} material={CAB.glass} />
      <FaceBox y={[16.4, 32.2]} z={[-25.8, -34.2]} depth={0.45} material={CAB.glass} />

      {/* 비상문 판과 유리, 틈 배치 */}
      <FaceBox y={[1.5, 33]} z={[-12.9, -24.9]} depth={0.35} material={CAB.nose} />
      <FaceBox y={[18, 31]} z={[-14.2, -23.6]} depth={0.5} material={CAB.glass} />
      <FaceBox y={[1.5, 33]} z={[-12.7, -13.1]} depth={0.5} material={CAB.gasket} />
      <FaceBox y={[1.5, 33]} z={[-24.7, -25.1]} depth={0.5} material={CAB.gasket} />
      <FaceBox y={[1.3, 1.7]} z={[-12.7, -25.1]} depth={0.5} material={CAB.gasket} />

      {/* 행선 표시기 배치 */}
      <FaceBox y={[33.4, 37]} z={[-8.6, -29.2]} depth={0.5} material={CAB.gasket} />
      <FormationSign mirrored={mirrored} />

      {/* 와이퍼 배치 */}
      {[-7.8, -30].map((z) => (
        <mesh key={z} position={[FACE + 0.8, 20.5, z]} rotation={[z > MID ? 0.55 : -0.55, 0, 0]} material={CAB.rubber}>
          <boxGeometry args={[0.4, 0.5, 8]} />
        </mesh>
      ))}

      {/* 4호선 노선 띠 배치 */}
      <FaceBox y={[13.6, 15.2]} z={[-1.4, -36.4]} depth={0.25} material={line} />
      <FaceBox y={[3.4, 6.2]} z={[-1.4, -12.5]} depth={0.25} material={line} />
      <FaceBox y={[3.4, 6.2]} z={[-25.3, -36.4]} depth={0.25} material={line} />

      <Lamps side={1} />
      <Lamps side={-1} />

      {/* 비상문 옆 손잡이 배치 */}
      {[-11.2, -26.6].map((z) => (
        <group key={z}>
          <mesh position={[FACE + 1.3, 13, z]} material={CAB.chrome}>
            <cylinderGeometry args={[0.35, 0.35, 16, 10]} />
          </mesh>
          {[5.5, 20.5].map((y) => (
            <mesh key={y} position={[FACE + 0.7, y, z]} rotation={[0, 0, Math.PI / 2]} material={CAB.chrome}>
              <cylinderGeometry args={[0.25, 0.25, 1.3, 8]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 충돌 방지 턱과 치마판 배치 */}
      <FaceBox y={[-1.6, 2.6]} z={[-1.6, -36.2]} depth={2.6} material={CAB.steel} at={-0.6} />
      {[-0.9, 0.5, 1.9].map((y) => (
        <FaceBox key={y} y={[y, y + 0.5]} z={[-2.2, -35.6]} depth={0.7} material={CAB.chrome} at={2} />
      ))}
      <FaceBox y={[-11, -1.6]} z={[-2.6, -35.2]} depth={1.8} material={CAB.housing} at={-1.6} />

      {/* 가운데 연결기 배치 */}
      <mesh position={[FACE + 3, -6, MID]} rotation={[0, 0, Math.PI / 2]} material={CAB.steel}>
        <cylinderGeometry args={[1.3, 1.6, 6, 16]} />
      </mesh>
      <mesh position={[FACE + 6.4, -6, MID]} material={CAB.steel}>
        <boxGeometry args={[2.4, 3.6, 5.4]} />
      </mesh>
    </group>
  );
}
