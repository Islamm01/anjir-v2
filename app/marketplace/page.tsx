import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, ChevronRight, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import SupportButton from "@/components/shared/SupportButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Фрукты и сухофрукты" };

export default async function MarketplacePage() {
  const stores = await prisma.store.findMany({
    where: { isActive: true, isVerified: true },
    include: { _count: { select: { products: { where: { isAvailable: true } } } } },
    orderBy: [{ rating: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-[#1a472a] text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-5 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-[18px] font-black flex-1">Фрукты и сухофрукты</h1>
            <Link href="/marketplace/cart" className="px-3 py-1.5 bg-white/15 rounded-full text-[12px] font-semibold hover:bg-white/25 transition-colors">
              Корзина
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5">
        {stores.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🏪</div>
            <p className="text-[16px] font-semibold text-black/30">Магазины скоро появятся</p>
            <p className="text-[13px] text-black/20 mt-1">Мы подключаем лучшие магазины Худжанда</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((store: (typeof stores)[number]) => (
              <Link key={store.id} href={`/marketplace/${store.slug}`} className="block group">
                <div className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition-all">
                  <div className="h-28 bg-[#1a472a]/10 relative">
                    {store.bannerUrl && <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />}
                    <div className="absolute bottom-3 left-3 w-11 h-11 bg-white rounded-xl shadow flex items-center justify-center overflow-hidden border border-black/8">
                      {store.logoUrl ? <Image src={store.logoUrl} alt={store.name} width={44} height={44} className="object-cover" /> : <span className="text-xl">🏪</span>}
                    </div>
                    <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${store.isOpen ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"}`}>
                      {store.isOpen ? "Открыто" : "Закрыто"}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-black text-black truncate">{store.name}</h3>
                        {store.description && <p className="text-[12px] text-black/45 mt-0.5 line-clamp-1">{store.description}</p>}
                      </div>
                      <div className="w-8 h-8 bg-[#1a472a]/8 rounded-full flex items-center justify-center ml-3 group-hover:bg-[#1a472a] transition-colors">
                        <ChevronRight size={14} className="text-[#1a472a] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-black/40">
                      {Number(store.rating) > 0 && (
                        <div className="flex items-center gap-1"><Star size={11} className="text-amber-500 fill-amber-500" /><span className="font-semibold text-black/60">{Number(store.rating).toFixed(1)}</span></div>
                      )}
                      <div className="flex items-center gap-1"><Clock size={11} /><span>{store.avgPrepMins}–{store.avgPrepMins + 20} мин</span></div>
                      <span>{store._count.products} товаров</span>
                      <span>10 сом. доставка</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SupportButton />
    </div>
  );
}
