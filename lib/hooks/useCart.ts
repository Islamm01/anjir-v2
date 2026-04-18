"use client";
import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string; productName: string; price: number;
  unit: string; quantity: number; storeId: string; storeName: string; storeSlug: string;
}
const CART_KEY = "anjir_cart_v2";

function getStored(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { const r = localStorage.getItem(CART_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("anjir:cart"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getStored()); setMounted(true);
    const h = () => setItems(getStored());
    window.addEventListener("anjir:cart", h);
    return () => window.removeEventListener("anjir:cart", h);
  }, []);

  const addItem = useCallback((item: Omit<CartItem,"quantity">) => {
    const cart = getStored();
    const ex   = cart.find(i => i.productId === item.productId);
    const next = ex ? cart.map(i => i.productId === item.productId ? {...i, quantity: i.quantity+1} : i)
                    : [...cart, {...item, quantity: 1}];
    setItems(next); saveCart(next);
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    const cart = getStored();
    const next = qty <= 0 ? cart.filter(i => i.productId !== productId)
                           : cart.map(i => i.productId === productId ? {...i, quantity: qty} : i);
    setItems(next); saveCart(next);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const next = getStored().filter(i => i.productId !== productId);
    setItems(next); saveCart(next);
  }, []);

  const clearCart = useCallback(() => { setItems([]); saveCart([]); }, []);

  const storeId   = items[0]?.storeId   ?? null;
  const storeName = items[0]?.storeName ?? null;
  const storeSlug = items[0]?.storeSlug ?? null;
  const total     = items.reduce((s,i) => s + i.price * i.quantity, 0);
  const count     = items.reduce((s,i) => s + i.quantity, 0);

  return { items, addItem, updateQty, removeItem, clearCart, storeId, storeName, storeSlug, total, count, mounted };
}
