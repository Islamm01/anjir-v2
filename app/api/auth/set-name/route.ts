import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const session  = await getSession();
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  if (!name || name.trim().length < 2) return NextResponse.json({ error: "Имя слишком короткое" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: session.id }, data: { name: name.trim() } });
  await createSession({ ...session, name: user.name });
  const redirectMap: Record<string,string> = { STORE_OWNER:"/store", COURIER:"/courier", ADMIN:"/admin", OPERATOR:"/admin" };
  return NextResponse.json({ ok: true, redirect: redirectMap[session.role] ?? "/" });
}
