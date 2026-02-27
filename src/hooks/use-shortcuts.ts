import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BotShortcut {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
}

export function useShortcuts() {
  return useQuery({
    queryKey: ["bot_shortcuts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_shortcuts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as BotShortcut[];
    },
  });
}

export function useCreateShortcut() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shortcut: { question: string; answer: string }) => {
      const { data, error } = await supabase
        .from("bot_shortcuts" as any)
        .insert(shortcut as any)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_shortcuts"] });
      toast({ title: "Atalho criado", description: "O atalho foi adicionado com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateShortcut() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; question?: string; answer?: string; is_active?: boolean }) => {
      const { error } = await supabase
        .from("bot_shortcuts" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_shortcuts"] });
      toast({ title: "Atalho atualizado", description: "O atalho foi salvo com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteShortcut() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("bot_shortcuts" as any)
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_shortcuts"] });
      toast({ title: "Atalho removido", description: "O atalho foi excluído." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
