import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Clock, ShoppingCart } from "lucide-react";
import prisma from "@/lib/prisma";
import AddToCartBtn from "@/components/marketplace/AddToCartBtn";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  FRUITS: "Фрукты", DRIED_FRUITS: "Сухофрукты", NUTS: "Орехи",
  VEGETABLES: "Овощи", HERBS: "Зелень", OTHER: "Другое",
};

export default async function StoreDetailPage({ params }: { params: { storeSlug: string } }) {
  const store = await prisma.store.findUnique({
    where: { slug: params.storeSlug, isActive: true },
    include: { products: { where: { isAvailable: true }, orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }] } },
  });
  if (!store) notFound();

  const byCat = store.products.reduce<Record<string, typeof store.products>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="bg-white border-b border-black/5 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/marketplace" className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"><ArrowLeft size={16} /></Link>
          <h1 className="text-[15px] font-black flex-1 truncate">{store.name}</h1>
          <Link href="/marketplace/cart" className="relative w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"><ShoppingCart size={16} /></Link>
        </div>
      </div>

      <div className="h-36 bg-[#1a472a]/15 relative">
        {store.bannerUrl && <Image src={store.bannerUrl} alt={store.name} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <div className="w-13 h-13 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border border-white/50 w-14 h-14">
            {store.logoUrl ? <Image src={store.logoUrl} alt={store.name} width={56} height={56} className="object-cover" /> : <span className="text-2xl">🏪</span>}
          </div>
          <div className="text-white pb-1">
            <h2 className="text-[18px] font-black leading-none">{store.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-white/70">
              {Number(store.rating) > 0 && <div className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" />{Number(store.rating).toFixed(1)}</div>}
              <div className="flex items-center gap-1"><Clock size={10} />{store.avgPrepMins}–{store.avgPrepMins + 20} мин</div>
              <div className={store.isOpen ? "text-green-300" : "text-red-300"}>{store.isOpen ? "Открыто" : "Закрыто"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-6">
        {Object.entries(byCat).map(([cat, products]) => (
          <div key={cat}>
            <h3 className="text-[12px] font-black text-black/40 uppercase tracking-widest mb-3">{CAT_LABEL[cat] ?? cat}</h3>
            <div className="space-y-2">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl border border-black/5 flex items-center gap-3 p-3">
                  <div className="w-16 h-16 bg-[#f7f5f0] rounded-xl overflow-hidden shrink-0">
                    {product.imageUrl ? <Image src={product.imageUrl} alt={product.nameRu} width={64} height={64} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍎</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-black truncate">{product.nameRu}</p>
                    {product.description && <p className="text-[11px] text-black/40 mt-0.5 line-clamp-1">{product.description}</p>}
                    <p className="text-[15px] font-black text-[#1a472a] mt-1">
                      {Number(product.price).toFixed(2)} сом.
                      <span className="text-[11px] font-normal text-black/35 ml-1">/ {product.unit}</span>
                    </p>
                  </div>
                  <AddToCartBtn productId={product.id} productName={product.nameRu} price={Number(product.price)} unit={product.unit} storeId={store.id} storeName={store.name} storeSlug={store.slug} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {store.products.length === 0 && <div className="text-center py-16"><p className="text-[15px] text-black/25">В магазине пока нет товаров</p></div>}
      </div>
    </div>
  );
}
