import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeReview AI Agent — nejdettut.com",
  description:
    "Yapıştırdığın kodu inceleyen, hataları ve güvenlik açıklarını raporlayan, refactor ve testleri üreten yapay zekâ ajanı.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
