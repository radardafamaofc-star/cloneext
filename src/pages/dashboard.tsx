import { useWhatsAppStatus, useRestartWhatsApp, useDisconnectWhatsApp } from "@/hooks/use-whatsapp";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";

export default function Dashboard() {
  const { data: status, isLoading } = useWhatsAppStatus();
  const restartMutation = useRestartWhatsApp();
  const disconnectMutation = useDisconnectWhatsApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["bot_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("is_active")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const toggleBot = useMutation({
    mutationFn: async (active: boolean) => {
      const { error } = await supabase
        .from("bot_settings")
        .update({ is_active: active })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_settings"] });
      toast({ title: "Bot atualizado" });
    },
  });

  const isConnected = status?.status === "connected";
  const isQR = status?.status === "qr" && status.qrCode;
  const isConnecting = status?.status === "connecting";
  const botActive = settings?.is_active ?? false;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Painel</h1>
        <p className="text-muted-foreground mt-1">Gerencie o status do seu assistente de vendas.</p>
      </div>

      {/* Bot Status */}
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        {isLoading ? (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        ) : isQR ? (
          <>
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QRCodeSVG value={status.qrCode!} size={240} level="H" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">Escaneie o QR Code</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Abra o WhatsApp no celular → Aparelhos conectados → Escanear código.
              </p>
            </div>
          </>
        ) : isConnected ? (
          <>
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {botActive ? "Bot Ativo" : "Bot Inativo"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {botActive ? "Respondendo mensagens automaticamente" : "O bot está pausado"}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-muted-foreground">Bot Automático</span>
              <Switch
                checked={botActive}
                onCheckedChange={(v) => toggleBot.mutate(v)}
                disabled={toggleBot.isPending}
              />
            </div>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              {isConnecting ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <XCircle className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {isConnecting ? "Conectando..." : "Desconectado"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isConnecting
                  ? "Aguarde enquanto preparamos a conexão."
                  : "Clique em Reconectar para iniciar."}
              </p>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => restartMutation.mutate()}
            disabled={restartMutation.isPending}
            className="gap-2"
          >
            {restartMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Reconectar
          </Button>
          {isConnected && (
            <Button
              variant="destructive"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="gap-2"
            >
              <Unplug className="h-4 w-4" />
              Desconectar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
