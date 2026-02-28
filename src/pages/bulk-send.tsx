import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Search, CheckSquare, Upload, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

type Contact = {
  id: number;
  phone_number: string;
  name: string | null;
  created_at: string;
};

export default function BulkSend() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [delay, setDelay] = useState(10); // seconds between each message
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts-bulk"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Contact[];
    },
  });

  const filtered = contacts?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.phone_number.includes(q) ||
      (c.name && c.name.toLowerCase().includes(q))
    );
  });

  const toggleAll = () => {
    if (!filtered) return;
    if (filtered.every((c) => selected.has(c.id))) {
      const next = new Set(selected);
      filtered.forEach((c) => next.delete(c.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((c) => next.add(c.id));
      setSelected(next);
    }
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      // skip header if present
      const start = lines[0]?.toLowerCase().includes("telefone") || lines[0]?.toLowerCase().includes("phone") ? 1 : 0;
      const rows = lines.slice(start).map((line) => {
        const parts = line.split(",");
        const phone = parts[0]?.replace(/["\s]/g, "").trim();
        const name = parts[1]?.replace(/"/g, "").trim() || "";
        return { phone_number: phone, name: name || null };
      }).filter((r) => r.phone_number);

      if (rows.length === 0) {
        toast({ title: "Nenhum contato encontrado no CSV", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("contacts").upsert(
        rows.map((r) => ({ phone_number: r.phone_number, name: r.name })),
        { onConflict: "phone_number" }
      );

      if (error) {
        toast({ title: "Erro ao importar contatos", variant: "destructive" });
      } else {
        toast({ title: `${rows.length} contato(s) importado(s)` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const [clearingQueue, setClearingQueue] = useState(false);

  const handleClearQueue = async () => {
    setClearingQueue(true);
    const { error } = await supabase.from("scheduled_messages").delete().eq("status", "pending");
    setClearingQueue(false);
    if (error) {
      toast({ title: "Erro ao limpar fila", variant: "destructive" });
    } else {
      toast({ title: "Fila de envio limpa com sucesso" });
    }
  };

  const handleSend = async () => {
    if (selected.size === 0 || !message.trim()) return;
    setSending(true);

    const selectedContacts = contacts?.filter((c) => selected.has(c.id)) || [];
    setProgress({ current: 0, total: selectedContacts.length });

    // Schedule each message with incremental delay for safe sending
    const now = new Date();
    const rows = selectedContacts.map((c, i) => ({
      phone_number: c.phone_number,
      message: message.trim(),
      scheduled_at: new Date(now.getTime() + i * delay * 1000).toISOString(),
      status: "pending",
    }));

    const { error } = await supabase.from("scheduled_messages").insert(rows);

    setSending(false);
    setProgress({ current: 0, total: 0 });

    if (error) {
      toast({ title: "Erro ao enfileirar mensagens", variant: "destructive" });
    } else {
      const totalTime = Math.round((selectedContacts.length * delay) / 60);
      toast({
        title: `${selectedContacts.length} mensagem(ns) enfileirada(s)`,
        description: `Intervalo de ${delay}s entre cada envio (~${totalTime} min total).`,
      });
      setSelected(new Set());
      setMessage("");
    }
  };

  const allSelected =
    filtered && filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Envio em Massa
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione contatos e envie uma mensagem para todos de uma vez
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => document.getElementById("csv-import")?.click()} disabled={!contacts}>
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearQueue} disabled={clearingQueue}>
            <Trash2 className="h-4 w-4 mr-1" />
            {clearingQueue ? "Limpando..." : "Limpar Fila"}
          </Button>
        </div>
        <input id="csv-import" type="file" accept=".csv" className="hidden" onChange={importCSV} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Contact list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Contatos</CardTitle>
              <Badge variant="secondary">{selected.size} selecionado(s)</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contato..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                <CheckSquare className="h-4 w-4 mr-1" />
                {allSelected ? "Desmarcar" : "Todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Carregando...
              </p>
            ) : !filtered?.length ? (
              <div className="flex flex-col items-center py-8">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum contato encontrado
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {filtered.map((c, i) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggle(c.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.name || `Contato ${i + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.phone_number}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message composer */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensagem</CardTitle>
              <CardDescription>
                A mesma mensagem será enviada para todos os contatos selecionados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texto da mensagem</Label>
                <Textarea
                  placeholder="Digite a mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                className="w-full"
                disabled={selected.size === 0 || !message.trim() || sending}
                onClick={handleSend}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending
                  ? "Enviando..."
                  : `Enviar para ${selected.size} contato(s)`}
              </Button>
            </CardContent>
          </Card>

          {/* Safe sending config */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Envio Responsável
              </CardTitle>
              <CardDescription className="text-xs">
                Intervalo entre cada mensagem para evitar bloqueio do WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Intervalo</Label>
                <Badge variant="outline" className="font-mono">
                  {delay}s
                </Badge>
              </div>
              <Slider
                value={[delay]}
                onValueChange={([v]) => setDelay(v)}
                min={5}
                max={60}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5s (rápido)</span>
                <span>60s (seguro)</span>
              </div>
              {selected.size > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ⏱ Tempo estimado: ~{Math.ceil((selected.size * delay) / 60)} min
                  para {selected.size} contato(s)
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
