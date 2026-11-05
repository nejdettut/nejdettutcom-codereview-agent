import "server-only";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  code: z.string().min(10).max(10_000),
  language: z
    .enum([
      "auto",
      "python",
      "javascript",
      "typescript",
      "java",
      "go",
      "rust",
      "sql",
    ])
    .default("auto"),
});

const ReviewSchema = z.object({
  detectedLanguage: z.string(),
  summary: z.string(),
  bugs: z.array(
    z.object({
      severity: z.enum(["high", "medium", "low"]),
      description: z.string(),
      line: z.number().int().nullable(),
    }),
  ),
  security: z.array(
    z.object({
      severity: z.enum(["high", "medium", "low"]),
      description: z.string(),
      line: z.number().int().nullable(),
    }),
  ),
  improvements: z.array(z.string()),
  refactoredCode: z.string(),
  tests: z.string(),
  qualityScore: z.number().int().min(0).max(100),
});

export async function POST(req: Request) {
  const limited = await rateLimit({
    action: "codereview",
    windowMs: 60 * 60 * 1000,
    max: 20,
  });
  if (!limited.ok) {
    return json(
      {
        error:
          "Saatte en fazla 20 inceleme yapabilirsin. Lütfen biraz sonra tekrar dene.",
      },
      429,
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const languageHint =
    body.language === "auto"
      ? "Önce kodun hangi programlama dilinde yazıldığını tespit et."
      : `Kod ${body.language} dilinde yazılmıştır.`;

  const system = [
    "Sen deneyimli bir yazılım geliştirici ve kod inceleyicisisin.",
    "Verilen kodu hata, güvenlik açığı, performans ve okunabilirlik açısından inceleyeceksin.",
    "Bulduğun sorunları Türkçe olarak, net ve yapıcı bir dille açıklayacaksın.",
    "Refactor edilmiş kodu ve pytest/jest tabanlı birim testlerini üreteceksin.",
    "Kalite skoru 0-100 arası tam sayı olmalı: 90-100 kusursuz, 70-89 iyi, 50-69 iyileştirilebilir, 30-49 ciddi sorunlu, 0-29 yeniden yazılmalı.",
    languageHint,
  ].join(" ");

  const prompt = [
    "Aşağıdaki kodu detaylı incele ve sonucu zorunlu JSON şemasına uygun döndür.",
    "",
    "KOD:",
    "```",
    body.code,
    "```",
  ].join("\n");

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: ReviewSchema,
      system,
      prompt,
      temperature: 0.3,
    });
    return json(object);
  } catch (err) {
    console.error("[codereview] failed:", err);
    return json(
      { error: "İnceleme başarısız oldu. Lütfen biraz sonra tekrar dene." },
      502,
    );
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
