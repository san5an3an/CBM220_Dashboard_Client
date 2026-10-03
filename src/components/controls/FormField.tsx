import type { ReactNode } from "react";
import { ErrorMessage } from "@/components/foundations";
import { TEXT } from "@/lib/typography";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  helper?: string;
  error?: string;
  required?: boolean;
  width?: number | string;
};

// 라벨과 입력 요소, 도움말이나 오류 문구를 세로로 묶어 표시
export function FormField({ label, children, helper, error, required = false, width = 292 }: FormFieldProps) {
  return (
    <div className="flex flex-col items-start gap-1.5" style={{ width }}>
      <div className={`flex items-start gap-1 font-semibold whitespace-nowrap ${TEXT.labelLarge}`}>
        <span className="text-(--text-secondary)">{label}</span>
        {required && <span className="text-(--status-danger)">*</span>}
      </div>
      <div className="flex w-full flex-col items-start [&>*]:w-full!">{children}</div>
      {error ? (
        <ErrorMessage key={error} message={error} />
      ) : (
        helper && <p className={`font-medium whitespace-nowrap text-(--text-tertiary) ${TEXT.labelSmall}`}>{helper}</p>
      )}
    </div>
  );
}
