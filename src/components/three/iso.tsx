"use client";

import { Children, createContext, isValidElement, type ReactElement, type ReactNode, useContext, useEffect, useId, useRef } from "react";

// 30도 내려다보고 45도 돌린 등각 화면의 가로·세로 투영 비율 지정
const C45 = Math.SQRT1_2;
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
const HALF = 0.5 * C45;
// 값 구간이 바뀌어 색이 바뀔 때 버튼 반전과 같은 0.3초 동안 넘어가도록 지정
const FADE = "300ms ease";
// 3D 공용 캔버스가 있던 층과 같은 높이에 그려 주변 요소와 겹치는 순서를 그대로 유지하도록 지정
export const LAYER = 1;
// 윗면 흰빛→색 흐름을 선형 색 공간에서 나눠 찍을 단계 수 지정
const TOP_STOPS = 16;

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

const Center = createContext<readonly [number, number]>([0, 0]);

type Vec = readonly [number, number, number];
type Pt = readonly [number, number];

const pts = (list: readonly Pt[]) => list.map(([x, y]) => `${x},${y}`).join(" ");

// 3D 렌더러가 반투명 물체를 카메라에서 먼 것부터 칠하던 순서의 깊이 값 계산
function depth([x, y, z]: Vec) {
  const zr = -C45 * x + C45 * z;
  return y * SIN30 + zr * COS30;
}

// 윗면 모서리에서 아래 모서리까지 면을 가로지르는 그라데이션 방향 계산
function across(a: Pt, b: Pt, drop: number): [Pt, Pt] {
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const len = Math.hypot(ex, ey) || 1;
  // 모서리에 수직이고 아래를 향하는 단위 벡터 계산
  let nx = -ey / len;
  let ny = ex / len;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const l = drop * ny;
  return [a, [a[0] + nx * l, a[1] + ny * l]];
}

export type Tick = (t: number, dt: number) => void;
const subscribers = new Set<Tick>();
let frame = 0;
let last = 0;
let start = 0;

// 모든 기둥이 한 번의 화면 갱신 주기를 함께 쓰도록 등록 처리
export function subscribe(fn: Tick) {
  subscribers.add(fn);
  if (!frame) {
    const loop = (now: number) => {
      if (!start) {
        start = now;
        last = now;
      }
      const dt = (now - last) / 1000;
      last = now;
      subscribers.forEach((s) => s((now - start) / 1000, dt));
      frame = subscribers.size ? requestAnimationFrame(loop) : 0;
    };
    frame = requestAnimationFrame(loop);
  }
  return () => {
    subscribers.delete(fn);
  };
}

