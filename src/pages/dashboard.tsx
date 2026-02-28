import { useWhatsAppStatus, useRestartWhatsApp, useDisconnectWhatsApp } from "@/hooks/use-whatsapp";
import { useLogs } from "@/hooks/use-logs";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  LogOut,
  Wifi,
  WifiOff,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: statusData, isLoading: statusLoading } = useWhatsAppStatus();
  const { data: logs, isLoading: logsLoading } = useLogs();
  const { mutate: restartWhatsApp, isPending: isRestarting } = useRestartWhatsApp();
  const { mutate: disconnectWhatsApp, isPending: isDisconnecting } = useDisconnectWhatsApp();

  const renderStatusCard = () => {
    if (statusLoading) {
      return <Skeleton className="h-[300px] w-full rounded-xl" />;
    }

    const status = statusData?.status || "disconnected";

    return (
      <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-display">
                <Smartphone className="h-5 w-5 text-primary" />
                Conexão WhatsApp
              </CardTitle>
              <CardDescription className="mt-1.5">
                Gerencie a conexão do bot com o WhatsApp
              </CardDescription>
            </div>
            {status === "connected" && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                <Wifi className="w-3.5 h-3.5 mr-1.5" />
                Conectado
              </Badge>
            )}
            {status === "disconnected" && (
              <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                <WifiOff className="w-3.5 h-3.5 mr-1.5" />
                Desconectado
              </Badge>
            )}
            {status === "qr" && (
              <Badge variant="outline" className="border-ring/30 bg-ring/10 text-foreground">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 subtle-pulse" />
                Aguardando QR Code
              </Badge>
            )}
            {status === "connecting" && (
              <Badge variant="outline" className="border-ring/30 bg-ring/10 text-foreground">
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Conectando...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {status === "qr" && statusData?.qrCode ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Escaneie o QR Code</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione Aparelhos Conectados. Aponte a câmera para esta tela.
                </p>
              </div>
              <div className="p-4 bg-card rounded-2xl shadow-sm border border-border">
                <QRCodeSVG value={statusData.qrCode} size={200} level="H" includeMargin={false} />
              </div>
            </div>
          ) : status === "connected" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Bot Ativo e Funcionando</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Seu assistente de vendas está conectado e respondendo mensagens automaticamente.
              </p>
            </div>
          ) : status === "connecting" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Conectando...</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Aguardando o servidor gerar o QR Code. Certifique-se que o servidor externo está rodando.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Conexão Perdida</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                O bot está desconectado do WhatsApp. Clique em "Reconectar" para solicitar uma nova sessão.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            {status === "connected" ? (
              <Button 
                onClick={() => disconnectWhatsApp()} 
                disabled={isDisconnecting}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <LogOut className={`mr-2 h-4 w-4 ${isDisconnecting ? 'animate-spin' : ''}`} />
                {isDisconnecting ? "Desconectando..." : "Desconectar"}
              </Button>
            ) : (
              <Button 
                onClick={() => restartWhatsApp()} 
                disabled={isRestarting}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
                {isRestarting ? "Reconectando..." : "Reconectar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLogs = () => {
    if (logsLoading) {
      return <Skeleton className="h-[400px] w-full rounded-xl mt-6" />;
    }

    return (
      <Card className="mt-6 border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <MessageSquare className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Últimas conversas gerenciadas pela IA</CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[180px]">Data & Hora</TableHead>
                    <TableHead className="w-[150px]">Telefone</TableHead>
                    <TableHead className="w-[300px]">Mensagem</TableHead>
                    <TableHead>Resposta do Bot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: { id: number; phoneNumber: string; message: string; response: string; createdAt: string | null }) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), "dd/MM, HH:mm") : "Desconhecido"}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.phoneNumber}
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate" title={log.message}>
                        <span className="bg-secondary px-2 py-1 rounded-md text-secondary-foreground inline-block max-w-full truncate">
                          {log.message}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground line-clamp-2" title={log.response}>
                        {log.response}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/10">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Sem registros</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Quando os usuários interagirem com o bot, o histórico aparecerá aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">Monitore o status e atividade do seu assistente de vendas.</p>
      </div>
      
      <div className="grid gap-6 pt-6 md:grid-cols-1">
        {renderStatusCard()}
        {renderLogs()}
      </div>
    </div>
  );
}
