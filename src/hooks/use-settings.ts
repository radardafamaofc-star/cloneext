import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BotSettings {
  id: number;
  system_prompt: string;
  groq_api_key: string;
  is_active: boolean;
  company_name: string;
  owner_name: string;
  products: string;
  pix_key: string;
  custom_commands: string;
}

// Map snake_case DB columns to camelCase for the UI
function mapSettings(row: any): BotSettings & {
  systemPrompt: string;
  groqApiKey: string;
  isActive: boolean;
  companyName: string;
  ownerName: string;
  pixKey: string;
  customCommands: string;
} {
  return {
    ...row,
    systemPrompt: row.system_prompt ?? "",
    groqApiKey: row.groq_api_key ?? "",
    isActive: row.is_active ?? false,
    companyName: row.company_name ?? "",
    ownerName: row.owner_name ?? "",
    products: row.products ?? "",
    pixKey: row.pix_key ?? "",
    customCommands: row.custom_commands ?? "",
  };
}

export function useSettings() {
  return useQuery({
    queryKey: ["bot_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw new Error(error.message);
      return mapSettings(data);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      // Convert camelCase keys to snake_case for DB
      const dbUpdates: Record<string, any> = {};
      const keyMap: Record<string, string> = {
        systemPrompt: "system_prompt",
        groqApiKey: "groq_api_key",
        isActive: "is_active",
        companyName: "company_name",
        ownerName: "owner_name",
        pixKey: "pix_key",
        customCommands: "custom_commands",
        products: "products",
      };

      for (const [key, value] of Object.entries(updates)) {
        const dbKey = keyMap[key] || key;
        dbUpdates[dbKey] = value;
      }

      const { data, error } = await supabase
        .from("bot_settings")
        .update(dbUpdates)
        .eq("id", 1)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_settings"] });
      toast({
        title: "Configurações Salvas",
        description: "As configurações do bot foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    },
  });
}
