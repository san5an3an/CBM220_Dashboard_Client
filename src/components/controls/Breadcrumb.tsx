import { TEXT } from "@/lib/typography";

type BreadcrumbProps = {
  items: string[];
};

// 상위 메뉴부터 현재 화면까지 경로를 점으로 이어 표시
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="현재 위치" className="flex items-center gap-2">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="size-1 rounded-full bg-(--text-tertiary)" />}
            <span
              aria-current={last ? "page" : undefined}
              className={`whitespace-nowrap ${TEXT.labelLarge} ${last ? "font-semibold text-(--accent-cyan)" : "font-medium text-(--text-tertiary)"}`}
            >
              {item}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
