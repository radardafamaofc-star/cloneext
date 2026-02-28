import { useWhatsAppStatus, useRestartWhatsApp, useDisconnectWhatsApp } from "@/hooks/use-whatsapp";
import { useLogs } from "@/hooks/use-logs";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppStatus } from "@/components/whatsapp-status";
import { ExtensionDownload } from "@/components/extension-download";

export default function Dashboard() {
  const { data: logs, isLoading: logsLoading } = useLogs();

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
      
      <div className="grid gap-6 pt-6 grid-cols-1 lg:grid-cols-2">
        <WhatsAppStatus />
        <ExtensionDownload />
      </div>
      {renderLogs()}
    </div>
  );
}

