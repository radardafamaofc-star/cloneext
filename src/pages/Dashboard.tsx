import { useState, useEffect } from 'react';
import { Plus, Zap, RefreshCw } from 'lucide-react';
import { getKeys, type LicenseKey } from '@/lib/keys';
import StatsCards from '@/components/StatsCards';
import KeyTable from '@/components/KeyTable';
import GenerateKeyDialog from '@/components/GenerateKeyDialog';

export default function Dashboard() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setKeys(getKeys());
  };

  useEffect(() => {
    setTimeout(() => {
      refresh();
      setLoading(false);
    }, 400);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-neon">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Lovable <span className="text-primary text-neon-glow">Infinite</span>
              </h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Painel de Keys</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-neon"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar Key</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            <StatsCards keys={keys} />
            <div className="bg-card border border-border rounded-xl">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Keys Geradas</h2>
                <span className="text-xs text-muted-foreground font-mono">{keys.length} registros</span>
              </div>
              <KeyTable keys={keys} onRefresh={refresh} />
            </div>
          </>
        )}
      </main>

      <GenerateKeyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerated={refresh}
      />
    </div>
  );
}
