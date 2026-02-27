import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: [api.whatsapp.status.path],
    queryFn: async () => {
      const res = await fetch(api.whatsapp.status.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch WhatsApp status");
      
      const data = await res.json();
      const parsed = api.whatsapp.status.responses[200].safeParse(data);
      
      if (!parsed.success) {
        console.error("[Zod] whatsapp.status validation failed:", parsed.error.format());
        throw parsed.error;
      }
      return parsed.data;
    },
    // Poll every 3 seconds to check for QR code updates or connection changes
    refetchInterval: 3000,
  });
}

export function useRestartWhatsApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.whatsapp.restart.path, {
        method: api.whatsapp.restart.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to restart WhatsApp instance");
      
      const data = await res.json();
      return api.whatsapp.restart.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.whatsapp.status.path] });
      toast({
        title: "WhatsApp Restarted",
        description: "The bot instance is restarting and generating a new session.",
      });
    },
    onError: (error) => {
      toast({
        title: "Restart Failed",
        description: error instanceof Error ? error.message : "Failed to restart",
        variant: "destructive",
      });
    }
  });
}
