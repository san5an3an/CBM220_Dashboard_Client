import { X } from "lucide-react";
import { TEXT } from "@/lib/typography";

type ModalHeaderProps = {
  title: string;
  onClose: () => void;
  titleId?: string;
};

// 모달 시트 맨 위에 강조 막대·제목·닫기 버튼 표시
export function ModalHeader({ title, onClose, titleId }: ModalHeaderProps) {
  return (
    <div className="relative flex w-full items-center gap-3 rounded-[16px] border border-(--white)/8 py-3.5 pr-4 pl-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] bg-linear-to-r from-(--navy-700) to-(--navy-750)" />
      <div className="relative h-6 w-1 shrink-0 rounded-[2px] bg-linear-to-b from-(--accent-cyan) to-(--accent-violet) shadow-[0px_0px_8px_0px_color-mix(in_srgb,var(--accent-cyan)_60%,transparent)]" />
      <h2 id={titleId} className={`relative min-w-px flex-1 font-bold text-(--text-primary) ${TEXT.titleLarge}`}>
        {title}
      </h2>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="group relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-(--border-strong) bg-(--white)/6 transition-colors hover:bg-(--white)/10"
      >
        <X className="text-(--text-secondary) transition-transform duration-300 group-hover:rotate-90 group-hover:text-(--text-primary)" size={20} absoluteStrokeWidth />
      </button>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
    </div>
  );
}
