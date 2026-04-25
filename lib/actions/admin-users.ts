// lib/actions/admin-users.ts
"use server";

import prisma         from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function createStaffUser({
  username, password, name, role,
}: {
  username: string;
  password: string;
  name:     string;
  role:     string;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { error: "Нет доступа" };

  if (!username || !password || !name || !role) return { error: "Заполните все поля" };
  if (password.length < 6)   return { error: "Пароль минимум 6 символов" };
  if (!/^[a-z0-9_]+$/.test(username)) return { error: "Логин: только a-z, 0-9, _" };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: `Логин «${username}» уже занят` };

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: { username, passwordHash, name, role: role as any, isVerified: true, isActive: true },
  });

  return { success: true };
}