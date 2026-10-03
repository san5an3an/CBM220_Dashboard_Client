import { TEXT } from "@/lib/typography";

type PanelHeaderProps = {
  eyebrow: string;
  title: string;
};

// 패널 머리에 그라데이션 막대와 영문 소제목·제목 표시
export function PanelHeader({ eyebrow, title }: PanelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-1 shrink-0 rounded-[2px] bg-linear-to-b from-(--accent-cyan) to-(--accent-violet) shadow-[0px_0px_8px_0px_color-mix(in_srgb,var(--accent-cyan)_60%,transparent)]" />
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <p className={`font-semibold text-(--accent-cyan) ${TEXT.labelSmall}`}>{eyebrow}</p>
        <p className={`font-bold text-(--text-primary) ${TEXT.titleMedium}`}>{title}</p>
      </div>
    </div>
  );
}
