import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, findOrCreateUser, createSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return NextResponse.json({ error: "Данные отсутствуют" }, { status: 400 });
  const valid = await verifyOtp(phone, code);
  if (!valid) return NextResponse.json({ error: "Неверный или устаревший код" }, { status: 400 });
  const user  = await findOrCreateUser(phone);
  const isNew = !user.name;
  if (!isNew) await createSession(user);
  const redirectMap: Record<string,string> = { STORE_OWNER:"/store", COURIER:"/courier", ADMIN:"/admin", OPERATOR:"/admin", CUSTOMER:"/" };
  return NextResponse.json({ ok: true, isNew, redirect: isNew ? null : (redirectMap[user.role] ?? "/") });
}
