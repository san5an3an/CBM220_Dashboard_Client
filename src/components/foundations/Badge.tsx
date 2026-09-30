import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const BADGE_TONE = {
  neutral: { text: "--text-secondary", bg: "--neutral-hover", border: "--border-default" },
  accent: { text: "--accent-cyan" },
  danger: { text: "--status-danger" },
} as const;

type BadgeProps = {
  label: string;
  tone?: keyof typeof BADGE_TONE;
};

// 건수 같은 짧은 수치를 둥근 배지로 표시
export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const t = BADGE_TONE[tone];
  const style =
    "bg" in t
      ? { color: `var(${t.text})`, background: `var(${t.bg})`, borderColor: `var(${t.border})` }
      : { color: `var(${t.text})`, background: tint(t.text, 12), borderColor: tint(t.text, 35) };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold whitespace-nowrap ${TEXT.labelMedium}`} style={style}>
      {label}
    </span>
  );
}
