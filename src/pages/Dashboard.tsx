import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertTriangle, TrendingUp, Calendar, Bell, CheckCircle2, XCircle } from "lucide-react";

const Dashboard = () => {
  // Mock data - será substituído por dados reais do backend
  const stats = [
    { label: "Publicações Hoje", value: "12", icon: FileText, trend: "+3", color: "text-primary" },
    { label: "Prazos Abertos", value: "28", icon: Clock, trend: "5 vencendo", color: "text-accent" },
    { label: "Auditorias Pendentes", value: "3", icon: AlertTriangle, trend: "D+1", color: "text-destructive" },
    { label: "Processos Ativos", value: "156", icon: TrendingUp, trend: "+8 este mês", color: "text-primary" },
  ];

  const recentPublications = [
    { processo: "0001234-56.2024.8.16.0001", tribunal: "TJMA", tipo: "Intimação", data: "23/11/2025", status: "pendente" },
    { processo: "0007890-12.2024.8.16.0001", tribunal: "TJMA", tipo: "Publicação", data: "23/11/2025", status: "lida" },
    { processo: "0003456-78.2024.8.16.0001", tribunal: "TJMA", tipo: "Sentença", data: "22/11/2025", status: "notificada" },
  ];

  const upcomingDeadlines = [
    { processo: "0001234-56.2024.8.16.0001", acao: "Recurso de Apelação", prazo: "25/11/2025", dias: 2 },
    { processo: "0005678-90.2024.8.16.0001", acao: "Contrarrazões", prazo: "28/11/2025", dias: 5 },
    { processo: "0009012-34.2024.8.16.0001", acao: "Impugnação", prazo: "30/11/2025", dias: 7 },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.color}`}>{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Button variant="outline" size="sm">Ver Todas</Button>
            </div>
            <div className="space-y-4">
              {recentPublications.map((pub, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow bg-background/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium text-foreground mb-1">
                        {pub.processo}
                      </p>
                      <p className="text-sm text-muted-foreground">{pub.tipo} • {pub.tribunal}</p>
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
                      <Calendar className="h-3 w-3" />
                      {pub.data}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Prazos Próximos */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Prazos Próximos
                </h2>
              </div>
              <Button variant="outline" size="sm">Ver Agenda</Button>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-glow bg-background/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium text-foreground mb-1">
                        {deadline.processo}
                      </p>
                      <p className="text-sm text-muted-foreground">{deadline.acao}</p>
                    </div>
                    <Badge 
                      variant={deadline.dias <= 3 ? "destructive" : "outline"}
                      className="ml-2"
                    >
                      {deadline.dias} dias
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Vence: {deadline.prazo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Status do Sistema */}
          <Card className="p-6 bg-card border-border lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground">
                Status do Sistema
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">EasyJur</p>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">Última sincronização: 08:30</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">ConversApp</p>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">12 mensagens enviadas hoje</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">E-mail Corporativo</p>
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-xs text-muted-foreground">Aguardando configuração</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
