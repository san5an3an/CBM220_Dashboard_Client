const BONES = {
  tile: [
    "h-3 w-20 rounded-[6px]",
    "h-[30px] w-[140px] rounded-[8px]",
    "h-2.5 w-[110px] rounded-[5px]",
  ],
  card: [
    "h-3 w-[120px] rounded-[6px]",
    "h-3.5 w-full rounded-[6px]",
    "h-3.5 w-full rounded-[6px]",
    "h-3.5 w-full rounded-[6px]",
  ],
} as const;

type SkeletonProps = {
  kind?: keyof typeof BONES;
};

// 데이터를 불러오는 동안 타일이나 카드 자리를 반짝이는 뼈대로 표시
export function Skeleton({ kind = "tile" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className={`relative flex flex-col items-start gap-2.5 overflow-hidden border border-(--border-default) bg-(--neutral-card) p-4 ${
        kind === "card" ? "w-[520px] rounded-[18px]" : "w-60 rounded-[16px]"
      }`}
    >
      {BONES[kind].map((bone, i) => (
        <span key={i} className={`shrink-0 bg-linear-to-r from-(--white)/4 to-(--white)/10 ${bone}`} />
      ))}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-(--white)/6 to-transparent"
      />
    </div>
  );
}
