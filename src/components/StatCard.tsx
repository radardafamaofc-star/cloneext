import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function StatCard({ icon: Icon, label, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-accent/60 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent-foreground" />
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {change && (
          <span className={cn("ml-2 text-xs font-medium", positive ? "text-primary" : "text-destructive")}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
