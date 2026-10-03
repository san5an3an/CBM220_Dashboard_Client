import { Check } from "lucide-react";
import { TONE, type Tone, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

type ModelSelectCardProps = {
  name: string;
  sub: string;
  tone?: Extract<Tone, "violet" | "cyan" | "mint">;
  selected?: boolean;
  // 학습 모델 파일이 없어 고를 수 없는 상태로 표시하도록 지정
  missing?: boolean;
  onToggle?: () => void;
};

// 앙상블에 넣을 모델을 체크 상자로 고르는 카드 표시
export function ModelSelectCard({ name, sub, tone = "violet", selected = false, missing = false, onToggle }: ModelSelectCardProps) {
  const token = TONE[tone];
  const on = selected || missing;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-disabled={missing}
      onClick={missing ? undefined : onToggle}
      className={`flex w-[200px] items-center gap-3 rounded-[14px] border p-4 text-left transition-[background-color,border-color,box-shadow] duration-200 ${
        missing ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        borderColor: missing ? tint("--status-danger", 70) : selected ? tint(token, 50) : "var(--border-default)",
        backgroundImage: on ? `linear-gradient(to bottom, ${tint(token, 18)}, transparent)` : undefined,
        backgroundColor: on ? undefined : "color-mix(in srgb, var(--white) 2%, transparent)",
      }}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
          selected ? "border-(--white)/30 bg-(image:--gradient-accent)" : missing ? "border-(--status-danger)/30 bg-(--white)/4" : "border-(--white)/30 bg-(--white)/4"
        }`}
      >
        {selected && <Check key="on" className="animate-[pop-in_200ms_ease-out] text-(--text-on-accent)" size={14} strokeWidth={3} />}
      </span>
      <span className="flex flex-col items-start gap-0.5 font-medium whitespace-nowrap">
        <span className={`text-(--text-primary) ${TEXT.bodyMedium}`}>{name}</span>
        <span className={`${TEXT.labelSmall} ${missing ? "text-(--status-danger)" : "text-(--text-secondary)"}`}>{sub}</span>
      </span>
    </button>
  );
}
