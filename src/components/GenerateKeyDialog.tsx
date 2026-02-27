import { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { generateKey, type LicenseKey } from '@/lib/keys';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

const types: { value: LicenseKey['type']; label: string; days: number | null }[] = [
  { value: 'trial', label: 'Trial (7d)', days: 7 },
  { value: 'pro', label: 'Pro (30d)', days: 30 },
  { value: 'lifetime', label: 'Lifetime', days: null },
];

export default function GenerateKeyDialog({ open, onClose, onGenerated }: Props) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<LicenseKey['type']>('pro');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const selectedType = types.find((t) => t.value === type)!;

  const handleGenerate = () => {
    if (!label.trim()) {
      toast.error('Informe um label para a key');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      generateKey(label.trim(), type, selectedType.days);
      toast.success('Key gerada com sucesso!');
      setLabel('');
      setType('pro');
      setLoading(false);
      onGenerated();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-md mx-4 p-6 shadow-neon-lg animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Gerar Nova Key</h2>
            <p className="text-xs text-muted-foreground">Crie uma licença para a extensão</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
            placeholder="Ex: Cliente João"
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo de Licença</label>
          <div className="grid grid-cols-3 gap-2">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={cn(
                  'py-2.5 px-3 rounded-lg border text-xs font-medium transition-all',
                  type === t.value
                    ? 'bg-primary/15 border-primary/40 text-primary shadow-neon'
                    : 'bg-muted/30 border-border text-muted-foreground hover:border-muted-foreground/30'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-neon disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Gerar Key
            </>
          )}
        </button>
      </div>
    </div>
  );
}
