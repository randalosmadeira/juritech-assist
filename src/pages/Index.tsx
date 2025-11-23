import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Scale, Workflow, Shield, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-8 animate-fade-in">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema de Automação Jurídica</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
            RDM Advogados<br />
            <span className="text-accent">Associados</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Plataforma de automação inteligente para rotinas administrativas, 
            integrando EasyJur, comunicação com clientes e gestão de prazos processuais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 group"
              onClick={() => navigate("/dashboard")}
            >
              Acessar Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/architecture")}
            >
              Ver Arquitetura
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Scale,
              title: "Gestão Jurídica",
              description: "Integração completa com EasyJur para leitura de publicações e gestão de prazos"
            },
            {
              icon: Workflow,
              title: "Automação Inteligente",
              description: "Rotinas diárias automatizadas com cálculo de prazos processuais (CPC, CPP, CLT)"
            },
            {
              icon: Zap,
              title: "Comunicação Ágil",
              description: "Notificações automáticas via WhatsApp e e-mail corporativo aos clientes"
            },
            {
              icon: Shield,
              title: "Segurança & Compliance",
              description: "Conformidade com LGPD, OAB e proteção de dados sensíveis"
            }
          ].map((feature, idx) => (
            <Card 
              key={idx}
              className="p-6 bg-card border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="p-12 bg-gradient-primary text-primary-foreground border-0 shadow-elegant text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Acesse o dashboard para visualizar o status do sistema, publicações recentes 
            e prazos vencendo. Ou explore a arquitetura técnica completa do projeto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => navigate("/dashboard")}
            >
              Acessar Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/architecture")}
            >
              Documentação Técnica
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Index;
