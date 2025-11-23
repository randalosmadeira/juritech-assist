import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

interface Alert {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  categoria: string;
  data_identificacao: string;
  status: string;
}

interface CriticalAlertsProps {
  alerts: Alert[];
  loading?: boolean;
}

export const CriticalAlerts = ({ alerts, loading }: CriticalAlertsProps) => {
  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'text-destructive';
      case 'alta':
        return 'text-orange-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-xl font-serif">Alertas Críticos</CardTitle>
        </div>
        <Badge variant="destructive">{alerts.length}</Badge>
      </div>
      <CardContent className="space-y-4 p-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum alerta crítico
          </p>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 hover:border-destructive/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`h-4 w-4 ${getPriorityColor(alert.prioridade)}`} />
                    <p className="font-semibold text-sm text-foreground">
                      {alert.titulo}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{alert.descricao}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {alert.categoria}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.data_identificacao).toLocaleDateString('pt-BR')}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Visualizar
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
