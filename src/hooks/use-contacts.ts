import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Contact {
  id: number;
  phone_number: string;
  name: string;
  created_at: string;
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as Contact[];
    },
  });
}

export function useImportContacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (phones: { phone_number: string; name: string }[]) => {
      // Get existing contacts
      const { data: existing } = await supabase
        .from("contacts" as any)
        .select("phone_number");

      const existingSet = new Set((existing as any[] || []).map((c: any) => c.phone_number));
      const newContacts = phones.filter((p) => !existingSet.has(p.phone_number));

      if (newContacts.length === 0) {
        return { imported: 0, skipped: phones.length };
      }

      // Insert in batches of 100
      let imported = 0;
      for (let i = 0; i < newContacts.length; i += 100) {
        const batch = newContacts.slice(i, i + 100);
        const { error } = await supabase
          .from("contacts" as any)
          .insert(batch as any);
        if (error) throw new Error(error.message);
        imported += batch.length;
      }

      return { imported, skipped: phones.length - newContacts.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Importação concluída",
        description: `${result.imported} novos contatos salvos, ${result.skipped} já existentes ignorados.`,
      });
    },
    onError: (error) => {
      toast({ title: "Erro na importação", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("contacts" as any)
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contato removido" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
