import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  adsWatchedToday: integer("ads_watched_today").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
});

export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // video, banner, interactive
  category: text("category").notNull(),
  duration: integer("duration").notNull(), // in seconds
  earnings: decimal("earnings", { precision: 10, scale: 2 }).notNull(),
  adsterraCode: text("adsterra_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userAdViews = pgTable("user_ad_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  adId: varchar("ad_id").notNull().references(() => ads.id),
  completed: boolean("completed").notNull().default(false),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).notNull(),
  viewedAt: timestamp("viewed_at").notNull().default(sql`now()`),
});

export const withdrawals = pgTable("withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentDetails: text("payment_details").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  requestedAt: timestamp("requested_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
});

export const insertUserAdViewSchema = createInsertSchema(userAdViews).omit({
  id: true,
  viewedAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  requestedAt: true,
  status: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertUserAdView = z.infer<typeof insertUserAdViewSchema>;
export type UserAdView = typeof userAdViews.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
