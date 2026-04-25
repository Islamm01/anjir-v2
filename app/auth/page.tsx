"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";

const SUPPORT_TG = "https://t.me/anjir_support";

export default function AuthPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError(lang === "tj" ? "Логин ва парольро ворид кунед" : "Введите логин и пароль");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      router.push(data.redirect ?? "/");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col">
      <div className="bg-[#1a472a] px-5 pt-12 pb-8 text-white">
        <div className="max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors text-[14px] w-fit">
            <ArrowLeft size={16} />
            {lang === "tj" ? "Ба асосӣ" : "На главную"}
          </Link>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center font-black text-[18px]">A</div>
            <span className="text-[20px] font-black">anjir</span>
          </div>
          <h1 className="text-[24px] font-black leading-tight">
            {lang === "tj" ? "Воридшавии кормандон" : "Вход для сотрудников"}
          </h1>
          <p className="text-[13px] text-white/55 mt-1.5">
            {lang === "tj" ? "Барои дӯконҳо, курьерҳо ва операторон" : "Для магазинов, курьеров и операторов"}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full px-5 py-8 flex flex-col justify-between">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4">
              <User size={18} className="text-black/30 shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
                autoFocus
                autoComplete="username"
                className="flex-1 outline-none text-black font-medium placeholder:text-black/25 bg-transparent text-[15px]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4">
              <Lock size={18} className="text-black/30 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === "tj" ? "Парол" : "Пароль"}
                autoComplete="current-password"
                className="flex-1 outline-none text-black font-medium placeholder:text-black/25 bg-transparent text-[15px]"
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !username || !password}
            className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending
              ? (lang === "tj" ? "Тафтиш мекунем…" : "Проверяем…")
              : (lang === "tj" ? "Ворид шавед" : "Войти")}
          </button>

          <div className="pt-2 text-center space-y-3">
            <p className="text-[12px] text-black/35">
              {lang === "tj"
                ? "Логин ё парол надоред? Бо дастгирӣ тамос гиред:"
                : "Нет логина или пароля? Напишите в поддержку:"}
            </p>
            <a
              href={SUPPORT_TG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#229ED9] text-white text-[13px] font-bold rounded-full hover:bg-[#1a8bc4] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
              </svg>
              {lang === "tj" ? "Дастгирии Anjir" : "Поддержка Anjir"}
            </a>
          </div>
        </form>

        <div className="mt-8 bg-white rounded-2xl border border-black/5 px-4 py-4 text-center">
          <p className="text-[12px] text-black/40 leading-relaxed">
            {lang === "tj"
              ? "Харидор ҳастед? Барои фармоиш додан ворид шудан лозим нест."
              : "Вы покупатель? Регистрация не нужна — оформляйте через «Быстрый заказ»."}
          </p>
          <Link href="/marketplace" className="inline-block mt-3 text-[13px] text-[#1a472a] font-bold hover:underline">
            {lang === "tj" ? "Ба каталог →" : "В каталог →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
