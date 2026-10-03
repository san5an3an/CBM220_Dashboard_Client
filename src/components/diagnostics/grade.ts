import type { Grade } from "@/lib/tone";

// 경보 등급별 고장 구분 이름 지정
export const GRADE_NAME: Record<Grade, string> = {
  A: "편성중고장",
  B: "운행중고장",
  C: "경고",
  D: "주의",
  W: "정보",
};
