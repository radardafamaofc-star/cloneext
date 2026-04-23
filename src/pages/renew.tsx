import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, ShieldCheck, Zap, Lock, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PixData = {
  transactionId: string;
  qrCodeBase64: string;
  copyPaste: string;
  transactionAmount: number;
};

export default function Renew() {
  const { toast } = useToast();
  const [panel, setPanel] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  const formatBRL = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const num = (parseInt(digits, 10) / 100).toFixed(2);
    return num.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseAmount = (formatted: string) => {
    const digits = formatted.replace(/\D/g, "");
    return digits ? parseInt(digits, 10) / 100 : 0;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseAmount(amount);
    if (!panel.trim()) {
      toast({ title: "Informe o painel", description: "Cole o link ou o nome do seu painel.", variant: "destructive" });
      return;
    }
    if (numericAmount < 1) {
      toast({ title: "Valor inválido", description: "Valor mínimo de R$ 1,00.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("misticpay-create", {
        body: { amount: numericAmount, panel: panel.trim() },
      });
      if (error) throw error;
      if (!data?.data) throw new Error("Resposta inválida");
      setPix(data.data as PixData);
    } catch (err: any) {
      toast({
        title: "Erro ao gerar PIX",
        description: err?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Polling status
  useEffect(() => {
    if (!pix || paid) return;
    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke("misticpay-check", {
          body: { transactionId: pix.transactionId },
        });
        if (data?.transaction?.transactionState === "COMPLETO") {
          setPaid(true);
          toast({ title: "Pagamento confirmado!", description: "Sua renovação foi processada." });
        }
      } catch {
        /* silencioso */
      }
    };
    pollRef.current = window.setInterval(check, 4000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [pix, paid, toast]);

  const handleCopy = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPix(null);
    setPaid(false);
    setAmount("");
    setPanel("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 [background-size:32px_32px]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100% / 0.04) 1px, transparent 0)" }}
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
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                painel
              </span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Renovação rápida, segura e sem complicação
            </p>
          </header>

          {!pix ? (
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
                    className="h-12 rounded-xl border-border bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">Valor</Label>
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
                      className="h-12 rounded-xl border-border bg-secondary/50 pl-11 text-lg font-semibold tracking-tight"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative h-12 w-full overflow-hidden rounded-xl text-base font-semibold text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando QR Code...</>
                  ) : (
                    <><QrCode className="mr-2 h-5 w-5" />Gerar Pix QR Code</>
                  )}
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /><span>Criptografado</span></div>
                <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /><span>Instantâneo</span></div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /><span>100% seguro</span></div>
              </div>
            </form>
          ) : (
            <div
              className="relative rounded-2xl border border-border bg-card/60 p-7 backdrop-blur-xl"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {paid ? (
                <div className="flex flex-col items-center text-center py-6">
                  <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Pagamento confirmado!</h2>
                  <p className="text-sm text-muted-foreground mb-6">Sua renovação foi processada com sucesso.</p>
                  <Button onClick={reset} className="rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                    Nova renovação
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      <ArrowLeft className="h-3 w-3" /> Voltar
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Aguardando pagamento...
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-4 mb-4 flex items-center justify-center">
                    <img src={pix.qrCodeBase64} alt="QR Code Pix" className="w-full max-w-[260px]" />
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold">
                      R$ {(pix.transactionAmount / 100).toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <Label className="text-xs">Pix Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={pix.copyPaste} className="h-11 rounded-xl bg-secondary/50 text-xs" />
                      <Button
                        type="button"
                        onClick={handleCopy}
                        variant="secondary"
                        className="h-11 rounded-xl px-3"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando pagamento automaticamente
                  </div>
                </>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Pagamentos processados por <span className="font-medium text-foreground/80">Mistic Pay</span>
          </p>
        </div>
      </div>
    </main>
  );
}
