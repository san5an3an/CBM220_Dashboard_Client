// 차량 상태 이름을 색 토큰 CSS 변수로 연결
export const CAR_STATE = {
  normal: "--blue-500",
  selected: "--accent-cyan",
  healthy: "--status-success",
  inspect: "--status-warning",
  fault: "--status-danger",
} as const;

export type CarState = keyof typeof CAR_STATE;

// 장치 상태 이름을 색 토큰 CSS 변수로 연결
export const DEVICE_STATE = {
  normal: "--status-success",
  inspect: "--status-warning",
  replace: "--status-danger",
} as const;

export type DeviceState = keyof typeof DEVICE_STATE;

// 노선 방향별 이름·방면·색 토큰 지정
export const DIRECTION = {
  up: { label: "상행", towards: "청량리 방면", token: "--accent-cyan" },
  down: { label: "하행", towards: "인천 방면", token: "--accent-violet" },
} as const;

export type Direction = keyof typeof DIRECTION;

// 청량리부터 인천까지 노선 역 이름 지정
export const STATIONS = [
  "청량리", "제기동", "신설동", "동묘앞", "동대문", "종로3가", "종각", "시청", "서울역", "남영", "용산", "노량진",
  "대방", "신길", "영등포", "신도림", "구로", "구일", "개봉", "오류동", "역곡", "부천", "소사", "송내",
  "부개", "부평", "백운", "동암", "간석", "주안", "도화", "제물포", "동인천", "인천",
] as const;
