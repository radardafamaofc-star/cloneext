import { Power, RefreshCw, Download, PlusCircle } from "lucide-react";

const actions = [
  { icon: Power, label: "Reiniciar Bot", color: "text-primary" },
  { icon: PlusCircle, label: "Novo Fluxo", color: "text-accent-foreground" },
  { icon: Download, label: "Exportar Dados", color: "text-accent-foreground" },
  { icon: RefreshCw, label: "Sincronizar", color: "text-accent-foreground" },
];

export default function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm">Ações Rápidas</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-border/50"
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
