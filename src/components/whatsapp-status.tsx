import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWhatsAppStatus, useRestartWhatsApp } from "@/hooks/use-whatsapp";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function WhatsAppStatus() {
  const { data: status, isLoading } = useWhatsAppStatus();
  const restartMutation = useRestartWhatsApp();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
            </div>
            <div>
              <CardTitle>Conexão WhatsApp</CardTitle>
              <CardDescription>Gerencie a conexão do bot com o WhatsApp</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : status?.status === 'connected' ? (
              <div className="h-2 w-2 rounded-full bg-green-500" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
            )}
            {isLoading ? 'Carregando...' : status?.status === 'connected' ? 'Conectado' : 'Desconectado'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        {status?.status === 'qr' && status.qrCode ? (
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <QRCodeSVG value={status.qrCode} size={256} level="H" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Escaneie o código QR</p>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Abra o WhatsApp no seu celular, toque em Aparelhos conectados e escaneie o código acima.
              </p>
            </div>
          </div>
        ) : status?.status === 'connected' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">WhatsApp Conectado!</h3>
              <p className="text-muted-foreground">O bot está pronto para responder mensagens.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
              {status?.status === 'connecting' ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <XCircle className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">
                {status?.status === 'connecting' ? 'Gerando QR Code...' : 'Desconectado'}
              </h3>
              <p className="text-muted-foreground">
                {status?.status === 'connecting' 
                  ? 'Aguarde um momento enquanto preparamos a conexão.' 
                  : 'Clique no botão abaixo para iniciar uma nova conexão.'}
              </p>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          className="mt-8 gap-2"
          onClick={() => restartMutation.mutate()}
          disabled={restartMutation.isPending}
        >
          {restartMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {status?.status === 'connected' ? 'Reconectar' : 'Iniciar Conexão'}
        </Button>
      </CardContent>
    </Card>
  );
}
