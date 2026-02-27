import { MessageSquare, Users, Zap, Clock } from "lucide-react";
import StatCard from "@/components/StatCard";
import RecentConversations from "@/components/RecentConversations";
import QuickActions from "@/components/QuickActions";

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu robô de atendimento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Mensagens Hoje" value="1.284" change="+12%" positive />
        <StatCard icon={Users} label="Contatos Ativos" value="348" change="+5%" positive />
        <StatCard icon={Zap} label="Automações" value="24" />
        <StatCard icon={Clock} label="Tempo Médio" value="1.8min" change="-8%" positive />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentConversations />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
