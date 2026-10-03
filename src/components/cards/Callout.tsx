import { Info, type LucideIcon, MessageSquare } from "lucide-react";
import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const CALLOUT_TONE: Record<CalloutTone, { token: string; Icon: LucideIcon }> = {
  criteria: { token: "--status-warning", Icon: Info },
  diagnosis: { token: "--accent-cyan", Icon: MessageSquare },
};

export type CalloutTone = "criteria" | "diagnosis";

type CalloutProps = {
  title: string;
  body: string;
  tone?: CalloutTone;
};

// 검지 기준이나 진단 의견을 톤 색 제목과 본문 상자로 표시
export function Callout({ title, body, tone = "criteria" }: CalloutProps) {
  const { token, Icon } = CALLOUT_TONE[tone];
  return (
    <div
      className="relative flex w-[560px] animate-[fade-up_360ms_ease-out] flex-col items-start gap-2 rounded-[16px] border px-[18px] py-4"
      style={{ borderColor: tint(token, 45) }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        style={{ backgroundImage: `linear-gradient(171.67deg, ${tint(token, 12)}, ${tint(token, 3)})` }}
      />
      <div className="relative flex items-center gap-2">
        <Icon className="shrink-0" style={{ color: `var(${token})` }} size={18} absoluteStrokeWidth strokeWidth={2} />
        <p className={`font-bold whitespace-nowrap ${TEXT.titleSmall}`} style={{ color: `var(${token})` }}>
          {title}
        </p>
      </div>
      <p className={`relative w-full text-(--text-primary)/90 ${TEXT.bodyMedium}`}>{body}</p>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.06)]" />
    </div>
  );
}
