import { TEXT } from "@/lib/typography";

const LEVEL_TOKEN = { INFO: "--accent-cyan", WARN: "--status-warning", ERROR: "--status-danger" } as const;

type LogLineProps = {
  time: string;
  level: keyof typeof LEVEL_TOKEN;
  message: string;
};

// 실행 로그 한 줄을 새로 들어온 것처럼 밀려 나오며 표시
export function LogLine({ time, level, message }: LogLineProps) {
  return (
    <div className="flex animate-[log-in_360ms_ease-out] items-center gap-3">
      <span className={`font-medium text-(--text-tertiary) tabular-nums ${TEXT.titleSmall}`}>{time}</span>
      <span className={`font-semibold ${TEXT.labelSmall}`} style={{ color: `var(${LEVEL_TOKEN[level]})` }}>
        {level}
      </span>
      <span className={`${TEXT.bodyMedium} ${level === "ERROR" ? "text-(--status-danger)" : "text-(--text-primary)"}`}>{message}</span>
    </div>
  );
}
