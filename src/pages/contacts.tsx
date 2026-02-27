import { useRef, useState } from "react";
import { useContacts, useImportContacts, useImportFromChatLogs, useDeleteContact, Contact } from "@/hooks/use-contacts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Trash2, Users, FileSpreadsheet, MessageSquare, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function parseCSV(text: string): { phone_number: string; name: string }[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  // Try to detect header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("phone") || firstLine.includes("telefone") || firstLine.includes("nome") || firstLine.includes("name");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
    // If single column, treat as phone number
    if (parts.length === 1) {
      return { phone_number: parts[0], name: "" };
    }
    // Try to figure out which is phone and which is name
    const maybePhone = parts.find((p) => /^\+?\d[\d\s\-()]{7,}$/.test(p));
    const maybeName = parts.find((p) => p !== maybePhone && p.length > 0);
    return {
      phone_number: (maybePhone || parts[0]).replace(/[\s\-()]/g, ""),
      name: maybeName || "",
    };
  }).filter((c) => c.phone_number.length >= 8);
}

export default function Contacts() {
  const { data: contacts, isLoading } = useContacts();
  const { mutate: importContacts, isPending: isImporting } = useImportContacts();
  const { mutate: importFromChat, isPending: isImportingChat } = useImportFromChatLogs();
  const { mutate: deleteContact } = useDeleteContact();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ phone_number: string; name: string }[] | null>(null);

  const exportCSV = () => {
    if (!contacts || contacts.length === 0) return;
    const header = "Telefone,Nome,Data\n";
    const rows = contacts.map((c, i) =>
      `${c.phone_number},"${c.name || `Contato ${i + 1}`}",${new Date(c.created_at).toLocaleDateString("pt-BR")}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contatos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCSV(reader.result as string);
      setPreview(parsed);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = () => {
    if (!preview) return;
    importContacts(preview, { onSuccess: () => setPreview(null) });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight font-display">Contatos</h1>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-foreground">Contatos</h1>
          <p className="text-muted-foreground mt-1">
            Importe contatos via CSV. Apenas números novos serão salvos.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => importFromChat(undefined)}
            disabled={isImportingChat}
            className="shadow-sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {isImportingChat ? "Importando..." : "Importar do Bate-papo"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFile}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="shadow-sm">
            <Upload className="h-4 w-4 mr-2" /> Importar CSV
          </Button>
          {contacts && contacts.length > 0 && (
            <Button variant="outline" onClick={exportCSV} className="shadow-sm">
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Preview before import */}
      {preview && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="font-medium">{preview.length} contatos encontrados no arquivo</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Cancelar</Button>
                <Button size="sm" disabled={isImporting} onClick={handleImport}>
                  {isImporting ? "Importando..." : "Salvar apenas novos"}
                </Button>
              </div>
            </div>
            <div className="max-h-48 overflow-auto rounded border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Nome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 20).map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">{c.phone_number}</TableCell>
                      <TableCell>{c.name || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {preview.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground text-sm">
                        ... e mais {preview.length - 20} contatos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved contacts list */}
      {contacts && contacts.length > 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.phone_number}</TableCell>
                    <TableCell>{c.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteContact(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        !preview && (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-lg">Nenhum contato salvo</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Importe um CSV com números de telefone para começar.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
