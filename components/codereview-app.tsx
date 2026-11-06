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
  high: "border-red-500/40 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300",
  medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
  low: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
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
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-turquoise dark:text-brand-navy dark:hover:bg-brand-turquoise/90";

const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur transition hover:bg-slate-50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900";

const CARD =
  "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60";

const MUTED_TEXT = "text-slate-500 dark:text-slate-400";

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

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input */}
      <div className="space-y-4 lg:col-span-2">
        <div className={CARD}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Code2 className="size-4 text-brand-turquoise" />
              Kod gir
            </h2>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="cr-lang"
                className={cn("text-xs font-medium", MUTED_TEXT)}
              >
                Dil:
              </label>
              <select
                id="cr-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageValue)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
              className="block h-64 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-[12.5px] leading-relaxed text-slate-900 shadow-inner outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={run}
                disabled={loading || code.trim().length < 10}
                className={BTN_PRIMARY}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    İnceleniyor…
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    İncele
                  </>
                )}
              </button>
              <button
                type="button"
                className={BTN_OUTLINE}
                onClick={() => setCode(EXAMPLE)}
                disabled={loading}
              >
                Örnek kodu yükle
              </button>
            </div>
            <p className={cn("text-[11px]", MUTED_TEXT)}>
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
            className="flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {!result && !loading && !error ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 border-dashed py-12 text-center",
            )}
          >
            <Sparkles className="size-8 text-brand-turquoise" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Hazır olduğunda incele
            </h3>
            <p className={cn("max-w-sm text-sm", MUTED_TEXT)}>
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
              CARD,
              "flex flex-col items-center gap-3 py-12 text-center",
            )}
          >
            <Loader2 className="size-8 animate-spin text-brand-turquoise" />
            <p className={cn("text-sm", MUTED_TEXT)}>
              Kod inceleniyor… 10-30 saniye arası sürer.
            </p>
          </div>
        ) : null}

        {result ? (
          <>
            <div
              className={cn(
                CARD,
                "flex flex-wrap items-center justify-between gap-4 px-5 py-5",
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-xs uppercase tracking-widest",
                    MUTED_TEXT,
                  )}
                >
                  Kalite skoru
                </p>
                <p
                  className={cn(
                    "text-4xl font-bold tracking-tight",
                    scoreColor(result.qualityScore),
                  )}
                >
                  {result.qualityScore}
                  <span
                    className={cn("ml-1 text-base font-medium", MUTED_TEXT)}
                  >
                    / 100
                  </span>
                </p>
              </div>
              <div className="flex-1 text-right">
                <p
                  className={cn(
                    "text-xs uppercase tracking-widest",
                    MUTED_TEXT,
                  )}
                >
                  Tespit edilen dil
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {result.detectedLanguage}
                </p>
              </div>
            </div>

            <div className={cn(CARD, "px-5 py-5")}>
              <p
                className={cn("text-sm leading-relaxed", MUTED_TEXT)}
              >
                {result.summary}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="İnceleme sonuçları"
              className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                    activeTab === t.id
                      ? "border-brand-turquoise text-slate-900 dark:text-slate-100"
                      : cn(
                          "border-transparent hover:text-slate-900 dark:hover:text-slate-100",
                          MUTED_TEXT,
                        ),
                  )}
                >
                  {t.label}
                  {typeof t.count === "number" ? (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
                      className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-turquoise" />
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
            "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm backdrop-blur",
            SEV_STYLE[f.severity],
          )}
        >
          {icon ?? <AlertCircle className="mt-0.5 size-4 shrink-0" />}
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:bg-slate-900/70">
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
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/40 px-4 py-6 text-center text-sm text-slate-600 backdrop-blur dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <CheckCircle2 className="mx-auto mb-2 size-5 text-emerald-500" />
      {text}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="max-h-[480px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-[12.5px] leading-relaxed text-slate-900 shadow-inner dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute right-2 top-2 rounded-md border border-slate-300 bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        Kopyala
      </button>
    </div>
  );
}
