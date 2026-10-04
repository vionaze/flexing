import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "flexing_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET belum di-set di .env.local");
  }
  return new TextEncoder().encode(secret);
}

function getAdminHash(): string {
  const hash = process.env.AUTH_ADMIN_HASH;
  if (!hash) {
    throw new Error("AUTH_ADMIN_HASH belum di-set di .env.local");
  }
  return hash;
}

export async function verifyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, getAdminHash());
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getSessionRole()) === "admin";
}

export const sessionCookieName = SESSION_COOKIE;
