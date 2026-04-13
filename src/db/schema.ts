import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ═══════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").notNull().unique(),
  address: text("address"),
  wilaya: text("wilaya"),
  password: text("password"),
  firebaseUid: text("firebase_uid").unique(),
  role: text("role").notNull().default("customer"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  orders: many(orders),
}));

// ═══════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  emoji: text("emoji").default("📦"),
  imageUrl: text("image_url"),
  price: real("price").notNull().default(0),
  currency: text("currency").default("TND"),
  priceLabel: text("price_label"),
  features: text("features"), // JSON array of feature strings
  landingSections: text("landing_sections"), // JSON — full landing page sections
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),
  route: text("route"), // SPA route to navigate to
  externalUrl: text("external_url"), // External link (optional)
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ═══════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  plan: text("plan").notNull().default("silver"),
  status: text("status").notNull().default("pending"),
  qustodioEmail: text("qustodio_email"),
  qustodioPassword: text("qustodio_password"),
  activationCode: text("activation_code"),
  devicesCount: integer("devices_count").default(5),
  startsAt: text("starts_at"),
  expiresAt: text("expires_at"),
  autoRenew: integer("auto_renew", { mode: "boolean" }).default(false),
  notes: text("notes"),
  licenseId: text("license_id").references(() => licenses.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  license: one(licenses, { fields: [subscriptions.licenseId], references: [licenses.id] }),
  orders: many(orders),
}));

// ═══════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subscriptionId: text("subscription_id").references(() => subscriptions.id),
  plan: text("plan").notNull().default("silver"),
  amountTnd: real("amount_tnd").notNull().default(0),
  paymentMethod: text("payment_method").default("flouci"),
  paymentRef: text("payment_ref"),
  receiptUrl: text("receipt_url"),
  status: text("status").notNull().default("pending"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [orders.subscriptionId], references: [subscriptions.id] }),
}));

// ═══════════════════════════════════════════
// LICENSES
// ═══════════════════════════════════════════
export const licenses = sqliteTable("licenses", {
  id: text("id").primaryKey(),
  qustodioEmail: text("qustodio_email").notNull().unique(),
  qustodioPassword: text("qustodio_password").notNull(),
  plan: text("plan").notNull().default("silver"),
  isAssigned: integer("is_assigned", { mode: "boolean" }).default(false),
  assignedToUser: text("assigned_to_user").references(() => users.id),
  assignedAt: text("assigned_at"),
  expiresAt: text("expires_at"),
  purchasedFrom: text("purchased_from"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const licensesRelations = relations(licenses, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

// ═══════════════════════════════════════════
// WHATSAPP AGENTS
// ═══════════════════════════════════════════
export const whatsappAgents = sqliteTable("whatsapp_agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender"),
  isActive: integer("is_active", { mode: "boolean" }).default(false),
  title: text("title"),
  emoji: text("emoji"),
});

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ═══════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
export type WhatsAppAgent = typeof whatsappAgents.$inferSelect;
export type Setting = typeof settings.$inferSelect;
