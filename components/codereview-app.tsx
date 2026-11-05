"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Loader2,
  Play,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "high" | "medium" | "low";

type Finding = {
  severity: Severity;
  description: string;
  line: number | null;
};

type ReviewResult = {
  detectedLanguage: string;
  summary: string;
  bugs: Finding[];
  security: Finding[];
  improvements: string[];
  refactoredCode: string;
  tests: string;
  qualityScore: number;
};

const LANGUAGES = [
  { value: "auto", label: "Otomatik tespit" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
] as const;

type LanguageValue = (typeof LANGUAGES)[number]["value"];

const SEV_STYLE: Record<Severity, string> = {
  high: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  low: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

const SEV_LABEL: Record<Severity, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const EXAMPLE = `def login(username, password):
    query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
    result = db.execute(query)
    if result:
        return True
    return False`;

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-md bg-[--color-brand-navy] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-[--color-brand-turquoise] dark:text-[--color-brand-navy]";
const BTN_OUTLINE =
  "inline-flex items-center justify-center rounded-md border border-[--color-border] bg-[--color-card] px-3 py-2 text-sm font-medium text-[--color-foreground] transition hover:bg-[--color-muted] disabled:opacity-50";

export function CodeReviewApp() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<LanguageValue>("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "bugs" | "security" | "improvements" | "refactor" | "tests"
  >("bugs");

  async function run() {
    if (code.trim().length < 10) {
      setError("En az 10 karakterlik bir kod yapıştır.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Bilinmeyen hata.");
      } else {
        setResult(data as ReviewResult);
        setActiveTab("bugs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "bugs" as const, label: "Hatalar", count: result?.bugs.length ?? 0 },
    {
      id: "security" as const,
      label: "Güvenlik",
      count: result?.security.length ?? 0,
    },
    {
      id: "improvements" as const,
      label: "İyileştirmeler",
      count: result?.improvements.length ?? 0,
    },
    { id: "refactor" as const, label: "Refactor" },
    { id: "tests" as const, label: "Testler" },
  ];

  const card =
    "rounded-xl border border-[--color-border] bg-[--color-card] shadow-sm";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input */}
      <div className="space-y-4 lg:col-span-2">
        <div className={card}>
          <div className="border-b border-[--color-border] px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Code2 className="size-4 text-[--color-brand-turquoise]" />
              Kod gir
            </h2>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="cr-lang"
                className="text-xs font-medium text-muted-foreground"
              >
                Dil:
              </label>
              <select
                id="cr-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageValue)}
                className="rounded-md border border-[--color-border] bg-[--color-card] px-2 py-1 text-xs"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Kodu buraya yapıştır…"
              spellCheck={false}
              className="block h-64 w-full resize-y rounded-md border border-[--color-border] bg-[--color-card] p-3 font-mono text-[12px] leading-relaxed outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={run}
                disabled={loading || code.trim().length < 10}
                className={BTN_PRIMARY}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    İnceleniyor…
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 size-3.5" />
                    İncele
                  </>
                )}
              </button>
              <button
                className={BTN_OUTLINE}
                onClick={() => setCode(EXAMPLE)}
                disabled={loading}
              >
                Örnek kodu yükle
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Saatte 20 inceleme sınırı var. Kod maksimum 10.000 karakter.
            </p>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4 lg:col-span-3">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <div
            className={cn(
              card,
              "border-dashed flex flex-col items-center gap-3 py-12 text-center",
            )}
          >
            <Sparkles className="size-8 text-[--color-brand-turquoise]" />
            <h3 className="font-semibold">Hazır olduğunda incele</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Soldaki kutuya kodu yapıştır, tercihen dili seç ve
              &quot;İncele&quot; düğmesine bas. Yapay zekâ hataları, güvenlik
              açıklarını, iyileştirme önerilerini, refactor edilmiş sürümü ve
              testleri üretecek.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div
            className={cn(
              card,
              "flex flex-col items-center gap-3 py-12 text-center",
            )}
          >
            <Loader2 className="size-8 animate-spin text-[--color-brand-turquoise]" />
            <p className="text-sm text-muted-foreground">
              Kod inceleniyor… 10-30 saniye arası sürer.
            </p>
          </div>
        ) : null}

        {result ? (
          <>
            <div
              className={cn(
                card,
                "flex flex-wrap items-center justify-between gap-4 px-5 py-5",
              )}
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Kalite skoru
                </p>
                <p
                  className={cn(
                    "text-4xl font-bold tracking-tight",
                    scoreColor(result.qualityScore),
                  )}
                >
                  {result.qualityScore}
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    / 100
                  </span>
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Tespit edilen dil
                </p>
                <p className="text-lg font-semibold">
                  {result.detectedLanguage}
                </p>
              </div>
            </div>

            <div className={cn(card, "px-5 py-5")}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="İnceleme sonuçları"
              className="flex flex-wrap gap-1 border-b border-[--color-border]"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                    activeTab === t.id
                      ? "border-[--color-brand-turquoise] text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  {typeof t.count === "number" ? (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-[--color-muted] px-1.5 text-[10px] font-semibold">
                      {t.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {activeTab === "bugs" ? (
              <FindingsList
                findings={result.bugs}
                emptyText="Hata bulunamadı."
              />
            ) : null}
            {activeTab === "security" ? (
              <FindingsList
                findings={result.security}
                emptyText="Güvenlik açığı tespit edilmedi."
                icon={<ShieldAlert className="mt-0.5 size-4 shrink-0" />}
              />
            ) : null}
            {activeTab === "improvements" ? (
              result.improvements.length === 0 ? (
                <EmptyNote text="İyileştirme önerisi yok." />
              ) : (
                <ul className="space-y-2">
                  {result.improvements.map((imp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-[--color-border] bg-[--color-card] px-4 py-3 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[--color-brand-turquoise]" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
            {activeTab === "refactor" ? (
              <CodeBlock code={result.refactoredCode} />
            ) : null}
            {activeTab === "tests" ? <CodeBlock code={result.tests} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function FindingsList({
  findings,
  emptyText,
  icon,
}: {
  findings: Finding[];
  emptyText: string;
  icon?: React.ReactNode;
}) {
  if (findings.length === 0) return <EmptyNote text={emptyText} />;
  return (
    <ul className="space-y-2">
      {findings.map((f, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
            SEV_STYLE[f.severity],
          )}
        >
          {icon ?? <AlertCircle className="mt-0.5 size-4 shrink-0" />}
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[--color-background]/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {SEV_LABEL[f.severity]}
              </span>
              {f.line !== null ? (
                <span className="text-[11px] opacity-70">Satır {f.line}</span>
              ) : null}
            </div>
            <p className="leading-relaxed">{f.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[--color-border] px-4 py-6 text-center text-sm text-muted-foreground">
      <CheckCircle2 className="mx-auto mb-2 size-5 text-emerald-500" />
      {text}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="max-h-[480px] overflow-auto rounded-lg border border-[--color-border] bg-[--color-muted]/50 p-4 font-mono text-[12px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute right-2 top-2 rounded-md border border-[--color-border] bg-[--color-card] px-2 py-1 text-[11px] font-medium hover:bg-[--color-muted]"
      >
        Kopyala
      </button>
    </div>
  );
}
