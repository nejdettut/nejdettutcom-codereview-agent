# CodeReview AI Agent

Yapıştırılan kodun dilini otomatik tespit eden, hataları ve güvenlik açıklarını raporlayan, refactor edilmiş sürüm ve pytest/jest testleri üreten yapay zekâ ajanı.

[nejdettut.com](https://www.nejdettut.com) vitrinde yer alan, Next.js 16 + Vercel AI SDK + Groq tabanlı bir uygulama.

## Teknoloji

- **Next.js 16** (App Router)
- **Vercel AI SDK** + `@ai-sdk/groq`
- **Groq** `openai/gpt-oss-120b`
- **Zod** şema doğrulama
- **Tailwind CSS v4**

## Çalıştırma

```bash
npm install
cp .env.example .env.local
# GROQ_API_KEY değerini doldur (ücretsiz: console.groq.com)
npm run dev
```

`http://localhost:3000` üzerinde açılır.

## Deploy

1. Bu repo'yu Vercel'e import et.
2. Environment Variables → `GROQ_API_KEY` ekle.
3. Yayına al.

Varsayılan alan adı: `nejdettutcom-codereview-agent.vercel.app`.
Özel alan: `codereview.nejdettut.com` (DNS CNAME → Vercel).

## Lisans

MIT · [Nejdet Tut](https://www.nejdettut.com)
