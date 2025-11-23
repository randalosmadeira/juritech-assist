import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
  loading?: boolean;
}

interface MetricsCardsProps {
  metrics: Metric[];
}

export const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className="p-6 bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              {metric.loading ? (
                <div className="h-9 w-16 bg-muted animate-pulse rounded mb-1" />
              ) : (
                <p className="text-3xl font-bold text-foreground mb-1">{metric.value}</p>
              )}
              {metric.trend && (
                <p className={`text-xs font-medium ${metric.color}`}>{metric.trend}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-secondary ${metric.color}`}>
              <metric.icon className="h-6 w-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
