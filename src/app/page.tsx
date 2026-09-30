// 가로(1920×1080)는 좌우 배치, 세로(1080×1920)는 상하 배치
export default function Home() {
  return (
    <main className="grid h-full w-full gap-6 p-10 grid-cols-[1fr_2fr] grid-rows-1 portrait:grid-cols-1 portrait:grid-rows-[1fr_2fr]">
      <section className="flex items-center justify-center rounded-2xl bg-zinc-100 text-2xl font-semibold">
        패널 A
      </section>
      <section className="flex items-center justify-center rounded-2xl bg-zinc-200 text-2xl font-semibold">
        패널 B
      </section>
    </main>
  );
}
