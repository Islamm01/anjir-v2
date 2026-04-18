"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Loader2, CheckCircle } from "lucide-react";
type Step = "phone"|"otp"|"name";
export default function AuthPage() {
  const router = useRouter();
  const [step,setStep]             = useState<Step>("phone");
  const [phone,setPhone]           = useState("");
  const [otp,setOtp]               = useState(["","","","","",""]);
  const [name,setName]             = useState("");
  const [error,setError]           = useState("");
  const [isPending,startTransition]= useTransition();
  const refs = useRef<(HTMLInputElement|null)[]>([]);
  useEffect(()=>{ if(step==="otp") setTimeout(()=>refs.current[0]?.focus(),100); },[step]);
  function norm(raw:string) { const d=raw.replace(/\D/g,""); return d.startsWith("992")?`+${d}`:d.startsWith("0")?`+992${d.slice(1)}`:`+992${d}`; }
  async function sendOtp(e:React.FormEvent){ e.preventDefault(); setError("");
    const p=norm(phone); if(p.length<12){setError("Введите корректный номер");return;}
    startTransition(async()=>{ const r=await fetch("/api/auth/send-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:p})}); const d=await r.json(); if(d.error){setError(d.error);return;} setPhone(p); setStep("otp"); });
  }
  function onOtp(i:number,v:string){ if(!/^\d*$/.test(v))return; const n=[...otp]; n[i]=v.slice(-1); setOtp(n); if(v&&i<5)refs.current[i+1]?.focus(); if(n.every(d=>d!==""))verify(n.join("")); }
  function onKey(i:number,e:React.KeyboardEvent){ if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus(); }
  async function verify(code:string){ setError("");
    startTransition(async()=>{ const r=await fetch("/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,code})}); const d=await r.json(); if(d.error){setError(d.error);setOtp(["","","","","",""]);refs.current[0]?.focus();return;} if(d.isNew){setStep("name");return;} router.push(d.redirect??"/"); });
  }
  async function setNameFn(e:React.FormEvent){ e.preventDefault(); if(name.trim().length<2){setError("Введите имя");return;}
    startTransition(async()=>{ const r=await fetch("/api/auth/set-name",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim()})}); const d=await r.json(); if(d.error){setError(d.error);return;} router.push(d.redirect??"/"); });
  }
  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col">
      <div className="bg-[#1a472a] px-5 pt-12 pb-8 text-white">
        <div className="max-w-sm mx-auto">
          {step!=="phone"&&<button onClick={()=>{setStep("phone");setOtp(["","","","","",""]);setError("");}} className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors text-[14px]"><ArrowLeft size={16}/>Назад</button>}
          <div className="flex items-center gap-2.5 mb-5"><div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center font-black">A</div><span className="text-[20px] font-black">anjir</span></div>
          <h1 className="text-[24px] font-black leading-tight">{step==="phone"?"Войти или зарегистрироваться":step==="otp"?"Введите код из SMS":"Как вас зовут?"}</h1>
          <p className="text-[13px] text-white/55 mt-1.5">{step==="phone"?"Введите номер — мы пришлём код":step==="otp"?`Код отправлен на ${phone}`:"Это имя увидят магазины и курьеры"}</p>
        </div>
      </div>
      <div className="flex-1 max-w-sm mx-auto w-full px-5 py-8">
        {step==="phone"&&(<form onSubmit={sendOtp} className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/8 flex items-center gap-3 px-4 py-4"><Phone size={18} className="text-black/30 shrink-0"/>
            <div className="flex items-center gap-1.5 flex-1"><span className="text-black/40 font-medium">+992</span><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="93 123 45 67" autoFocus className="flex-1 outline-none text-black font-medium placeholder:text-black/25 bg-transparent text-[15px]"/></div>
          </div>
          {error&&<p className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>}
          <button type="submit" disabled={isPending||!phone} className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{isPending&&<Loader2 size={18} className="animate-spin"/>}{isPending?"Отправляем...":"Получить код"}</button>
        </form>)}
        {step==="otp"&&(<div className="space-y-6">
          <div className="flex gap-2.5 justify-center">{otp.map((d,i)=>(<input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e=>onOtp(i,e.target.value)} onKeyDown={e=>onKey(i,e)} className={`w-12 h-14 text-center text-[22px] font-black rounded-xl border-2 outline-none transition-colors bg-white ${d?"border-[#1a472a] text-[#1a472a]":"border-black/15 text-black"} focus:border-[#1a472a]`}/>))}</div>
          {isPending&&<div className="flex items-center justify-center gap-2 text-[13px] text-black/45"><Loader2 size={14} className="animate-spin"/>Проверяем…</div>}
          {error&&<p className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 text-center">{error}</p>}
          <button onClick={()=>{setStep("phone");setOtp(["","","","","",""]);}} className="w-full text-[13px] text-black/40 hover:text-black transition-colors py-2">Изменить номер</button>
          {process.env.NODE_ENV==="development"&&<div className="text-center text-[11px] text-black/25 bg-black/4 rounded-xl py-3">DEV: введите любые 6 цифр</div>}
        </div>)}
        {step==="name"&&(<form onSubmit={setNameFn} className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/8 px-4 py-4"><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Акбар Рахимов" autoFocus className="w-full text-[16px] font-medium text-black placeholder:text-black/25 outline-none bg-transparent"/></div>
          {error&&<p className="text-[13px] text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>}
          <button type="submit" disabled={isPending||name.trim().length<2} className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{isPending?<Loader2 size={18} className="animate-spin"/>:<CheckCircle size={18}/>}{isPending?"Сохраняем...":"Начать пользоваться"}</button>
        </form>)}
      </div>
    </div>
  );
}
