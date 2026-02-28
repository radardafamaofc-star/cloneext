import { supabase } from "./db";

export interface BotSettings {
  id: number;
  systemPrompt: string;
  groqApiKey: string;
  isActive: boolean;
  companyName: string;
  ownerName: string;
  products: string;
  pixKey: string;
  customCommands: string;
}

export interface ChatLog {
  id: number;
  phoneNumber: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface IStorage {
  getSettings(): Promise<BotSettings>;
  updateSettings(settings: Partial<BotSettings>): Promise<BotSettings>;
  getLogs(): Promise<ChatLog[]>;
  addLog(log: { phoneNumber: string; message: string; response: string }): Promise<ChatLog>;
}

function mapSettings(row: any): BotSettings {
  return {
    id: row.id,
    systemPrompt: row.system_prompt || '',
    groqApiKey: row.groq_api_key || '',
    isActive: row.is_active ?? false,
    companyName: row.company_name || '',
    ownerName: row.owner_name || '',
    products: row.products || '',
    pixKey: row.pix_key || '',
    customCommands: row.custom_commands || '',
  };
}

function mapLog(row: any): ChatLog {
  return {
    id: row.id,
    phoneNumber: row.phone_number,
    message: row.message,
    response: row.response,
    createdAt: row.created_at,
  };
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<BotSettings> {
    const { data, error } = await supabase
      .from('bot_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error || !data) {
      return {
        id: 1, systemPrompt: '', groqApiKey: '', isActive: false,
        companyName: '', ownerName: '', products: '', pixKey: '', customCommands: '',
      };
    }
    return mapSettings(data);
  }

  async updateSettings(updates: Partial<BotSettings>): Promise<BotSettings> {
    const dbUpdates: any = {};
    if (updates.systemPrompt !== undefined) dbUpdates.system_prompt = updates.systemPrompt;
    if (updates.groqApiKey !== undefined) dbUpdates.groq_api_key = updates.groqApiKey;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
    if (updates.ownerName !== undefined) dbUpdates.owner_name = updates.ownerName;
    if (updates.products !== undefined) dbUpdates.products = updates.products;
    if (updates.pixKey !== undefined) dbUpdates.pix_key = updates.pixKey;
    if (updates.customCommands !== undefined) dbUpdates.custom_commands = updates.customCommands;

    const { data, error } = await supabase
      .from('bot_settings')
      .update(dbUpdates)
      .eq('id', 1)
      .select()
      .single();

    if (error || !data) return this.getSettings();
    return mapSettings(data);
  }

  async getLogs(): Promise<ChatLog[]> {
    const { data } = await supabase
      .from('chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    return (data || []).map(mapLog);
  }

  async addLog(log: { phoneNumber: string; message: string; response: string }): Promise<ChatLog> {
    const { data } = await supabase
      .from('chat_logs')
      .insert({ phone_number: log.phoneNumber, message: log.message, response: log.response })
      .select()
      .single();
    
    return data ? mapLog(data) : { id: 0, ...log, createdAt: new Date().toISOString() };
  }
}

export const storage = new DatabaseStorage();
