import { tint } from "@/lib/tone";
import { TEXT } from "@/lib/typography";

const NOTE_TONE = {
  amber: "--status-warning",
  cyan: "--accent-cyan",
  coral: "--status-danger",
} as const;

type InfoNoteProps = {
  text: string;
  tone?: keyof typeof NOTE_TONE;
};

// 짧은 안내 문구를 톤 색 인라인 상자로 표시
export function InfoNote({ text, tone = "amber" }: InfoNoteProps) {
  const token = NOTE_TONE[tone];
  return (
    <div
      className="flex w-[480px] animate-[fade-up_320ms_ease-out] items-center rounded-[12px] border p-4"
      style={{ borderColor: tint(token, 30), background: tint(token, 8) }}
    >
      <p className={`min-w-px flex-1 font-medium ${TEXT.labelSmall}`} style={{ color: `var(${token})` }}>
        {text}
      </p>
    </div>
  );
}
