import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, ShieldCheck, Zap, Lock } from "lucide-react";

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
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Em breve", description: "A integração com Mistic Pay será adicionada no final." });
    }, 800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 [background-size:32px_32px]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.04) 1px, transparent 0)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Pagamento instantâneo via Pix
            </div>
          </div>

          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Renove seu{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                painel
              </span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Renovação rápida, segura e sem complicação
            </p>
          </header>

          <form
            onSubmit={handleGenerate}
            className="relative rounded-2xl border border-border bg-card/60 p-7 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="panel" className="text-sm font-medium">
                  Link ou nome do painel
                </Label>
                <Input
                  id="panel"
                  value={panel}
                  onChange={(e) => setPanel(e.target.value)}
                  placeholder="ex: meupainel.com ou Painel X"
                  className="h-12 rounded-xl border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Valor
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="amount"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(formatBRL(e.target.value))}
                    placeholder="0,00"
                    className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-lg font-semibold tracking-tight text-foreground placeholder:font-normal placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group relative h-12 w-full overflow-hidden rounded-xl text-base font-semibold text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-5 w-5" />
                    Gerar Pix QR Code
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Criptografado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>Instantâneo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>100% seguro</span>
              </div>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pagamentos processados por{" "}
            <span className="font-medium text-foreground/80">Mistic Pay</span>
          </p>
        </div>
      </div>
    </main>
  );
}
