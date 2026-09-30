import { TEXT } from "@/lib/typography";

type SectionTitleProps = {
  title: string;
  eyebrow?: string;
};

// 카드·패널 안의 섹션 제목 표시
export function SectionTitle({ title, eyebrow }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-[3px] shrink-0 rounded-[2px] bg-linear-to-b from-(--accent-cyan) to-(--accent-violet)" />
      <div className="flex flex-col items-start whitespace-nowrap">
        {eyebrow && <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{eyebrow}</p>}
        <p className={`font-bold text-(--text-primary) ${TEXT.titleSmall}`}>{title}</p>
      </div>
    </div>
  );
}
