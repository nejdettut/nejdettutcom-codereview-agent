import { CodeReviewApp } from "@/components/codereview-app";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[--color-brand-turquoise]">
            Yapay Zekâ Projesi
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <span aria-hidden="true">🤖</span>
            CodeReview AI Agent
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Kodunu yapıştır — yapay zekâ hataları, güvenlik açıklarını,
            iyileştirmeleri raporlar; refactor edilmiş sürümü ve testleri
            üretir.
          </p>
        </div>
        <a
          href="https://www.nejdettut.com/projeler/codereview-ai-agent"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← nejdettut.com&apos;a dön
        </a>
      </header>

      <CodeReviewApp />

      <footer className="mt-16 border-t border-[--color-border] pt-6 text-center text-xs text-muted-foreground">
        Bir{" "}
        <a
          href="https://www.nejdettut.com"
          className="underline hover:text-foreground"
        >
          nejdettut.com
        </a>{" "}
        yapay zekâ projesi · Groq · Next.js
      </footer>
    </main>
  );
}
