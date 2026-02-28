import { useState } from "react";
import { useShortcuts, useCreateShortcut, useUpdateShortcut, useDeleteShortcut, BotShortcut } from "@/hooks/use-shortcuts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, MessageSquare, Zap } from "lucide-react";

function ShortcutForm({ initial, onSave, isPending }: {
  initial?: { question: string; answer: string };
  onSave: (data: { question: string; answer: string }) => void;
  isPending: boolean;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Pergunta do cliente</label>
        <Input
          placeholder='Ex: "Qual o prazo de entrega?"'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Resposta do bot</label>
        <Textarea
          placeholder="Ex: Entregamos em até 3 dias úteis para todo o Brasil!"
          className="min-h-[100px]"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button
          disabled={isPending || !question.trim() || !answer.trim()}
          onClick={() => onSave({ question: question.trim(), answer: answer.trim() })}
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ShortcutCard({ shortcut }: { shortcut: BotShortcut }) {
  const { mutate: update, isPending: isUpdating } = useUpdateShortcut();
  const { mutate: remove, isPending: isDeleting } = useDeleteShortcut();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-sm truncate">{shortcut.question}</span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">{shortcut.answer}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Switch
              checked={shortcut.is_active}
              onCheckedChange={(checked) => update({ id: shortcut.id, is_active: checked })}
              disabled={isUpdating}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end border-t border-border/30 pt-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5 mr-1" /> Editar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Atalho</DialogTitle>
              </DialogHeader>
              <ShortcutForm
                initial={{ question: shortcut.question, answer: shortcut.answer }}
                isPending={isUpdating}
                onSave={(data) => {
                  update({ id: shortcut.id, ...data }, { onSuccess: () => setEditOpen(false) });
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={isDeleting}
            onClick={() => remove(shortcut.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Shortcuts() {
  const { data: shortcuts, isLoading } = useShortcuts();
  const { mutate: create, isPending } = useCreateShortcut();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Atalhos de Respostas</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Atalhos de Respostas</h1>
          <p className="text-muted-foreground mt-1">Perguntas frequentes com respostas prontas para o bot.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Novo Atalho
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Atalho</DialogTitle>
            </DialogHeader>
            <ShortcutForm
              isPending={isPending}
              onSave={(data) => {
                create(data, { onSuccess: () => setCreateOpen(false) });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {shortcuts && shortcuts.length > 0 ? (
        <div className="grid gap-4">
          {shortcuts.map((s) => (
            <ShortcutCard key={s.id} shortcut={s} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Zap className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">Nenhum atalho criado</h3>
            <p className="text-muted-foreground text-sm mt-1">Adicione perguntas frequentes para o bot responder automaticamente.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
