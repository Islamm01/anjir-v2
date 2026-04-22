// components/ui/LangSwitcher.tsx
"use client";

import { useLang } from "@/components/providers/LangProvider";

interface Props {
  /** "light" = text on dark bg (navbar), "dark" = text on light bg */
  variant?: "light" | "dark";
}

export default function LangSwitcher({ variant = "light" }: Props) {
  const { lang, setLang } = useLang();

  const base    = variant === "light" ? "text-white/50 hover:text-white"   : "text-black/40 hover:text-black";
  const active  = variant === "light" ? "text-white font-bold"             : "text-black font-bold";
  const divider = variant === "light" ? "text-white/20"                    : "text-black/20";

  return (
    <div className="flex items-center gap-1 text-[13px] select-none">
      <button
        onClick={() => setLang("tj")}
        className={`px-1 transition-colors ${lang === "tj" ? active : base}`}
      >
        ТҶ
      </button>
      <span className={divider}>|</span>
      <button
        onClick={() => setLang("ru")}
        className={`px-1 transition-colors ${lang === "ru" ? active : base}`}
      >
        РУ
      </button>
    </div>
  );
}