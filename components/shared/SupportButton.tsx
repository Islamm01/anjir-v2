"use client";

import { useLang } from "@/components/providers/LangProvider";

const SUPPORT_TG = "https://t.me/anjir_support";

export default function SupportButton() {
  const { lang } = useLang();

  return (
    <a
      href={SUPPORT_TG}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-[#229ED9] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:bg-[#1a8bc4] active:scale-95 transition-all"
      title={lang === "tj" ? "Дастгирӣ" : "Поддержка"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
      </svg>
      <span className="text-[13px] font-bold">
        {lang === "tj" ? "Дастгирӣ" : "Поддержка"}
      </span>
    </a>
  );
}
