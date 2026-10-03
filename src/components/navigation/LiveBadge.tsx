import { TEXT } from "@/lib/typography";

type LiveBadgeProps = {
  label: string;
  shape?: "pill" | "box";
};

// 실시간 수신 중임을 퍼져 나가는 점과 함께 표시
export function LiveBadge({ label, shape = "pill" }: LiveBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 border border-(--status-success)/40 bg-(--status-success)/12 px-3.5 ${
        shape === "pill" ? "rounded-full py-[9px]" : "rounded-[12px] py-2.5"
      }`}
    >
      <span className="relative size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-(--status-success) opacity-60" />
        <span className="absolute inset-0 rounded-full bg-(--status-success) shadow-[0px_0px_8px_0px_var(--status-success)]" />
      </span>
      <span className={`font-semibold whitespace-nowrap text-(--status-success) ${TEXT.labelLarge}`}>{label}</span>
    </span>
  );
}
