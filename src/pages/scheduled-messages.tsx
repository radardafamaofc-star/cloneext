import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Plus, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ScheduledMessage = {
  id: number;
  phone_number: string;
  message: string;
  scheduled_at: string;
  status: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Pendente", variant: "outline", icon: Clock },
  sent: { label: "Enviado", variant: "default", icon: CheckCircle },
  failed: { label: "Falhou", variant: "destructive", icon: XCircle },
};

export default function ScheduledMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["scheduled-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_messages")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as ScheduledMessage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("scheduled_messages").insert({
        phone_number: phone,
        message,
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
      toast({ title: "Mensagem agendada com sucesso!" });
      setOpen(false);
      setPhone("");
      setMessage("");
      setScheduledAt("");
    },
    onError: () => {
      toast({ title: "Erro ao agendar mensagem", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("scheduled_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
      toast({ title: "Agendamento removido" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("scheduled_messages").delete().neq("id", 0);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
      toast({ title: "Todos os agendamentos removidos" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Mensagens Agendadas
          </h1>
          <p className="text-muted-foreground mt-1">Agende envios automáticos de mensagens</p>
        </div>
        <div className="flex items-center gap-2">
          {messages && messages.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleteAllMutation.isPending ? "Removendo..." : "Remover Todos"}
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Mensagem Agendada</DialogTitle>
              <DialogDescription>Preencha os dados para agendar o envio.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="5511999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite a mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={!phone || !message || !scheduledAt || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Agendando..." : "Agendar Mensagem"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : !messages?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarClock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma mensagem agendada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {messages.map((msg) => {
            const sc = statusConfig[msg.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <Card key={msg.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{msg.phone_number}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={sc.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {sc.label}
                      </Badge>
                      {msg.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(msg.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {format(new Date(msg.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{msg.message}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