type IsoPrismProps = {
  token: string;
  // 바닥 한 변 길이 지정
  side: number;
  // 목표 높이 지정
  height: number;
  position: Vec;
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

// 목표 높이까지 자라고 선택적으로 떠 있는 반투명 등각 기둥을 SVG 면으로 표시
export function IsoPrism({ token, side, height, position, shade = ISO_SHADE, outline = false, bob = 0, phase = 0, onClick, onHover, onSettled }: IsoPrismProps) {
  const [cx, cy] = useContext(Center);
  const id = useId().replace(/:/g, "");
  const leftRef = useRef<SVGPolygonElement>(null);
  const rightRef = useRef<SVGPolygonElement>(null);
  const topRef = useRef<SVGPolygonElement>(null);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const leftGrad = useRef<SVGLinearGradientElement>(null);
  const rightGrad = useRef<SVGLinearGradientElement>(null);
  const topGrad = useRef<SVGLinearGradientElement>(null);
  const shown = useRef(0);
  const settled = useRef(false);
  // 매 프레임 계산이 최신 값을 읽도록 보관
  const live = useRef({ height, side, position, bob, phase, onSettled });
  useEffect(() => {
    live.current = { height, side, position, bob, phase, onSettled };
  });

  useEffect(
    () =>
      subscribe((t, dt) => {
        const v = live.current;
        // 높이가 목표까지 부드럽게 자라고 떠 있는 기둥은 위아래로 흔들리도록 계산
        shown.current += (v.height - shown.current) * (1 - Math.exp(-dt * 4));
        if (!settled.current && Math.abs(v.height - shown.current) <= Math.max(0.5, v.height * 0.02)) {
          settled.current = true;
          v.onSettled?.();
        }
        const lift = v.bob ? Math.sin(t * 1.4 + v.phase) * v.bob : 0;
        const [px, py, pz] = v.position;
        const h = v.side / 2;
        const y0 = py + lift;
        const y1 = y0 + Math.max(0.01, shown.current);
        const p = (x: number, y: number, z: number): Pt => {
          const [sx, sy] = isoToScreen(x, y, z);
          return [cx + sx, cy + sy];
        };
        const lb = p(px - h, y0, pz - h);
        const fb = p(px - h, y0, pz + h);
        const rb = p(px + h, y0, pz + h);
        const lt = p(px - h, y1, pz - h);
        const bt = p(px + h, y1, pz - h);
        const ft = p(px - h, y1, pz + h);
        const rt = p(px + h, y1, pz + h);
        leftRef.current?.setAttribute("points", pts([lb, fb, ft, lt]));
        rightRef.current?.setAttribute("points", pts([fb, rb, rt, ft]));
        topRef.current?.setAttribute("points", pts([lt, bt, rt, ft]));
        const drop = fb[1] - ft[1];
        for (const [g, a, b] of [
          [leftGrad.current, lt, ft],
          [rightGrad.current, ft, rt],
        ] as const) {
          if (!g) continue;
          const [s, e] = across(a, b, drop);
          g.setAttribute("x1", `${s[0]}`);
          g.setAttribute("y1", `${s[1]}`);
          g.setAttribute("x2", `${e[0]}`);
          g.setAttribute("y2", `${e[1]}`);
        }
        if (topGrad.current) {
          topGrad.current.setAttribute("x1", `${lt[0]}`);
          topGrad.current.setAttribute("x2", `${rt[0]}`);
        }
        const ring = [lt, bt, rt, ft];
        lineRefs.current.forEach((l, i) => {
          if (!l) return;
          const a = ring[i];
          const b = ring[(i + 1) % 4];
          l.setAttribute("x1", `${a[0]}`);
          l.setAttribute("y1", `${a[1]}`);
          l.setAttribute("x2", `${b[0]}`);
          l.setAttribute("y2", `${b[1]}`);
        });
      }),
    [cx, cy],
  );

  const fade = { transition: `stop-color ${FADE}, stop-opacity ${FADE}` };
  const tone = `var(${token})`;
  return (
    <g
      onClick={onClick}
      onPointerEnter={onHover ? () => onHover(true) : undefined}
      onPointerLeave={onHover ? () => onHover(false) : undefined}
      className={onClick ? "pointer-events-auto cursor-pointer" : onHover ? "pointer-events-auto" : undefined}
    >
      <defs>
        <linearGradient ref={leftGrad} id={`${id}-l`} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ ...fade, stopColor: tone, stopOpacity: shade.left[0] }} />
          <stop offset="1" style={{ ...fade, stopColor: tone, stopOpacity: shade.left[1] }} />
        </linearGradient>
        <linearGradient ref={rightGrad} id={`${id}-r`} gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ ...fade, stopColor: tone, stopOpacity: shade.right[0] }} />
          <stop offset="1" style={{ ...fade, stopColor: tone, stopOpacity: shade.right[1] }} />
        </linearGradient>
        <linearGradient ref={topGrad} id={`${id}-t`} gradientUnits="userSpaceOnUse" y1="0" y2="0">
          {/* 3D 렌더러처럼 선형 색 공간에서 흰빛과 색을 섞은 단계 색 지정 */}
          {Array.from({ length: TOP_STOPS + 1 }, (_, k) => {
            const t = k / TOP_STOPS;
            return (
              <stop
                key={k}
                offset={t}
                style={{
                  ...fade,
                  stopColor: `color-mix(in srgb-linear, ${tone} ${t * 100}%, white)`,
                  stopOpacity: shade.topWhite + (shade.topAlpha - shade.topWhite) * t,
                }}
              />
            );
          })}
        </linearGradient>
      </defs>
      <polygon ref={leftRef} fill={`url(#${id}-l)`} />
      <polygon ref={topRef} fill={`url(#${id}-t)`} />
      <polygon ref={rightRef} fill={`url(#${id}-r)`} />
      {outline &&
        [0, 1, 2, 3].map((i) => (
          <line
            key={i}
            ref={(l) => void (lineRefs.current[i] = l)}
            className="pointer-events-none"
            strokeWidth={1.2}
            strokeLinecap="round"
            style={{ stroke: tone, strokeOpacity: 0.9, transition: `stroke ${FADE}` }}
          />
        ))}
    </g>
  );
}

type IsoViewProps = {
  width: number;
  height: number;
  // 틀 밖으로 나가는 그림이 잘리지 않도록 사방으로 넓힐 여백(px) 지정
  pad?: number;
  children: ReactNode;
};

// Figma 등각 그림처럼 30도 내려다보고 45도 돌린 그림 틀을 만들고 먼 기둥부터 차례로 겹쳐 그리도록 정렬
export function IsoView({ width, height, pad = 24, children }: IsoViewProps) {
  const w = width + pad * 2;
  const h = height + pad * 2;
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{ position?: Vec }>[];
  const sorted = items
    .map((el, i) => ({ el, i, d: el.props.position ? depth(el.props.position) : 0 }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .map((x) => x.el);
  return (
    <svg className="pointer-events-none absolute overflow-hidden" style={{ left: -pad, top: -pad, zIndex: LAYER }} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Center.Provider value={[w / 2, h / 2]}>
        {sorted}
      </Center.Provider>
    </svg>
  );
}
