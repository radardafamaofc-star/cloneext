import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode } from "lucide-react";

export default function Renew() {
  const { toast } = useToast();
  const [panel, setPanel] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const formatBRL = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const num = (parseInt(digits, 10) / 100).toFixed(2);
    return num.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panel.trim()) {
      toast({ title: "Informe o painel", description: "Cole o link ou o nome do seu painel.", variant: "destructive" });
      return;
    }
    if (!amount.trim()) {
      toast({ title: "Informe o valor", description: "Digite o valor da renovação.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // TODO: integrar com Mistic Pay no final
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Em breve", description: "A integração com Mistic Pay será adicionada no final." });
    }, 800);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Renove seu painel</h1>
          <p className="text-muted-foreground mt-2 text-sm">Pagamento via Pix · rápido e seguro</p>
        </header>

        <form
          onSubmit={handleGenerate}
          className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6 space-y-5 shadow-xl"
        >
          <div className="space-y-2">
            <Label htmlFor="panel">Coloque aqui o link ou o nome do seu painel</Label>
            <Input
              id="panel"
              value={panel}
              onChange={(e) => setPanel(e.target.value)}
              placeholder="ex: meupainel.com ou Painel X"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
              <Input
                id="amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatBRL(e.target.value))}
                placeholder="0,00"
                className="h-11 pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 text-base">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Gerar Pix QRCode
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Pagamentos processados por Mistic Pay
        </p>
      </div>
    </main>
  );
}
