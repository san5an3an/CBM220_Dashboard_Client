import { TONE, type Tone, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type TagProps = {
  label: string;
  tone?: Extract<Tone, "amber" | "cyan" | "coral">;
};

// 임계치 같은 메타 정보를 필 모양 태그로 표시
export function Tag({ label, tone = "amber" }: TagProps) {
  const token = TONE[tone];
  return (
    <span
      className={`inline-flex items-start rounded-full border px-2.5 py-1 font-semibold whitespace-nowrap ${TEXT.labelSmall}`}
      style={{ color: `var(${token})`, background: tint(token, 16), borderColor: tint(token, 50) }}
    >
      {label}
    </span>
  );
}
