import type { ReactNode } from "react";
import { SectionTitle } from "@/components/foundations";

type ContentCardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

// 모달 안에서 섹션 제목과 본문 내용을 한 카드로 묶어 표시
export function ContentCard({ title, eyebrow, children }: ContentCardProps) {
  return (
    <section className="flex w-[520px] animate-[fade-up_360ms_ease-out] flex-col items-start gap-3 rounded-[18px] border border-(--border-default) bg-(--neutral-card) p-4">
      <SectionTitle title={title} eyebrow={eyebrow} />
      <div className="flex w-full flex-col items-start gap-1.5">{children}</div>
    </section>
  );
}
