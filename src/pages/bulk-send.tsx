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
import { Send, Users, Search, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const handleSend = async () => {
    if (selected.size === 0 || !message.trim()) return;
    setSending(true);

    const selectedContacts = contacts?.filter((c) => selected.has(c.id)) || [];

    // Store each as a scheduled message with status "pending" for the external bot to pick up
    const rows = selectedContacts.map((c) => ({
      phone_number: c.phone_number,
      message: message.trim(),
      scheduled_at: new Date().toISOString(),
      status: "pending",
    }));

    const { error } = await supabase.from("scheduled_messages").insert(rows);

    setSending(false);

    if (error) {
      toast({ title: "Erro ao enfileirar mensagens", variant: "destructive" });
    } else {
      toast({
        title: `${selectedContacts.length} mensagem(ns) enfileirada(s)`,
        description: "As mensagens serão enviadas pelo bot automaticamente.",
      });
      setSelected(new Set());
      setMessage("");
    }
  };

  const allSelected = filtered && filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display flex items-center gap-2">
          <Send className="h-6 w-6 text-primary" />
          Envio em Massa
        </h1>
        <p className="text-muted-foreground mt-1">
          Selecione contatos e envie uma mensagem para todos de uma vez
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Contact list */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Contatos</CardTitle>
              <Badge variant="secondary">
                {selected.size} selecionado(s)
              </Badge>
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
              <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
            ) : !filtered?.length ? (
              <div className="flex flex-col items-center py-8">
                <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum contato encontrado</p>
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
                      <p className="text-xs text-muted-foreground">{c.phone_number}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message composer */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Mensagem</CardTitle>
            <CardDescription>A mesma mensagem será enviada para todos os contatos selecionados.</CardDescription>
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
      </div>
    </div>
  );
}
