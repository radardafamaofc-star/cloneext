import { useState } from 'react';
import { Copy, Trash2, Ban, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { LicenseKey } from '@/lib/keys';
import { revokeKey, deleteKey } from '@/lib/keys';
import { cn } from '@/lib/utils';

interface KeyTableProps {
  keys: LicenseKey[];
  onRefresh: () => void;
}

const typeBadge: Record<LicenseKey['type'], string> = {
  trial: 'bg-primary/5 text-primary border border-primary/20',
  pro: 'bg-primary/10 text-primary border border-primary/25',
  lifetime: 'bg-primary/15 text-primary border border-primary/30',
};

const statusDot: Record<LicenseKey['status'], string> = {
  active: 'bg-green-500',
  expired: 'bg-yellow-500',
  revoked: 'bg-red-400',
};

export default function KeyTable({ keys, onRefresh }: KeyTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('Key copiada!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id: string) => {
    revokeKey(id);
    toast.warning('Key revogada');
    onRefresh();
  };

  const handleDelete = (id: string) => {
    deleteKey(id);
    toast.error('Key deletada');
    onRefresh();
  };

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Ban className="w-7 h-7" />
        </div>
        <p className="text-sm">Nenhuma key gerada ainda</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-left">
            <th className="pb-3 pl-4 font-medium">Status</th>
            <th className="pb-3 font-medium">Label</th>
            <th className="pb-3 font-medium">Key</th>
            <th className="pb-3 font-medium">Tipo</th>
            <th className="pb-3 font-medium">Expira</th>
            <th className="pb-3 pr-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr
              key={k.id}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="py-3 pl-4">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', statusDot[k.status])} />
                  <span className="capitalize text-xs text-muted-foreground">{k.status}</span>
                </div>
              </td>
              <td className="py-3 font-medium text-foreground">{k.label}</td>
              <td className="py-3">
                <code className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded">
                  {k.key.slice(0, 20)}…
                </code>
              </td>
              <td className="py-3">
                <span className={cn('text-xs px-2 py-0.5 rounded-full', typeBadge[k.type])}>
                  {k.type}
                </span>
              </td>
              <td className="py-3 text-xs text-muted-foreground">
                {k.expiresAt
                  ? new Date(k.expiresAt).toLocaleDateString('pt-BR')
                  : '∞'}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleCopy(k.key, k.id)}
                    className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copiar key"
                  >
                    {copiedId === k.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {k.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="Revogar"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
