import type { ReactNode } from "react";

type PanelProps = {
  className?: string;
  headerClassName?: string;
  header: ReactNode;
  children: ReactNode;
};

export function Panel({ className = "", headerClassName = "gap-4", header, children }: PanelProps) {
  return (
    <section
      className={`relative flex flex-col items-start gap-3 rounded-[24px] border border-(--border-default) p-4 drop-shadow-[0px_14px_15px_var(--effect-shadow-panel)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] bg-(image:--gradient-panel)"
      />
      <div className={`relative flex w-full shrink-0 items-center overflow-clip ${headerClassName}`}>
        {header}
      </div>
      <div className="relative flex min-h-px w-full flex-[1_0_0] flex-col items-start overflow-clip">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_var(--effect-inner-highlight)]" />
    </section>
  );
}

type PanelTitleProps = {
  eyebrow: string;
  title: string;
};

export function PanelTitle({ eyebrow, title }: PanelTitleProps) {
  return (
    <div className="relative flex shrink-0 items-center gap-3">
      <div className="h-9 w-1 shrink-0 rounded-[2px] bg-linear-to-b from-(--accent-cyan) to-(--accent-violet) shadow-[0px_0px_8px_0px_var(--accent-cyan-glow)]" />
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <p className="text-[11px] font-semibold leading-4 tracking-[0.5px] text-(--accent-cyan)">{eyebrow}</p>
        <p className="text-[16px] font-bold leading-6 tracking-[0.15px] text-(--text-primary)">{title}</p>
      </div>
    </div>
  );
}

export function Spacer() {
  return <div className="h-px min-w-px flex-[1_0_0]" />;
}
