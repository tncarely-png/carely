/**
 * Single client-safe shape for logged-in users (dashboard, admin, public header).
 * All auth APIs should return this shape (no passwords or internal ids beyond user id).
 */

import type { User } from "@/db/schema";

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  wilaya: string | null;
  role: UserRole;
}

export function normalizeRole(role: string | null | undefined): UserRole {
  return role === "admin" ? "admin" : "customer";
}

/** Map a DB user row (or API payload with same fields) → AuthUser */
export function toAuthUser(row: User | Record<string, unknown>): AuthUser {
  const r = row as User;
  return {
    id: r.id,
    name: r.name,
    email: r.email ?? null,
    phone: r.phone ?? "",
    address: r.address ?? null,
    wilaya: r.wilaya ?? null,
    role: normalizeRole(r.role),
  };
}

/** Validate JSON from `/api/auth/*` before putting in the store */
export function authUserFromResponseJson(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;
  return {
    id: o.id,
    name: o.name,
    email: typeof o.email === "string" ? o.email : null,
    phone: typeof o.phone === "string" ? o.phone : "",
    address: typeof o.address === "string" ? o.address : null,
    wilaya: typeof o.wilaya === "string" ? o.wilaya : null,
    role: normalizeRole(typeof o.role === "string" ? o.role : undefined),
  };
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "admin";
}
