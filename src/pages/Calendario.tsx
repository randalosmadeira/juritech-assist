import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Feriado {
  id: string;
  data: string;
  descricao: string;
  tipo: string;
}

interface Prazo {
  id: string;
  data_vencimento: string;
  descricao: string;
  numero_processo: string;
  prioridade: string;
  status: string;
}

interface DayEvent {
  feriados: Feriado[];
  prazos: Prazo[];
}

export default function Calendario() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  // Buscar feriados do mês
  const { data: feriados } = useQuery({
    queryKey: ["feriados-mes", format(mesAtual, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feriados")
        .select("*")
        .gte("data", format(inicioMes, "yyyy-MM-dd"))
        .lte("data", format(fimMes, "yyyy-MM-dd"));
      
      if (error) throw error;
      return data as Feriado[];
    }
  });

  // Buscar prazos do mês
  const { data: prazos } = useQuery({
    queryKey: ["prazos-mes", format(mesAtual, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prazos_processuais")
        .select("*")
        .gte("data_vencimento", format(inicioMes, "yyyy-MM-dd"))
        .lte("data_vencimento", format(fimMes, "yyyy-MM-dd"))
        .eq("status", "aberto")
        .order("data_vencimento", { ascending: true });
      
      if (error) throw error;
      return data as Prazo[];
    }
  });

  // Organizar eventos por dia
  const eventosPorDia = (dia: Date): DayEvent => {
    const dataFormatada = format(dia, "yyyy-MM-dd");
    
    return {
      feriados: feriados?.filter(f => f.data === dataFormatada) || [],
      prazos: prazos?.filter(p => p.data_vencimento === dataFormatada) || []
    };
  };

  const mudarMes = (delta: number) => {
    setMesAtual(delta > 0 ? addMonths(mesAtual, 1) : subMonths(mesAtual, 1));
    setDiaSelecionado(null);
  };

  const getPrioridadeCor = (prioridade: string) => {
    const cores: Record<string, string> = {
      alta: "bg-destructive/10 text-destructive",
      media: "bg-yellow-500/10 text-yellow-600",
      baixa: "bg-blue-500/10 text-blue-600"
    };
    return cores[prioridade] || "bg-muted text-muted-foreground";
  };

  // Calcular o dia da semana que o mês começa (0 = domingo)
  const primeiroDiaSemana = inicioMes.getDay();
  
  // Criar array com dias vazios no início
  const diasVaziosInicio = Array(primeiroDiaSemana).fill(null);
  
  const eventosDiaSelecionado = diaSelecionado ? eventosPorDia(diaSelecionado) : null;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-10 w-10 text-primary" />
            Calendário Jurídico
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize feriados e prazos processuais
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Principal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => mudarMes(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setMesAtual(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={() => mudarMes(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                <div key={dia} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-2">
              {/* Dias vazios no início */}
              {diasVaziosInicio.map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square" />
              ))}

              {/* Dias do mês */}
              {diasDoMes.map((dia) => {
                const eventos = eventosPorDia(dia);
                const temFeriado = eventos.feriados.length > 0;
                const temPrazo = eventos.prazos.length > 0;
                const ehHoje = isSameDay(dia, new Date());
                const ehSelecionado = diaSelecionado && isSameDay(dia, diaSelecionado);

                return (
                  <button
                    key={dia.toString()}
                    onClick={() => setDiaSelecionado(dia)}
                    className={cn(
                      "aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md relative",
                      "flex flex-col items-start justify-start text-left",
                      ehHoje && "border-primary bg-primary/5",
                      ehSelecionado && "border-accent bg-accent/10",
                      !ehHoje && !ehSelecionado && "border-border hover:border-primary/50",
                      temFeriado && "bg-destructive/5",
                      !isSameMonth(dia, mesAtual) && "opacity-50"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-semibold mb-1",
                      ehHoje && "text-primary",
                      temFeriado && "text-destructive"
                    )}>
                      {format(dia, "d")}
                    </span>

                    {/* Indicadores de eventos */}
                    <div className="flex flex-col gap-0.5 w-full">
                      {temFeriado && (
                        <div className="w-full h-1 bg-destructive rounded-full" />
                      )}
                      {temPrazo && (
                        <div className={cn(
                          "w-full h-1 rounded-full",
                          eventos.prazos.some(p => p.prioridade === "alta") 
                            ? "bg-destructive" 
                            : "bg-yellow-500"
                        )} />
                      )}
                    </div>

                    {/* Contador de eventos */}
                    {(temFeriado || temPrazo) && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        {temFeriado && (
                          <span className="text-[10px] bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
                            {eventos.feriados.length}
                          </span>
                        )}
                        {temPrazo && (
                          <span className="text-[10px] bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                            {eventos.prazos.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded" />
                <span className="text-muted-foreground">Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive/20 rounded" />
                <span className="text-muted-foreground">Feriado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500/20 rounded" />
                <span className="text-muted-foreground">Prazo Processual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel Lateral - Detalhes do Dia */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {diaSelecionado 
                ? format(diaSelecionado, "d 'de' MMMM", { locale: ptBR })
                : "Selecione um dia"
              }
            </CardTitle>
            <CardDescription>
              {diaSelecionado && eventosDiaSelecionado && (
                <span>
                  {eventosDiaSelecionado.feriados.length} feriado(s) • {eventosDiaSelecionado.prazos.length} prazo(s)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!diaSelecionado ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Clique em um dia do calendário para ver os detalhes
              </p>
            ) : (
              <>
                {/* Feriados */}
                {eventosDiaSelecionado && eventosDiaSelecionado.feriados.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-destructive">
                      <CalendarIcon className="h-4 w-4" />
                      Feriados
                    </h3>
                    {eventosDiaSelecionado.feriados.map((feriado) => (
                      <Card key={feriado.id} className="p-3 bg-destructive/5 border-destructive/20">
                        <p className="font-medium text-sm">{feriado.descricao}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {feriado.tipo}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Prazos */}
                {eventosDiaSelecionado && eventosDiaSelecionado.prazos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      Prazos Processuais
                    </h3>
                    {eventosDiaSelecionado.prazos.map((prazo) => (
                      <Card key={prazo.id} className="p-3 bg-yellow-500/5 border-yellow-500/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{prazo.descricao}</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {prazo.numero_processo}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={cn("text-[10px]", getPrioridadeCor(prazo.prioridade))}>
                                {prazo.prioridade}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {prazo.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Sem eventos */}
                {eventosDiaSelecionado && 
                 eventosDiaSelecionado.feriados.length === 0 && 
                 eventosDiaSelecionado.prazos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum evento neste dia
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Feriados no Mês</CardDescription>
            <CardTitle className="text-3xl">{feriados?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Prazos Abertos</CardDescription>
            <CardTitle className="text-3xl">{prazos?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Prazos Urgentes</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {prazos?.filter(p => p.prioridade === "alta").length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
