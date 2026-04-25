// app/admin/create-user/CreateUserForm.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { createStaffUser } from "@/lib/actions/admin-users";

const ROLES = [
  { value: "STORE_OWNER", label: "Магазин (STORE_OWNER)" },
  { value: "COURIER",     label: "Курьер (COURIER)"     },
  { value: "OPERATOR",    label: "Оператор (OPERATOR)"  },
  { value: "ADMIN",       label: "Администратор (ADMIN)"},
];

export default function CreateUserForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess]        = useState("");
  const [error, setError]            = useState("");
  const [form, setForm]              = useState({
    username: "", password: "", name: "", role: "STORE_OWNER",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    startTransition(async () => {
      const result = await createStaffUser(form);
      if (result.error) { setError(result.error); return; }
      setSuccess(`Пользователь «${form.username}» создан!`);
      setForm({ username: "", password: "", name: "", role: "STORE_OWNER" });
    });
  }

  const field = "w-full border border-black/15 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#1a472a]/40 bg-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 p-5 space-y-4">

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-black/40 block mb-1">
          Имя *
        </label>
        <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
          placeholder="Акбар Рахимов" required className={field} />
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-black/40 block mb-1">
          Роль *
        </label>
        <select value={form.role} onChange={e => set("role", e.target.value)} className={field}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-black/40 block mb-1">
          Логин *
        </label>
        <input type="text" value={form.username} onChange={e => set("username", e.target.value.toLowerCase())}
          placeholder="akbar_store" required className={field} />
        <p className="text-[11px] text-black/30 mt-1">Только латинские буквы, цифры и _</p>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-black/40 block mb-1">
          Пароль *
        </label>
        <input type="text" value={form.password} onChange={e => set("password", e.target.value)}
          placeholder="мин. 6 символов" required minLength={6} className={field} />
        <p className="text-[11px] text-black/30 mt-1">Передайте пользователю лично</p>
      </div>

      {error   && <p className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-[13px] text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
          <CheckCircle size={14} /> {success}
        </div>
      )}

      <button type="submit" disabled={isPending}
        className="w-full py-3 bg-[#1a472a] text-white text-[14px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isPending ? "Создаём…" : "Создать пользователя"}
      </button>
    </form>
  );
}