import { TEXT } from "@/lib/typography";

type DetailFieldProps = {
  label?: string;
  value?: string;
  width?: number | string;
};

// 상세 정보 한 줄을 이름과 오른쪽 정렬 값으로 점선 구분해 표시
export function DetailField({ label = "고장 코드", value = "1234", width = 380 }: DetailFieldProps) {
  return (
    <div style={{ width }} className="flex items-center gap-3 border-b border-dashed border-(--white)/8 py-2.5 font-medium">
      <p className={`shrink-0 whitespace-nowrap text-(--text-secondary) ${TEXT.labelLarge}`}>{label}</p>
      <p key={value} className={`min-w-px flex-1 animate-[fade-up_300ms_ease-out] text-right text-(--text-primary) ${TEXT.bodyMedium}`}>
        {value}
      </p>
    </div>
  );
}
