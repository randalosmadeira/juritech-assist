import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Deadline {
  id: string;
  numero_processo: string;
  descricao: string;
  data_vencimento: string;
  dias_restantes: number;
  prioridade: string;
}

interface DeadlinesListProps {
  deadlines: Deadline[];
  loading?: boolean;
}

export const DeadlinesList = ({ deadlines, loading }: DeadlinesListProps) => {
  const navigate = useNavigate();

  const getPriorityVariant = (dias: number) => {
    if (dias <= 3) return "destructive";
    if (dias <= 7) return "default";
    return "outline";
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-xl font-serif">Prazos Críticos</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/calendario")}>
          Ver Calendário
        </Button>
      </div>
      <CardContent className="space-y-4 p-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : deadlines.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum prazo crítico no momento
          </p>
        ) : (
          deadlines.map((deadline) => (
            <div 
              key={deadline.id}
              className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow bg-background/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-mono text-sm font-medium text-foreground mb-1">
                    {deadline.numero_processo}
                  </p>
                  <p className="text-sm text-muted-foreground">{deadline.descricao}</p>
                </div>
                <Badge 
                  variant={getPriorityVariant(deadline.dias_restantes)}
                  className="ml-2"
                >
                  {deadline.dias_restantes <= 0 
                    ? 'VENCIDO' 
                    : `${deadline.dias_restantes} dias`}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Vence: {new Date(deadline.data_vencimento).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
