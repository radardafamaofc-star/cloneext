import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  systemPrompt: text("system_prompt").notNull().default("Você é um assistente de vendas útil e amigável."),
  groqApiKey: text("groq_api_key").default(""),
  isActive: boolean("is_active").default(false),
  companyName: text("company_name").default(""),
  ownerName: text("owner_name").default(""),
  products: text("products").default(""),
  pixKey: text("pix_key").default(""),
  customCommands: text("custom_commands").default(""),
});

export const chatLogs = pgTable("chat_logs", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(botSettings).omit({ id: true });
export const insertChatLogSchema = createInsertSchema(chatLogs).omit({ id: true, createdAt: true });

export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateBotSettingsRequest = Partial<InsertBotSettings>;

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = z.infer<typeof insertChatLogSchema>;

export type WhatsAppStatusResponse = {
  status: 'connected' | 'disconnected' | 'qr';
  qrCode?: string;
};
