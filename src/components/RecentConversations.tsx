import { cn } from "@/lib/utils";

const conversations = [
  { name: "Maria Silva", message: "Olá, gostaria de saber sobre...", time: "2min", status: "active" },
  { name: "João Santos", message: "Qual o prazo de entrega?", time: "8min", status: "active" },
  { name: "Ana Costa", message: "Obrigada pelo atendimento!", time: "15min", status: "resolved" },
  { name: "Carlos Lima", message: "Preciso de suporte técnico", time: "22min", status: "waiting" },
  { name: "Fernanda Reis", message: "Vocês tem esse produto?", time: "35min", status: "active" },
];

const statusColors: Record<string, string> = {
  active: "bg-primary",
  waiting: "bg-yellow-500",
  resolved: "bg-muted-foreground",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  waiting: "Aguardando",
  resolved: "Resolvido",
};

export default function RecentConversations() {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Conversas Recentes</h3>
        <span className="text-xs text-muted-foreground">Ver todas →</span>
      </div>
      <div className="divide-y divide-border">
        {conversations.map((conv) => (
          <div key={conv.name} className="px-5 py-3.5 flex items-center gap-3 hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground shrink-0">
              {conv.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{conv.name}</span>
                <span className="text-[11px] text-muted-foreground">{conv.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{conv.message}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", statusColors[conv.status])} />
              <span className="text-[10px] text-muted-foreground">{statusLabels[conv.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
