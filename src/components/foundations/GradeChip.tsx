import { GRADE, type Grade, shade, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type GradeChipProps = {
  grade: Grade;
  // 칩 한 변 길이(px) 지정
  size?: number;
};

// 경보 등급 글자를 입체감 있는 사각 칩으로 표시
export function GradeChip({ grade, size = 22 }: GradeChipProps) {
  const token = GRADE[grade];
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-[7px]"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(to bottom, ${shade(token, "white", 30)}, var(${token}) 55%, ${shade(token, "black", 25)})`,
        filter: `drop-shadow(0px 3px 5px ${tint(token, 45)})`,
      }}
    >
      <span
        className={`relative font-semibold ${TEXT.labelSmall} ${grade === "C" ? "text-(--text-on-accent)" : "text-(--white)"}`}
      >
        {grade}
      </span>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.5)]" />
    </span>
  );
}
