"use client";

import { Line, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Check, CircleAlert, Info, type LucideIcon, TriangleAlert, User } from "lucide-react";
import { useMemo, useRef } from "react";
import { BoxGeometry, Color, EdgesGeometry, type Group, type Mesh } from "three";
import { cssColor } from "@/components/dashboard/consist/three/materials";
import { tint } from "@/lib/tone";

export const EMBLEM_TONE = {
  success: { token: "--status-success", Icon: Check },
  error: { token: "--status-danger", Icon: CircleAlert },
  warn: { token: "--status-warning", Icon: TriangleAlert },
  info: { token: "--accent-cyan", Icon: Info },
  person: { token: "--accent-violet", Icon: User },
} as const satisfies Record<string, { token: string; Icon: LucideIcon }>;

export type EmblemTone = keyof typeof EMBLEM_TONE;

// Figma 큐브 윗면 폭 60px 에 맞춘 한 변 길이와 세로 눌림 비율 지정
const EDGE = 60 / Math.SQRT2;
const SQUASH = 30 / (EDGE * Math.cos(Math.PI / 6));

// 카메라가 30도 내려다봐 깊이 방향이 절반으로 눌리는 것을 반영해 화면에서 140×44 가 되는 궤도 반지름과 높이 지정
const ORBIT_X = 70;
const ORBIT_Z = 44;
const ORBIT_Y = -36 / Math.cos(Math.PI / 6);

// 큐브 발밑을 도는 궤도 타원의 점 목록 생성
const ORBIT = Array.from({ length: 97 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return [Math.cos(a) * ORBIT_X, ORBIT_Y, Math.sin(a) * ORBIT_Z] as [number, number, number];
});

function Cube({ token, dashed }: { token: string; dashed: boolean }) {
  const spin = useRef<Group>(null);
  const spark = useRef<Mesh>(null);
  const color = useMemo(() => new Color(cssColor(token)), [token]);
  const top = useMemo(() => color.clone().lerp(new Color("#ffffff"), 0.55), [color]);
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(EDGE, EDGE, EDGE)), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // 큐브는 천천히 돌며 위아래로 떠 있고 궤도 위 빛 점은 한 바퀴씩 돌도록 갱신
    if (spin.current) {
      spin.current.rotation.y = t * 0.6;
      spin.current.position.y = Math.sin(t * 1.6) * 3;
    }
    if (spark.current) {
      const a = t * 1.4;
      spark.current.position.set(Math.cos(a) * ORBIT_X, ORBIT_Y, Math.sin(a) * ORBIT_Z);
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[40, 120, 60]} intensity={1.6} />
      <group ref={spin} scale={[1, SQUASH, 1]}>
        <mesh>
          <boxGeometry args={[EDGE, EDGE, EDGE]} />
          <meshStandardMaterial attach="material-0" color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.55} />
          <meshStandardMaterial attach="material-1" color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.8} />
          <meshStandardMaterial attach="material-2" color={top} emissive={top} emissiveIntensity={0.4} transparent opacity={0.9} />
          <meshStandardMaterial attach="material-3" color={color} transparent opacity={0.3} />
          <meshStandardMaterial attach="material-4" color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} />
          <meshStandardMaterial attach="material-5" color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.5} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={top} transparent opacity={0.9} />
        </lineSegments>
      </group>
      <group rotation={[0, Math.PI / 4, 0]}>
        <Line points={ORBIT} color={color} lineWidth={1.6} transparent opacity={0.75} dashed={dashed} dashSize={6} gapSize={5} />
        <mesh ref={spark}>
          <sphereGeometry args={[2.4, 16, 16]} />
          <meshBasicMaterial color={top} />
        </mesh>
      </group>
    </>
  );
}

type DialogEmblemProps = {
  tone?: EmblemTone;
  icon?: LucideIcon;
  // 궤도 타원을 점선으로 그리도록 지정
  dashedOrbit?: boolean;
};

// 다이얼로그 위쪽에 떠 있는 홀로그램 아이콘과 3D 큐브 엠블럼 표시
export function DialogEmblem({ tone = "success", icon, dashedOrbit = false }: DialogEmblemProps) {
  const { token, Icon: DefaultIcon } = EMBLEM_TONE[tone];
  const Icon = icon ?? DefaultIcon;
  return (
    <div className="relative h-40 w-[180px] shrink-0">
      <div className="absolute top-[104px] left-[5px] h-14 w-[170px] rounded-[50%]" style={{ background: `radial-gradient(closest-side, ${tint(token, 45)}, transparent)` }} />
      {/* 모달 위에서도 보이도록 공용 캔버스 대신 이 자리 전용 3D 캔버스 생성 */}
      <div className="absolute top-4 left-0 h-40 w-[180px]" style={{ filter: `drop-shadow(0 0 12px ${tint(token, 50)})` }}>
        <Canvas flat dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <OrthographicCamera makeDefault zoom={1} position={[200, 163, 200]} near={1} far={1000} onUpdate={(c) => c.lookAt(0, 0, 0)} />
          <Cube token={token} dashed={dashedOrbit} />
        </Canvas>
      </div>
      <div
        className="absolute top-[46px] left-[89px] h-[22px] w-0.5 animate-[beam-flicker_2.2s_ease-in-out_infinite]"
        style={{ backgroundImage: `linear-gradient(to bottom, ${tint(token, 80)}, transparent)` }}
      />
      <div
        className="absolute top-0 left-[66px] flex size-12 animate-[holo-pulse_2.4s_ease-in-out_infinite] items-center justify-center rounded-[24px] border-[1.5px] backdrop-blur-[3px]"
        style={{
          borderColor: tint(token, 85),
          background: `radial-gradient(circle, ${tint(token, 35)}, ${tint(token, 8)}), color-mix(in srgb, var(--navy-850) 55%, transparent)`,
          boxShadow: `0 0 18px 0 ${tint(token, 60)}, inset 0 0 10px 0 ${tint(token, 50)}`,
        }}
      >
        <Icon style={{ color: `var(${token})` }} size={22} strokeWidth={2.2} />
      </div>
    </div>
  );
}
