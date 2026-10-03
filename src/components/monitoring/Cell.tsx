import { TEXT } from "@/lib/typography";

const CELL_TYPE = {
  group: { box: "h-8 justify-center bg-(--navy-650)", text: `font-semibold text-(--text-secondary) ${TEXT.labelMedium}` },
  header: { box: "h-[38px] justify-center bg-(--navy-700)", text: `font-semibold text-(--text-secondary) ${TEXT.labelMedium}` },
  body: { box: "h-[38px]", text: `text-(--text-primary) ${TEXT.bodyMedium}` },
  numeric: { box: "h-[38px] justify-end", text: `text-(--text-primary) tabular-nums ${TEXT.bodyMedium}` },
  alert: {
    box: "h-[38px] bg-linear-to-r from-(--status-danger)/85 to-(--coral-600)/85",
    text: `font-medium text-(--white) ${TEXT.bodyMedium}`,
  },
  highlight: { box: "h-[38px] justify-end bg-(--accent-cyan)/8", text: `font-medium text-(--accent-cyan) tabular-nums ${TEXT.bodyMedium}` },
} as const;

export type CellType = keyof typeof CELL_TYPE;

type CellProps = {
  text: string;
  type?: CellType;
  // 남는 폭을 채우려면 "grow" 지정
  width?: number | "grow";
  align?: "start" | "center" | "end";
};

const ALIGN = { start: "justify-start", center: "justify-center", end: "justify-end" } as const;

// 데이터 표 한 칸을 그룹·헤더·본문·숫자·이상·선택 열 모양으로 표시
export function Cell({ text, type = "body", width = 120, align }: CellProps) {
  const t = CELL_TYPE[type];
  const grow = width === "grow";
  return (
    <div
      className={`flex items-center border-b border-(--border-subtle) px-3 ${grow ? "min-w-px flex-1" : "shrink-0"} ${t.box} ${align ? ALIGN[align] : ""}`}
      style={grow ? undefined : { width }}
    >
      {/* 값이 바뀔 때마다 새로 그려 살짝 커졌다 돌아오게 처리 */}
      <p key={text} className={`truncate whitespace-nowrap ${type === "numeric" || type === "highlight" ? "animate-[value-pop_420ms_ease-out]" : ""} ${t.text}`}>
        {text}
      </p>
    </div>
  );
}
