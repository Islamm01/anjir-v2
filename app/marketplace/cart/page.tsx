"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";

const DELIVERY_FEE = 10;

export default function CartPage() {
  const router = useRouter();
  const { items, updateQty, clearCart, total, count, storeName, mounted } = useCart();

  if (!mounted) return <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1a472a] border-t-transparent rounded-full animate-spin"/></div>;

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center mb-5"><ShoppingBag size={32} className="text-black/25"/></div>
      <h1 className="text-[20px] font-black text-black mb-2">Корзина пуста</h1>
      <p className="text-[14px] text-black/40 mb-6">Добавьте продукты из каталога</p>
      <Link href="/marketplace" className="px-6 py-3 bg-[#1a472a] text-white text-[14px] font-bold rounded-full hover:bg-[#0d2e1a] transition-colors">Перейти в каталог</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"><ArrowLeft size={16}/></button>
          <div className="flex-1"><h1 className="text-[16px] font-black">Корзина</h1><p className="text-[11px] text-black/40">{storeName}</p></div>
          <button onClick={() => { if(confirm("Очистить корзину?")) clearCart(); }} className="text-[12px] text-red-500 hover:text-red-700 transition-colors">Очистить</button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5 space-y-3">
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden divide-y divide-black/5">
          {items.map(item => (
            <div key={item.productId} className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-black truncate">{item.productName}</p>
                <p className="text-[12px] text-black/45 mt-0.5">{item.price.toFixed(2)} сом. / {item.unit}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors">
                  {item.quantity === 1 ? <Trash2 size={12} className="text-red-500"/> : <Minus size={12}/>}
                </button>
                <span className="text-[14px] font-black w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"><Plus size={12}/></button>
              </div>
              <p className="text-[14px] font-black text-[#1a472a] w-20 text-right shrink-0">{(item.price * item.quantity).toFixed(2)} сом.</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 px-4 py-4 space-y-2.5">
          <div className="flex justify-between text-[13px]"><span className="text-black/50">Товары ({count} поз.)</span><span className="font-semibold">{total.toFixed(2)} сом.</span></div>
          <div className="flex justify-between text-[13px]"><span className="text-black/50">Доставка</span><span className="font-semibold">{DELIVERY_FEE} сом.</span></div>
          <div className="pt-2.5 border-t border-black/8 flex justify-between"><span className="text-[15px] font-black">Итого</span><span className="text-[15px] font-black text-[#1a472a]">{(total + DELIVERY_FEE).toFixed(2)} сом.</span></div>
        </div>

        <Link href="/marketplace/checkout" className="flex items-center justify-center gap-2 w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors shadow-[0_4px_20px_rgba(26,71,42,0.25)]">
          Оформить заказ <ArrowRight size={18}/>
        </Link>
        <p className="text-center text-[11px] text-black/30">Наличные, QR или перевод — на выбор</p>
      </div>
    </div>
  );
}
