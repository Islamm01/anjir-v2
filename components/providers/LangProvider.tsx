// components/providers/LangProvider.tsx
"use client";

import {
  createContext, useContext, useState, useEffect, ReactNode,
} from "react";
import type { Lang } from "@/lib/i18n";
import { defaultLang } from "@/lib/i18n";

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; }
const Ctx = createContext<LangCtx>({ lang: defaultLang, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem("anjir_lang") as Lang | null;
    if (saved === "tj" || saved === "ru") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("anjir_lang", l);
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}