import { Key, ShieldCheck, ShieldOff, Infinity } from 'lucide-react';
import type { LicenseKey } from '@/lib/keys';

interface Props {
  keys: LicenseKey[];
}

export default function StatsCards({ keys }: Props) {
  const total = keys.length;
  const active = keys.filter((k) => k.status === 'active').length;
  const revoked = keys.filter((k) => k.status === 'revoked').length;
  const lifetime = keys.filter((k) => k.type === 'lifetime').length;

  const stats = [
    { label: 'Total Keys', value: total, icon: Key, color: 'text-foreground' },
    { label: 'Ativas', value: active, icon: ShieldCheck, color: 'text-green-400' },
    { label: 'Revogadas', value: revoked, icon: ShieldOff, color: 'text-red-400' },
    { label: 'Lifetime', value: lifetime, icon: Infinity, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
