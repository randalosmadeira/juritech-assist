import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Play, Pause, Trash2, Calendar, CheckCircle, XCircle, AlertCircle, TrendingUp, Activity, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  description: string;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused';
  function: string;
}

interface ExecutionLog {
  id: string;
  action: string;
  status: string;
  created_at: string;
  details?: any;
  error_message?: string;
}

interface PublicacoesPorDia {
  data: string;
  total: number;
}

interface TaxaSucesso {
  status: string;
  total: number;
}

interface Estatisticas {
  totalPublicacoes: number;
  publicacoesComPrazo: number;
  totalPrazosAbertos: number;
  taxaSucesso: number;
}

const AdminAgendamentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [publicacoesPorDia, setPublicacoesPorDia] = useState<PublicacoesPorDia[]>([]);
  const [taxaSucesso, setTaxaSucesso] = useState<TaxaSucesso[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalPublicacoes: 0,
    publicacoesComPrazo: 0,
    totalPrazosAbertos: 0,
    taxaSucesso: 0,
  });
  
  // Agendamentos configurados (hardcoded pois pg_cron não tem API direta)
  const cronJobs: CronJob[] = [
    {
      id: 'sync-easyjur-publicacoes-diario',
      name: 'Sincronização Diária EasyJur',
      schedule: '0 6 * * *',
      description: 'Sincroniza publicações do EasyJur automaticamente todos os dias às 6h da manhã, buscando publicações dos últimos 7 dias.',
      status: 'active',
      function: 'easyjur-sync-publicacoes'
    }
  ];

  useEffect(() => {
    loadLogs();
    loadEstatisticas();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('easyjur_auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const loadEstatisticas = async () => {
    try {
      // Publicações por dia (últimos 7 dias)
      const { data: pubData, error: pubError } = await supabase
        .from('publicacoes')
        .select('data_publicacao')
        .gte('data_publicacao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('data_publicacao', { ascending: true });

      if (pubError) throw pubError;

      // Agrupar por dia
      const publicacoesPorDiaMap = (pubData || []).reduce((acc: Record<string, number>, pub) => {
        const data = pub.data_publicacao;
        acc[data] = (acc[data] || 0) + 1;
        return acc;
      }, {});

      const publicacoesPorDiaArray = Object.entries(publicacoesPorDiaMap).map(([data, total]) => ({
        data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: total as number,
      }));

      setPublicacoesPorDia(publicacoesPorDiaArray);

      // Taxa de sucesso dos logs
      const { data: logsData, error: logsError } = await supabase
        .from('easyjur_auth_logs')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (logsError) throw logsError;

      const taxaSucessoMap = (logsData || []).reduce((acc: Record<string, number>, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {});

      const taxaSucessoArray = Object.entries(taxaSucessoMap).map(([status, total]) => ({
        status: status === 'success' ? 'Sucesso' : status === 'error' ? 'Erro' : 'Outros',
        total: total as number,
      }));

      setTaxaSucesso(taxaSucessoArray);

      // Estatísticas gerais
      const { count: totalPubs } = await supabase
        .from('publicacoes')
        .select('*', { count: 'exact', head: true });

      const { count: pubsComPrazo } = await supabase
        .from('publicacoes')
        .select('*', { count: 'exact', head: true })
        .eq('tem_prazo', true);

      const { count: prazosAbertos } = await supabase
        .from('prazos_processuais')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto');

      const totalSuccess = taxaSucessoMap['success'] || 0;
      const totalTotal = Object.values(taxaSucessoMap).reduce((a: number, b: number) => a + b, 0);
      const taxaSucessoPercentual = totalTotal > 0 ? (totalSuccess / totalTotal) * 100 : 0;

      setEstatisticas({
        totalPublicacoes: totalPubs || 0,
        publicacoesComPrazo: pubsComPrazo || 0,
        totalPrazosAbertos: prazosAbertos || 0,
        taxaSucesso: Math.round(taxaSucessoPercentual),
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('easyjur-sync-publicacoes', {
        body: { 
          data_inicial: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        }
      });

      if (error) throw error;

      toast({
        title: "Sincronização Iniciada",
        description: "A sincronização manual foi executada com sucesso.",
      });
      
      // Recarregar logs e estatísticas após sincronização
      setTimeout(() => {
        loadLogs();
        loadEstatisticas();
      }, 2000);
    } catch (error) {
      console.error('Erro ao executar sincronização:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar a sincronização manual.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScheduleDescription = (cron: string) => {
    const descriptions: Record<string, string> = {
      '0 6 * * *': 'Diariamente às 6:00',
      '0 */6 * * *': 'A cada 6 horas',
      '*/30 * * * *': 'A cada 30 minutos',
    };
    return descriptions[cron] || cron;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-serif font-bold mb-2">Administração de Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie sincronizações automáticas e visualize logs de execução</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Publicações</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalPublicacoes}</div>
              <p className="text-xs text-muted-foreground">
                {estatisticas.publicacoesComPrazo} com prazo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prazos Abertos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.totalPrazosAbertos}</div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.taxaSucesso}%</div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizações</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">
                Últimas execuções
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicações por Dia</CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={publicacoesPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="data" 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Sucesso</CardTitle>
              <CardDescription>Distribuição por status (últimos 30 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taxaSucesso}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="total"
                  >
                    {taxaSucesso.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.status === 'Sucesso' 
                            ? 'hsl(var(--primary))' 
                            : entry.status === 'Erro'
                            ? 'hsl(var(--destructive))'
                            : 'hsl(var(--muted))'
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {cronJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                  </div>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status === 'active' ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Agendamento:</span>
                    <span className="text-muted-foreground">{getScheduleDescription(job.schedule)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleManualSync}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Executar Agora
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Função: <code className="bg-secondary px-1 py-0.5 rounded">{job.function}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logs de Execução</CardTitle>
            <CardDescription>Últimas 20 execuções de sincronização</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum log disponível ainda
                  </p>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/20 transition-colors"
                    >
                      <div className="mt-1">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{log.action}</span>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-destructive mt-1">
                            {log.error_message}
                          </p>
                        )}
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Ver detalhes
                            </summary>
                            <pre className="text-xs bg-secondary/50 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAgendamentos;
