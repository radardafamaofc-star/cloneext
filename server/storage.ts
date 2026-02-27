import { db } from "./db";
import { botSettings, chatLogs } from "@shared/schema";
import type { BotSettings, InsertBotSettings, UpdateBotSettingsRequest, ChatLog, InsertChatLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getSettings(): Promise<BotSettings>;
  updateSettings(settings: UpdateBotSettingsRequest): Promise<BotSettings>;
  getLogs(): Promise<ChatLog[]>;
  addLog(log: InsertChatLog): Promise<ChatLog>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<BotSettings> {
    const settings = await db.select().from(botSettings).limit(1);
    if (settings.length === 0) {
      const [newSettings] = await db.insert(botSettings).values({}).returning();
      return newSettings;
    }
    return settings[0];
  }

  async updateSettings(updates: UpdateBotSettingsRequest): Promise<BotSettings> {
    const settings = await this.getSettings();
    const [updated] = await db.update(botSettings)
      .set(updates)
      .where(eq(botSettings.id, settings.id))
      .returning();
    return updated;
  }

  async getLogs(): Promise<ChatLog[]> {
    return await db.select().from(chatLogs).orderBy(desc(chatLogs.createdAt)).limit(50);
  }

  async addLog(log: InsertChatLog): Promise<ChatLog> {
    const [newLog] = await db.insert(chatLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();