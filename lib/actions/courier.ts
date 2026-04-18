"use server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
export async function toggleCourierOnline(isOnline: boolean) {
  const session = await getSession(); if (!session || session.role !== "COURIER") return { error: "Нет доступа" };
  await prisma.courier.update({ where: { userId: session.id }, data: { isOnline } });
  return { success: true };
}
