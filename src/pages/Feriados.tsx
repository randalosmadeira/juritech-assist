import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Download, Plus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Feriado {
  id: string;
  data: string;
  descricao: string;
  tipo: string;
  estado: string | null;
  municipio: string | null;
}

export default function Feriados() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Filtros
  const [anoFiltro, setAnoFiltro] = useState<string>(currentYear.toString());
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");

  // Form de novo feriado
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoFeriado, setNovoFeriado] = useState({
    data: "",
    descricao: "",
    tipo: "nacional",
    estado: "",
    municipio: ""
  });

  // Buscar feriados com filtros
  const { data: feriados, isLoading } = useQuery({
    queryKey: ["feriados", anoFiltro, tipoFiltro, estadoFiltro],
    queryFn: async () => {
      let query = supabase
        .from("feriados")
        .select("*")
        .order("data", { ascending: true });

      // Filtro por ano
      if (anoFiltro) {
        query = query.gte("data", `${anoFiltro}-01-01`).lte("data", `${anoFiltro}-12-31`);
      }

      // Filtro por tipo
      if (tipoFiltro !== "todos") {
        query = query.eq("tipo", tipoFiltro);
      }

      // Filtro por estado
      if (estadoFiltro !== "todos") {
        query = query.eq("estado", estadoFiltro);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Feriado[];
    }
  });

  // Importar feriados da API
  const importarFeriados = useMutation({
    mutationFn: async (ano: number) => {
      const { data, error } = await supabase.functions.invoke("importar-feriados", {
        body: { ano }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Feriados importados!",
        description: `${data.results.novos} novos feriados foram adicionados.`
      });
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao importar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Adicionar feriado manual
  const adicionarFeriado = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feriados").insert({
        data: novoFeriado.data,
        descricao: novoFeriado.descricao,
        tipo: novoFeriado.tipo,
        estado: novoFeriado.estado || null,
        municipio: novoFeriado.municipio || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Feriado adicionado!",
        description: "O feriado foi cadastrado com sucesso."
      });
      setDialogOpen(false);
      setNovoFeriado({ data: "", descricao: "", tipo: "nacional", estado: "", municipio: "" });
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Excluir feriado
  const excluirFeriado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("feriados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Feriado excluído",
        description: "O feriado foi removido com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const formatarData = (data: string) => {
    return format(new Date(data + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR });
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      nacional: "Nacional",
      estadual: "Estadual",
      municipal: "Municipal"
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Calendar className="h-10 w-10 text-primary" />
            Gerenciar Feriados
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie feriados nacionais, estaduais e municipais
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => importarFeriados.mutate(parseInt(anoFiltro))}
            disabled={importarFeriados.isPending}
          >
            {importarFeriados.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Importar {anoFiltro}
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Adicionar Feriado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Feriado</DialogTitle>
                <DialogDescription>
                  Cadastre um feriado estadual ou municipal manualmente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novoFeriado.data}
                    onChange={(e) => setNovoFeriado({ ...novoFeriado, data: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={novoFeriado.descricao}
                    onChange={(e) => setNovoFeriado({ ...novoFeriado, descricao: e.target.value })}
                    placeholder="Ex: Dia do Aniversário da Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={novoFeriado.tipo}
                    onValueChange={(value) => setNovoFeriado({ ...novoFeriado, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="estadual">Estadual</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(novoFeriado.tipo === "estadual" || novoFeriado.tipo === "municipal") && (
                  <div>
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Input
                      id="estado"
                      value={novoFeriado.estado}
                      onChange={(e) => setNovoFeriado({ ...novoFeriado, estado: e.target.value.toUpperCase() })}
                      placeholder="Ex: CE"
                      maxLength={2}
                    />
                  </div>
                )}
                {novoFeriado.tipo === "municipal" && (
                  <div>
                    <Label htmlFor="municipio">Município</Label>
                    <Input
                      id="municipio"
                      value={novoFeriado.municipio}
                      onChange={(e) => setNovoFeriado({ ...novoFeriado, municipio: e.target.value })}
                      placeholder="Ex: Fortaleza"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => adicionarFeriado.mutate()} disabled={adicionarFeriado.isPending}>
                  {adicionarFeriado.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine sua busca por ano, tipo e estado</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label>Ano</Label>
            <Select value={anoFiltro} onValueChange={setAnoFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Tipo</Label>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="nacional">Nacional</SelectItem>
                <SelectItem value="estadual">Estadual</SelectItem>
                <SelectItem value="municipal">Municipal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Estado</Label>
            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="CE">Ceará (CE)</SelectItem>
                <SelectItem value="SP">São Paulo (SP)</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Feriados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Feriados Cadastrados
            {feriados && <span className="text-muted-foreground ml-2">({feriados.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !feriados || feriados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum feriado encontrado para os filtros selecionados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feriados.map((feriado) => (
                  <TableRow key={feriado.id}>
                    <TableCell className="font-medium">{formatarData(feriado.data)}</TableCell>
                    <TableCell>{feriado.descricao}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                        {getTipoLabel(feriado.tipo)}
                      </span>
                    </TableCell>
                    <TableCell>{feriado.estado || "-"}</TableCell>
                    <TableCell>{feriado.municipio || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => excluirFeriado.mutate(feriado.id)}
                        disabled={excluirFeriado.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
