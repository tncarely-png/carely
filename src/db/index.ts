import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type AppDB = DrizzleD1Database<typeof schema>;

export function getDb(d1: D1Database): AppDB {
  return drizzle(d1, { schema });
}
