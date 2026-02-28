import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ["whatsapp_status"],
    queryFn: async () => {
      const response = await fetch("/api/whatsapp/status");
      if (!response.ok) throw new Error("Failed to fetch WhatsApp status");
      return response.json();
    },
    refetchInterval: 3000,
  });
}

export function useRestartWhatsApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/whatsapp/restart", { method: "POST" });
      if (!response.ok) throw new Error("Failed to restart WhatsApp");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_status"] });
      toast({
        title: "Reconectando...",
        description: "Aguardando o servidor gerar um novo QR Code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Falha ao Reconectar",
        description: error instanceof Error ? error.message : "Falha ao reconectar",
        variant: "destructive",
      });
    },
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/whatsapp/restart", { method: "POST" }); // For simplicity, restart clears session
      if (!response.ok) throw new Error("Failed to disconnect WhatsApp");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_status"] });
      toast({
        title: "WhatsApp Desconectado",
        description: "O bot foi desconectado do WhatsApp.",
      });
    },
    onError: (error) => {
      toast({
        title: "Falha ao Desconectar",
        description: error instanceof Error ? error.message : "Falha ao desconectar",
        variant: "destructive",
      });
    },
  });
}
