import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ["whatsapp_status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_status")
        .select("*")
        .limit(1)
        .single();

      if (error) throw new Error(error.message);

      return {
        status: (data.status as "connected" | "disconnected" | "qr" | "connecting") || "disconnected",
        qrCode: data.qr_code || undefined,
      };
    },
    refetchInterval: 3000,
  });
}

export function useRestartWhatsApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Reset to disconnected - the external server will detect and start a new connection
      const { error } = await supabase
        .from("whatsapp_status")
        .update({ status: "connecting", qr_code: null })
        .eq("id", 1);

      if (error) throw new Error(error.message);
      return { message: "Solicitação de reconexão enviada" };
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
      const { error } = await supabase
        .from("whatsapp_status")
        .update({ status: "disconnected", qr_code: null })
        .eq("id", 1);

      if (error) throw new Error(error.message);
      return { message: "WhatsApp desconectado" };
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
