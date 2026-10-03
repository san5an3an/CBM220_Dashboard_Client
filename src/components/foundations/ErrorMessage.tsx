import { TriangleAlert } from "lucide-react";
import { TEXT } from "@/lib/typography";

type ErrorMessageProps = {
  message: string;
};

// 입력 검증 오류 문구를 경고 아이콘과 함께 표시
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p role="alert" className="flex animate-[shake_320ms_ease-out] items-center gap-1.5">
      <TriangleAlert className="shrink-0 text-(--status-danger)" size={14} />
      <span className={`font-medium whitespace-nowrap text-(--status-danger) ${TEXT.labelSmall}`}>{message}</span>
    </p>
  );
}
