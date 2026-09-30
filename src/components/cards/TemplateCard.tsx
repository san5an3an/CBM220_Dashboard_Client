import { TONE, tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";
import { IsoCube } from "./IsoCube";

type TemplateTone = "cyan" | "amber" | "violet";

type TemplateCardProps = {
  name: string;
  sub: string;
  tone?: TemplateTone;
  selected?: boolean;
  onSelect?: () => void;
};

// 프리셋 템플릿 하나를 입체 큐브 아이콘과 이름·설명 카드로 표시
export function TemplateCard({ name, sub, tone = "cyan", selected = false, onSelect }: TemplateCardProps) {
  const token = TONE[tone];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group flex w-[200px] cursor-pointer items-center gap-3 rounded-[14px] border p-4 text-left transition-colors duration-200 ${
        selected ? "" : "border-(--border-default) bg-(--neutral-card) hover:bg-(--neutral-hover)"
      }`}
      style={
        selected
          ? { borderColor: tint(token, 60), backgroundImage: `linear-gradient(to bottom, ${tint(token, 20)}, ${tint("--neutral-panel-end", 4)})` }
          : undefined
      }
    >
      <span className="relative size-10 shrink-0">
        {/* 선택된 카드는 큐브가 천천히 돌고 나머지는 올렸을 때만 돌도록 처리 */}
        <IsoCube
          token={token}
          width={26}
          spinning={selected}
          className={`absolute inset-0 ${selected ? "" : "[&>div]:group-hover:animate-[cube-spin_2.4s_ease-in-out]"}`}
        />
      </span>
      <span className="flex shrink-0 flex-col items-start gap-0.5 font-medium whitespace-nowrap">
        <span className={`text-(--text-primary) ${TEXT.bodyMedium}`}>{name}</span>
        <span className={`text-(--text-secondary) ${TEXT.labelSmall}`}>{sub}</span>
      </span>
    </button>
  );
}
