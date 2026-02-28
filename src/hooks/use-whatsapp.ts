import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
<<<<<<< HEAD
=======
import { supabase } from "@/integrations/supabase/client";
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
import { useToast } from "@/hooks/use-toast";

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ["whatsapp_status"],
    queryFn: async () => {
<<<<<<< HEAD
      const response = await fetch("/api/whatsapp/status");
      if (!response.ok) throw new Error("Falha ao buscar status do WhatsApp");
      return response.json();
=======
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
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
    },
    refetchInterval: 3000,
  });
}

export function useRestartWhatsApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
<<<<<<< HEAD
      const response = await fetch("/api/whatsapp/restart", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Falha ao reiniciar WhatsApp");
      return response.json();
=======
      // Reset to disconnected - the external server will detect and start a new connection
      const { error } = await supabase
        .from("whatsapp_status")
        .update({ status: "connecting", qr_code: null })
        .eq("id", 1);

      if (error) throw new Error(error.message);
      return { message: "Solicitação de reconexão enviada" };
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
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
<<<<<<< HEAD
  // Implementation for disconnect if needed, or just reuse restart/logout logic
=======
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
<<<<<<< HEAD
      // For now, using restart as a way to force new session
      const response = await fetch("/api/whatsapp/restart", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Falha ao desconectar");
      return response.json();
=======
      const { error } = await supabase
        .from("whatsapp_status")
        .update({ status: "disconnected", qr_code: null })
        .eq("id", 1);

      if (error) throw new Error(error.message);
      return { message: "WhatsApp desconectado" };
>>>>>>> e3fd1b4d313c26a6313701959086485dcf57776b
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
