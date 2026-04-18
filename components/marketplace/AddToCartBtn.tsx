"use client";
import { useState } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";

interface Props {
  productId: string; productName: string; price: number;
  unit: string; storeId: string; storeName: string; storeSlug: string;
}

export default function AddToCartBtn({ productId, productName, price, unit, storeId, storeName, storeSlug }: Props) {
  const { addItem, updateQty, items, storeId: cartStoreId } = useCart();
  const [flash, setFlash] = useState(false);
  const inCart = items.find(i => i.productId === productId);

  function handleAdd() {
    if (cartStoreId && cartStoreId !== storeId) {
      if (!confirm(`В корзине товары из другого магазина. Очистить и добавить из "${storeName}"?`)) return;
      localStorage.setItem("anjir_cart_v2", "[]");
      window.dispatchEvent(new CustomEvent("anjir:cart"));
    }
    addItem({ productId, productName, price, unit, storeId, storeName, storeSlug });
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }

  if (inCart) {
    return (
      <div className="flex items-center gap-1 bg-[#1a472a] rounded-xl overflow-hidden shrink-0">
        <button onClick={() => updateQty(productId, inCart.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg font-black">−</button>
        <span className="text-[13px] font-black text-white min-w-[20px] text-center">{inCart.quantity}</span>
        <button onClick={handleAdd} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 transition-colors"><Plus size={14} /></button>
      </div>
    );
  }

  return (
    <button onClick={handleAdd} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${flash ? "bg-green-500 scale-95" : "bg-[#1a472a]/10 hover:bg-[#1a472a] hover:text-white text-[#1a472a]"}`}>
      {flash ? <Check size={16} className="text-white" /> : <Plus size={16} />}
    </button>
  );
}
