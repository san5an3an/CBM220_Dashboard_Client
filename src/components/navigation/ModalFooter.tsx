import type { ReactNode } from "react";
import { TEXT } from "@/lib/typography";

type ModalFooterProps = {
  children: ReactNode;
  note?: string;
  // 안내 문구를 오류 색으로 표시하도록 지정
  error?: boolean;
};

// 모달 시트 아래쪽에 안내 문구와 버튼 묶음 표시
export function ModalFooter({ children, note, error = false }: ModalFooterProps) {
  return (
    <div className="flex w-full items-center gap-2.5 border-t border-(--border-default) pt-3.5">
      {note && (
        <p key={String(error)} className={`font-medium whitespace-nowrap ${TEXT.labelMedium} ${error ? "animate-[shake_320ms_ease-out] text-(--status-danger)" : "text-(--text-secondary)"}`}>
          {note}
        </p>
      )}
      <span className="h-px min-w-px flex-1" />
      <div className="flex items-center gap-2.5">{children}</div>
    </div>
  );
}
