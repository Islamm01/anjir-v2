// lib/auth.ts — Phone OTP authentication with JWT cookies
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const SECRET      = new TextEncoder().encode(process.env.JWT_SECRET ?? "anjir-dev-secret-32chars-minimum!!");
const COOKIE_NAME = "anjir_session";

export interface SessionUser { id: string; phone: string; name: string | null; role: string; }

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOtp(phone: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpCode.create({ data: { phone, code, expiresAt } });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  // In development accept any 6-digit code
  if (process.env.NODE_ENV === "development") {
    if (/^\d{6}$/.test(code)) return true;
  }
  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return true;
}

export async function findOrCreateUser(phone: string): Promise<SessionUser> {
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) user = await prisma.user.create({ data: { phone, isVerified: true } });
  return { id: user.id, phone: user.phone, name: user.name, role: user.role };
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30,
    path:     "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { id: payload.id as string, phone: payload.phone as string, name: payload.name as string | null, role: payload.role as string };
  } catch { return null; }
}

export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export function isAdmin(s: SessionUser | null): boolean { return s?.role === "ADMIN" || s?.role === "OPERATOR"; }
export function isStore(s: SessionUser | null): boolean { return s?.role === "STORE_OWNER" || isAdmin(s); }
export function isCourier(s: SessionUser | null): boolean { return s?.role === "COURIER" || isAdmin(s); }

export async function sendSms(phone: string, code: string): Promise<void> {
  console.log(`[SMS] Phone: ${phone}  OTP: ${code}`);
  // Production: integrate Eskiz.uz or similar Tajikistan SMS provider here
}
