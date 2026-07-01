import { eq } from "drizzle-orm";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { getCfContext } from "@/lib/cf-context";
import { users } from "@/db/schema";
import { toAuthUser, type AuthUser } from "@/lib/auth-user";

function clerkDisplayName(clerkUser: ClerkUser): string {
  if (clerkUser.fullName?.trim()) return clerkUser.fullName.trim();
  const first = clerkUser.firstName?.trim();
  const last = clerkUser.lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (email) return email.split("@")[0] ?? "مستخدم";
  return "مستخدم";
}

function clerkPhone(clerkUser: ClerkUser): string {
  const phone = clerkUser.primaryPhoneNumber?.phoneNumber?.trim();
  if (phone) return phone;
  return `clerk-${clerkUser.id}`;
}

export async function findUserByClerkId(clerkUserId: string) {
  const { db } = getCfContext();
  return db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .get();
}

export async function syncClerkUserToD1(
  clerkUser: ClerkUser
): Promise<AuthUser> {
  const { db } = getCfContext();
  const now = new Date().toISOString();
  const clerkUserId = clerkUser.id;
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
  const name = clerkDisplayName(clerkUser);
  const phone = clerkPhone(clerkUser);

  const byClerk = await findUserByClerkId(clerkUserId);
  if (byClerk) {
    await db
      .update(users)
      .set({
        name,
        email: email ?? byClerk.email,
        updatedAt: now,
      })
      .where(eq(users.id, byClerk.id));
    const updated = await db
      .select()
      .from(users)
      .where(eq(users.id, byClerk.id))
      .get();
    return toAuthUser(updated!);
  }

  if (email) {
    const byEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (byEmail) {
      await db
        .update(users)
        .set({
          clerkUserId,
          name,
          updatedAt: now,
        })
        .where(eq(users.id, byEmail.id));
      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, byEmail.id))
        .get();
      return toAuthUser(updated!);
    }
  }

  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    clerkUserId,
    name,
    email,
    phone,
    role: "customer",
    createdAt: now,
    updatedAt: now,
  });

  const created = await db.select().from(users).where(eq(users.id, id)).get();
  return toAuthUser(created!);
}

export async function getAuthUserForClerkSession(
  clerkUserId: string
): Promise<AuthUser | null> {
  const row = await findUserByClerkId(clerkUserId);
  if (!row) return null;
  return toAuthUser(row);
}

export async function assertClerkOwnsD1User(
  clerkUserId: string,
  d1UserId: string
): Promise<boolean> {
  const row = await findUserByClerkId(clerkUserId);
  return row?.id === d1UserId;
}
