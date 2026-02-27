import { LayoutDashboard, MessageSquare, Users, Settings, Bot, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: MessageSquare, label: "Conversas" },
  { icon: Bot, label: "Fluxos" },
  { icon: Users, label: "Contatos" },
  { icon: Zap, label: "Automações" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 bg-sidebar border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground tracking-tight text-sm">WhatsBot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-accent text-accent-foreground"
                : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-green" />
          <span className="text-xs text-sidebar-foreground">Bot Online</span>
        </div>
      </div>
    </aside>
  );
}
