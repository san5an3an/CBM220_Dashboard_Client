import { Vector3 } from "three";

// 편성 무대 원본(1728×596)을 패널 본문 폭에 맞게 축소
export const SCENE_SCALE = 1675.812 / 1728;
// 본문이 이 크기보다 크면 무대를 가운데로 이동
export const BODY_W = 1734;
export const BODY_H = 584;

// 디자인의 차량 간격과 차체 끝면 기울기로 카메라 축 계산
const SLOPE = 34 / 138;
const DEPTH_RATIO = 16 / 22;
const U = Math.sqrt(SLOPE / DEPTH_RATIO);
const T = Math.sqrt(1 + U * U - SLOPE * SLOPE - (DEPTH_RATIO * U) ** 2);
const RIGHT = new Vector3(1, 0, -U);
const UP = new Vector3(-SLOPE, T, -DEPTH_RATIO * U);

// 월드 1단위가 차지하는 디자인 픽셀 수 계산
export const PX_PER_UNIT = RIGHT.length();
export const AXIS_RIGHT = RIGHT.clone().normalize();
export const AXIS_UP = UP.clone().normalize();
export const AXIS_BACK = new Vector3().crossVectors(AXIS_RIGHT, AXIS_UP).normalize();

// 1호차 앞면 왼쪽 아래를 월드 원점으로 지정
const ORIGIN = { x: 176, y: 228 };

// 디자인 좌표를 화면과 평행한 면의 월드 좌표로 변환
export function designToWorld(x: number, y: number, depth = 0) {
  return new Vector3()
    .addScaledVector(AXIS_RIGHT, (x - ORIGIN.x) / PX_PER_UNIT)
    .addScaledVector(AXIS_UP, -(y - ORIGIN.y) / PX_PER_UNIT)
    .addScaledVector(AXIS_BACK, depth);
}

// 캔버스 크기에 맞춰 카메라 위치 계산
export function cameraPosition(width: number, height: number) {
  const ox = Math.max(0, (width - BODY_W) / 2);
  const oy = Math.max(0, (height - BODY_H) / 2);
  const zoom = SCENE_SCALE * PX_PER_UNIT;
  const alongRight = (width / 2 - ox - SCENE_SCALE * ORIGIN.x) / zoom;
  const alongUp = (oy + SCENE_SCALE * ORIGIN.y - height / 2) / zoom;
  return {
    zoom,
    offset: { x: ox, y: oy },
    position: new Vector3()
      .addScaledVector(AXIS_RIGHT, alongRight)
      .addScaledVector(AXIS_UP, alongUp)
      .addScaledVector(AXIS_BACK, 3000),
  };
}
