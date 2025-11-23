import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Search, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trash2
} from "lucide-react";

interface Documento {
  id: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  status: string;
  categoria: string | null;
  tags: string[] | null;
  vector_store_id: string | null;
  created_at: string;
}

const Documentos = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoria, setCategoria] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    loadDocumentos();
    
    // Atualizar lista a cada 5 segundos para ver status
    const interval = setInterval(loadDocumentos, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos_juridicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Erro",
          description: "Apenas arquivos PDF são aceitos",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande (máximo 20MB)",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (categoria) formData.append('categoria', categoria);
      if (tags) formData.append('tags', tags);

      const { data, error } = await supabase.functions.invoke('upload-documento', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento enviado! Processando em background...",
      });

      setSelectedFile(null);
      setCategoria("");
      setTags("");
      loadDocumentos();

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const documentosProntos = documentos.filter(d => d.status === 'pronto' && d.vector_store_id);
    
    if (documentosProntos.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum documento processado disponível para busca",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    setSearchResult(null);

    try {
      const vectorStoreIds = documentosProntos.map(d => d.vector_store_id);

      const { data, error } = await supabase.functions.invoke('buscar-documentos', {
        body: { 
          query: searchQuery,
          vector_store_ids: vectorStoreIds,
        }
      });

      if (error) throw error;

      setSearchResult(data.answer);

    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a busca",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documentos_juridicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento removido",
      });

      loadDocumentos();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o documento",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pronto':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processando':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'erro':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
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

          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold text-primary">
              Documentos Jurídicos
            </h1>
          </div>
          <p className="text-muted-foreground">
            Faça upload de documentos PDF e realize buscas semânticas inteligentes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upload */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo PDF (máx 20MB)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="mt-2"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="categoria">Categoria (opcional)</Label>
                <Input
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Contratos, Petições, Sentenças"
                  disabled={uploading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (opcional, separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: trabalhista, recurso, urgente"
                  disabled={uploading}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Busca */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Busca Semântica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Faça uma pergunta sobre seus documentos</Label>
                <Textarea
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Quais são os prazos mencionados nos contratos de trabalho?"
                  rows={4}
                  disabled={searching}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="w-full"
              >
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>

              {searchResult && (
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm whitespace-pre-wrap">{searchResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Documentos */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Documentos ({documentos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documentos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum documento enviado ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg border border-border hover:border-accent/50 transition-all bg-background/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(doc.status)}
                            <p className="font-medium text-sm">{doc.nome_arquivo}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatBytes(doc.tamanho_bytes)}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                            {doc.categoria && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {doc.categoria}
                                </Badge>
                              </>
                            )}
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {doc.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentos;
