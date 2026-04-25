// lib/auth.ts
// Auth strategy:
//   Staff (STORE_OWNER, COURIER, ADMIN, OPERATOR) → username + password
//   Customers → no account needed (guest checkout)
//   Session → signed JWT in httpOnly cookie

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET      = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "anjir-dev-secret-change-in-production-32ch"
);
const COOKIE_NAME = "anjir_session";
const COOKIE_MAX  = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id:       string;
  name:     string | null;
  role:     string;
  username?: string | null;
}

// ── Session management ────────────────────────────────────────────────────────

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
    maxAge:   COOKIE_MAX,
    path:     "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id:       payload.id       as string,
      name:     payload.name     as string | null,
      role:     payload.role     as string,
      username: payload.username as string | null | undefined,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

// ── Role guards ───────────────────────────────────────────────────────────────

export function isAdmin(s: SessionUser | null): boolean {
  return s?.role === "ADMIN" || s?.role === "OPERATOR";
}
export function isStore(s: SessionUser | null): boolean {
  return s?.role === "STORE_OWNER" || isAdmin(s);
}
export function isCourier(s: SessionUser | null): boolean {
  return s?.role === "COURIER" || isAdmin(s);
}
export function isStaff(s: SessionUser | null): boolean {
  return isAdmin(s) || isStore(s) || isCourier(s);
}

// ── Password hashing (PBKDF2, no native bcrypt needed on Vercel) ──────────────

export async function hashPassword(password: string): Promise<string> {
  const salt    = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const key     = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits    = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256
  );
  const hash    = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${saltHex}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [, saltHex, expectedHash] = stored.split(":");
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    const key  = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256
    );
    const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hash === expectedHash;
  } catch {
    return false;
  }
}

// ── Redirect map by role ──────────────────────────────────────────────────────

export const ROLE_REDIRECT: Record<string, string> = {
  STORE_OWNER: "/store",
  COURIER:     "/courier",
  ADMIN:       "/admin",
  OPERATOR:    "/admin",
  CUSTOMER:    "/",
};
