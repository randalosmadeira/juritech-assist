import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertTriangle, TrendingUp, Bell, CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { EasyJurConnectionStatus } from "@/components/EasyJurConnectionStatus";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { PublicationsChart } from "@/components/dashboard/PublicationsChart";
import { DeadlinesList } from "@/components/dashboard/DeadlinesList";
import { CriticalAlerts } from "@/components/dashboard/CriticalAlerts";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    publicacoesHoje: 0,
    prazosAbertos: 0,
    auditoriasPendentes: 0,
    processosAtivos: 0,
  });
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentPublications, setRecentPublications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Métricas principais
      const hoje = new Date().toISOString().split('T')[0];
      
      // Publicações hoje
      const { count: pubHoje } = await supabase
        .from('publicacoes')
        .select('*', { count: 'exact', head: true })
        .eq('data_publicacao', hoje);

      // Prazos abertos
      const { count: prazosCount } = await supabase
        .from('prazos_processuais')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto');

      // Auditorias pendentes
      const { count: auditoriasCount } = await supabase
        .from('auditorias')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberta');

      // Processos ativos
      const { count: processosCount } = await supabase
        .from('processos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      setMetrics({
        publicacoesHoje: pubHoje || 0,
        prazosAbertos: prazosCount || 0,
        auditoriasPendentes: auditoriasCount || 0,
        processosAtivos: processosCount || 0,
      });

      // Publicações últimos 7 dias para gráfico
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
      
      const { data: pubData } = await supabase
        .from('publicacoes')
        .select('data_publicacao')
        .gte('data_publicacao', seteDiasAtras.toISOString().split('T')[0])
        .order('data_publicacao', { ascending: true });

      // Agrupar por data
      const grouped = (pubData || []).reduce((acc: any, pub) => {
        const date = new Date(pub.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      setChartData(Object.entries(grouped).map(([date, count]) => ({ date, count: count as number })));

      // Prazos críticos (próximos 15 dias)
      const { data: prazosData } = await supabase
        .from('prazos_processuais')
        .select('*')
        .eq('status', 'aberto')
        .lte('dias_restantes', 15)
        .order('dias_restantes', { ascending: true })
        .limit(5);

      setDeadlines(prazosData || []);

      // Alertas críticos
      const { data: alertsData } = await supabase
        .from('auditorias')
        .select('*')
        .eq('status', 'aberta')
        .in('prioridade', ['urgente', 'alta'])
        .order('data_identificacao', { ascending: false })
        .limit(5);

      setAlerts(alertsData || []);

      // Publicações recentes
      const { data: recentPubs } = await supabase
        .from('publicacoes')
        .select('*')
        .order('data_publicacao', { ascending: false })
        .limit(5);

      setRecentPublications(recentPubs || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: "Publicações Hoje", 
      value: metrics.publicacoesHoje, 
      icon: FileText, 
      trend: "Hoje", 
      color: "text-primary",
      loading 
    },
    { 
      label: "Prazos Abertos", 
      value: metrics.prazosAbertos, 
      icon: Clock, 
      trend: `${deadlines.filter(d => d.dias_restantes <= 7).length} críticos`, 
      color: "text-accent",
      loading 
    },
    { 
      label: "Alertas Pendentes", 
      value: metrics.auditoriasPendentes, 
      icon: AlertTriangle, 
      trend: `${alerts.length} críticos`, 
      color: "text-destructive",
      loading 
    },
    { 
      label: "Processos Ativos", 
      value: metrics.processosAtivos, 
      icon: TrendingUp, 
      trend: "Total ativo", 
      color: "text-primary",
      loading 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary mb-1">
                RDM Advogados Associados
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Automação Jurídica</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium">Administrador</p>
                <p className="text-xs text-muted-foreground">Último acesso: Hoje, 08:45</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <MetricsCards metrics={stats} />

        {/* Gráfico de Publicações */}
        <div className="mt-8">
          <PublicationsChart data={chartData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Publicações Recentes */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Publicações Recentes
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentPublications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma publicação recente
                </p>
              ) : (
                recentPublications.map((pub) => (
                  <div 
                    key={pub.id} 
                    className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow bg-background/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-mono text-sm font-medium text-foreground mb-1">
                          {pub.numero_processo}
                        </p>
                        <p className="text-sm text-muted-foreground">{pub.tipo_publicacao} • {pub.tribunal}</p>
                      </div>
                      <Badge 
                        variant={pub.status === "lida" ? "default" : pub.status === "notificada" ? "secondary" : "outline"}
                        className="ml-2"
                      >
                        {pub.status === "lida" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                         pub.status === "notificada" ? <Bell className="h-3 w-3 mr-1" /> : 
                         <Clock className="h-3 w-3 mr-1" />}
                        {pub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(pub.data_publicacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Prazos Próximos */}
          <DeadlinesList deadlines={deadlines} loading={loading} />

          {/* Alertas Críticos */}
          <CriticalAlerts alerts={alerts} loading={loading} />

          {/* Conexão EasyJur */}
          <EasyJurConnectionStatus />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
