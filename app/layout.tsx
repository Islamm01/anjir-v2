import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
const noto = Noto_Sans({ subsets:["cyrillic","latin"], weight:["400","500","700","900"], variable:"--font-noto", display:"swap" });
export const metadata: Metadata = {
  title: { default:"anjir — доставка в Худжанде", template:"%s | anjir" },
  description: "Доставка фруктов и отправка посылок в Худжанде.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={noto.variable}>
      <body className="font-sans antialiased bg-white text-black">{children}</body>
    </html>
  );
}
