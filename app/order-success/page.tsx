// app/order-success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { t, l }    from "@/lib/i18n";

export default function OrderSuccessPage() {
  const params      = useSearchParams();
  const orderNumber = params.get("number") ?? "";
  const { lang }    = useLang();

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center px-5 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-[#1a472a] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(26,71,42,0.3)]">
        <CheckCircle size={36} className="text-white" />
      </div>

      <h1 className="text-[26px] font-black text-black mb-2">
        {lang === "tj" ? "Фармоиш қабул шуд!" : "Заказ принят!"}
      </h1>
      <p className="text-[14px] text-black/50 mb-6 max-w-xs leading-relaxed">
        {lang === "tj"
          ? "Дӯкон ба зудӣ фармоиши шуморо тасдиқ мекунад"
          : "Магазин скоро подтвердит ваш заказ"}
      </p>

      {/* Order number */}
      <div className="bg-white rounded-2xl border border-black/5 px-8 py-5 mb-6 inline-block">
        <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1">
          {lang === "tj" ? "Рақами фармоиш" : "Номер заказа"}
        </p>
        <p className="text-[22px] font-black font-mono text-[#1a472a]">{orderNumber}</p>
        <p className="text-[11px] text-black/30 mt-1">
          {lang === "tj" ? "Ин рақамро нигоҳ доред" : "Сохраните этот номер"}
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-white rounded-2xl border border-black/5 px-5 py-4 mb-6 max-w-xs w-full text-left">
        <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-3">
          {lang === "tj" ? "Баъд чӣ мешавад" : "Что дальше"}
        </p>
        <div className="space-y-2.5">
          {[
            lang === "tj" ? "Дӯкон фармоишро тасдиқ мекунад" : "Магазин подтвердит заказ",
            lang === "tj" ? "Дӯкон фармоишро ҷамъ мекунад"  : "Магазин соберёт заказ",
            lang === "tj" ? "Курьер ба шумо меорад"          : "Курьер привезёт вам",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#1a472a]/10 rounded-full flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-[#1a472a]">{i + 1}</span>
              </div>
              <p className="text-[13px] text-black/60">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/"
        className="px-8 py-3.5 bg-[#1a472a] text-white text-[14px] font-black rounded-full hover:bg-[#0d2e1a] transition-colors shadow-[0_4px_20px_rgba(26,71,42,0.2)]">
        {lang === "tj" ? "Ба саҳифаи асосӣ" : "На главную"}
      </Link>
    </div>
  );
}