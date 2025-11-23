import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Workflow, FileText, Calendar, Mail, MessageSquare, Shield, Clock, AlertTriangle, BarChart3 } from "lucide-react";

const Architecture = () => {
  const modules = [
    {
      id: 1,
      name: "Autenticação EasyJur",
      icon: Shield,
      description: "Sistema de login seguro e manutenção de sessão no EasyJur",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Armazenamento seguro de credenciais",
        "Gestão de sessão e tokens",
        "Suporte para API oficial (quando disponível)",
        "Fallback para automação via navegador (RPA)"
      ]
    },
    {
      id: 2,
      name: "Leitura de Publicações",
      icon: FileText,
      description: "Captura automática de publicações e intimações diárias",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Leitura diária de publicações",
        "Identificação de processos e partes",
        "Extração de metadados (tribunal, vara, tipo de ato)",
        "Registro em banco de dados"
      ]
    },
    {
      id: 3,
      name: "Cálculo de Prazos",
      icon: Clock,
      description: "Cálculo automático de prazos processuais (CPC, CPP, CLT)",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Suporte para prazos cíveis (CPC)",
        "Suporte para prazos penais (CPP)",
        "Suporte para prazos trabalhistas (CLT)",
        "Integração com calendário de feriados",
        "Cadastro automático no EasyJur"
      ]
    },
    {
      id: 4,
      name: "Workflow & Auditorias",
      icon: Workflow,
      description: "Gestão de tarefas, auditorias e controles internos",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Criação automática de tarefas",
        "Sistema de auditorias D+1 para divergências",
        "Rastreamento de operações automatizadas",
        "Painel de pendências administrativas"
      ]
    },
    {
      id: 5,
      name: "Gestão Financeira",
      icon: BarChart3,
      description: "Controle de honorários, boletos e pendências financeiras",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Verificação de honorários a receber",
        "Alertas de boletos vencendo",
        "Controle de parcelas de acordos",
        "Relatórios financeiros automáticos"
      ]
    },
    {
      id: 6,
      name: "Agenda & Prazos",
      icon: Calendar,
      description: "Gestão de audiências, compromissos e prazos em aberto",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Dashboard de prazos vencendo",
        "Alertas de audiências próximas",
        "Sincronização com EasyJur",
        "Relatórios de compromissos"
      ]
    },
    {
      id: 7,
      name: "Detecção de Duplicidades",
      icon: AlertTriangle,
      description: "Identificação e prevenção de publicações duplicadas",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Algoritmo de similaridade",
        "Prevenção de notificações duplicadas",
        "Sistema de idempotência",
        "Auditoria de duplicatas"
      ]
    },
    {
      id: 8,
      name: "Integração ConversApp",
      icon: MessageSquare,
      description: "Envio automático de notificações aos clientes via WhatsApp",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Mensagens formatadas e personalizadas",
        "Saudações contextuais por horário",
        "Resumos em linguagem acessível",
        "Confirmação de entrega"
      ]
    },
    {
      id: 9,
      name: "Integração E-mail",
      icon: Mail,
      description: "Gestão de e-mails corporativos (cPanel/Outlook)",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Envio de notificações automáticas",
        "Leitura e classificação de respostas",
        "Templates padronizados",
        "Suporte IMAP/SMTP e Microsoft 365"
      ]
    },
    {
      id: 10,
      name: "Banco de Dados",
      icon: Database,
      description: "Estrutura de dados para armazenamento centralizado",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Tabelas de publicações e intimações",
        "Registro de prazos processuais",
        "Sistema de auditorias e tarefas",
        "Logs de automação e relatórios"
      ]
    },
    {
      id: 11,
      name: "Agendador de Jobs",
      icon: Server,
      description: "Execução automática de rotinas diárias",
      status: "Aguardando Implementação",
      variant: "outline" as const,
      details: [
        "Rotina principal: 07h-09h",
        "Verificações a cada 30min: 09h-19h",
        "Janela de atendimento configurável",
        "Sistema de filas e workers"
      ]
    }
  ];

  const securityFeatures = [
    "Armazenamento seguro de credenciais com variáveis de ambiente",
    "Conformidade com LGPD e Estatuto da OAB",
    "Trilha de auditoria completa de todas as operações",
    "Criptografia de dados sensíveis",
    "Sistema de logs com retenção configurável",
    "Prevenção de vazamento de dados em ambientes de teste"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-serif font-bold text-primary">
            Arquitetura do Sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão técnica detalhada dos módulos e integrações
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Visão Geral */}
        <Card className="p-8 mb-8 bg-gradient-primary text-primary-foreground border-0 shadow-elegant">
          <h2 className="text-2xl font-serif font-bold mb-4">Visão Geral</h2>
          <p className="text-primary-foreground/90 leading-relaxed mb-4">
            Sistema de automação jurídica desenvolvido para otimizar rotinas administrativas do escritório 
            RDM Advogados Associados, integrando-se ao EasyJur, ConversApp e e-mail corporativo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <p className="text-3xl font-bold mb-1">11</p>
              <p className="text-sm text-primary-foreground/80">Módulos Principais</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <p className="text-3xl font-bold mb-1">3</p>
              <p className="text-sm text-primary-foreground/80">Integrações Externas</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <p className="text-3xl font-bold mb-1">24/7</p>
              <p className="text-sm text-primary-foreground/80">Monitoramento Automático</p>
            </div>
          </div>
        </Card>

        {/* Módulos do Sistema */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold text-primary mb-6">Módulos do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card 
                key={module.id} 
                className="p-6 bg-card border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-foreground mb-1">{module.name}</h3>
                    <Badge variant={module.variant}>{module.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                <div className="space-y-2">
                  {module.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <p className="text-xs text-muted-foreground flex-1">{detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Segurança e Compliance */}
        <Card className="p-8 bg-card border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary">Segurança e Compliance</h2>
              <p className="text-sm text-muted-foreground">
                Proteção de dados e conformidade legal
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-sm text-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Stack Tecnológica Sugerida */}
        <Card className="p-8 mt-8 bg-card border-border">
          <h2 className="text-2xl font-serif font-bold text-primary mb-6">Stack Tecnológica Sugerida</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Backend</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Node.js + TypeScript</p>
                  <p className="text-xs text-muted-foreground">Runtime e linguagem principal</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Supabase (PostgreSQL)</p>
                  <p className="text-xs text-muted-foreground">Banco de dados relacional</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Edge Functions</p>
                  <p className="text-xs text-muted-foreground">Lógica serverless</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Automação & Integrações</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Playwright / Puppeteer</p>
                  <p className="text-xs text-muted-foreground">Automação de navegador (RPA)</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Axios / Fetch</p>
                  <p className="text-xs text-muted-foreground">Cliente HTTP para APIs</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm font-medium text-foreground">Node-cron / BullMQ</p>
                  <p className="text-xs text-muted-foreground">Agendamento de tarefas</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Architecture;
