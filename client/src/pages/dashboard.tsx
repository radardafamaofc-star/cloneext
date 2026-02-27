import { useWhatsAppStatus, useRestartWhatsApp } from "@/hooks/use-whatsapp";
import { useLogs } from "@/hooks/use-logs";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
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
                WhatsApp Connection
              </CardTitle>
              <CardDescription className="mt-1.5">
                Manage your bot's connection to WhatsApp
              </CardDescription>
            </div>
            {status === "connected" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Connected
              </Badge>
            )}
            {status === "disconnected" && (
              <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Disconnected
              </Badge>
            )}
            {status === "qr" && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 subtle-pulse" />
                Action Required
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {status === "qr" && statusData?.qrCode ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Open WhatsApp on your phone, tap Menu or Settings and select Linked Devices. Point your phone to this screen to capture the code.
                </p>
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-border">
                <QRCodeSVG value={statusData.qrCode} size={200} level="H" includeMargin={false} />
              </div>
            </div>
          ) : status === "connected" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Ready to Assist</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your AI sales assistant is actively listening and responding to messages.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Connection Lost</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The bot is currently disconnected from WhatsApp. Please restart the instance to generate a new login session.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => restartWhatsApp()} 
              disabled={isRestarting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRestarting ? 'animate-spin' : ''}`} />
              {isRestarting ? "Restarting..." : "Restart Session"}
            </Button>
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
            Recent Activity
          </CardTitle>
          <CardDescription>Latest conversations handled by the AI</CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[180px]">Date & Time</TableHead>
                    <TableHead className="w-[150px]">Phone</TableHead>
                    <TableHead className="w-[300px]">User Message</TableHead>
                    <TableHead>Bot Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), "MMM d, h:mm a") : "Unknown"}
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
              <h3 className="text-lg font-medium text-foreground">No logs yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                When users interact with your bot, the conversation history will appear here.
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
        <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your AI sales assistant status and activity.</p>
      </div>
      
      <div className="grid gap-6 pt-6 md:grid-cols-1">
        {renderStatusCard()}
        {renderLogs()}
      </div>
    </div>
  );
}
