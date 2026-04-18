import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ notifications: [], unread: 0 });
  const notifications = await prisma.notification.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({ notifications, unread: notifications.filter((n: any) => !n.isRead).length })
}
export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false });
  await prisma.notification.updateMany({ where: { userId: session.id, isRead: false }, data: { isRead: true } });
  return NextResponse.json({ ok: true });
}
