import type { ReactNode } from "react";

type PanelProps = {
  className?: string;
  headerClassName?: string;
  header: ReactNode;
  children: ReactNode;
};

export function Panel({ className = "", headerClassName = "gap-4", header, children }: PanelProps) {
  return (
    // 안쪽 펼침 목록이 열려 있으면 다음 패널보다 위로 올려 목록이 가려지지 않도록 처리
    <section
      className={`relative flex flex-col items-start gap-3 rounded-[24px] has-[[aria-expanded=true]]:z-30 border border-(--border-default) p-4 drop-shadow-[0px_14px_15px_var(--effect-shadow-panel)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] bg-(image:--gradient-panel)"
      />
      {/* 헤더의 펼침 목록이 본문 위에 뜨도록 쌓임 순서 지정 */}
      <div className={`relative z-20 flex w-full shrink-0 items-center ${headerClassName}`}>
        {header}
      </div>
      <div className="relative flex min-h-px w-full flex-[1_0_0] flex-col items-start overflow-clip">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
    </section>
  );
}

export function Spacer() {
  return <div className="h-px min-w-px flex-[1_0_0]" />;
}
