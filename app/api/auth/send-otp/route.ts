import { NextRequest, NextResponse } from "next/server";
import { generateOtp, saveOtp, sendSms } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone || phone.length < 10) return NextResponse.json({ error: "Некорректный номер" }, { status: 400 });
  const code = generateOtp();
  await saveOtp(phone, code);
  await sendSms(phone, code);
  const user = await prisma.user.findUnique({ where: { phone } });
  return NextResponse.json({ ok: true, isNew: !user });
}
