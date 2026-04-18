import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ShoppingBag, Package, Clock, ChevronRight, MapPin } from "lucide-react";
export default async function HomePage() {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-[#1a472a] text-white">
        <div className="max-w-md mx-auto px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center font-black text-[16px]">A</div>
              <div><span className="text-[20px] font-black tracking-tight leading-none block">anjir</span><span className="text-[10px] text-white/50">Доставка</span></div>
            </div>
            {session ? (
              <Link href="/profile" className="px-3 py-1.5 bg-white/10 rounded-full text-[12px] font-medium hover:bg-white/20 transition-colors">{session.name ?? session.phone}</Link>
            ) : (
              <Link href="/auth" className="px-4 py-1.5 bg-white/15 rounded-full text-[12px] font-semibold hover:bg-white/25 transition-colors">Войти</Link>
            )}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-white/60"><MapPin size={14} className="text-white/40" /><span>Худжанд, Таджикистан</span></div>
        </div>
      </header>
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="mb-6"><h1 className="text-[26px] font-black text-black tracking-tight leading-tight mb-1">Что вам нужно<br/>доставить?</h1><p className="text-[14px] text-black/45">Выберите сервис и оформите заказ</p></div>
        <div className="space-y-3 mb-7">
          <Link href="/marketplace" className="block group">
            <div className="bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="bg-[#1a472a] px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/80 mb-3"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"/>Открыто</div>
                    <h2 className="text-[20px] font-black text-white leading-tight">Фрукты и<br/>сухофрукты</h2>
                  </div>
                  <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mt-1"><ShoppingBag size={26} className="text-white"/></div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-[13px] text-black/50 mb-3">Свежие фрукты, орехи и сухофрукты от лучших магазинов города</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px] text-black/40"><div className="flex items-center gap-1"><Clock size={12}/><span>30–60 мин</span></div><span>от 10 сом. доставка</span></div>
                  <div className="w-8 h-8 bg-[#1a472a] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><ChevronRight size={16} className="text-white"/></div>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/courier-service" className="block group">
            <div className="bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="bg-[#854F0B] px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/80 mb-3"><div className="w-1.5 h-1.5 bg-amber-400 rounded-full"/>24/7</div>
                    <h2 className="text-[20px] font-black text-white leading-tight">Отправить<br/>посылку</h2>
                  </div>
                  <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mt-1"><Package size={26} className="text-white"/></div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-[13px] text-black/50 mb-3">Документы, подарки, посылки — быстрая доставка по городу</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px] text-black/40"><div className="flex items-center gap-1"><Clock size={12}/><span>20–40 мин</span></div><span>20 сом. фиксировано</span></div>
                  <div className="w-8 h-8 bg-[#854F0B] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><ChevronRight size={16} className="text-white"/></div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t border-black/8 flex flex-wrap gap-2 justify-center">
          {[{href:"/store",label:"Я — магазин"},{href:"/courier",label:"Я — курьер"},{href:"/admin",label:"Оператор"}].map(l=>(
            <Link key={l.href} href={l.href} className="text-[12px] text-black/35 hover:text-black transition-colors px-3 py-1.5 border border-black/10 rounded-full hover:border-black/25">{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
