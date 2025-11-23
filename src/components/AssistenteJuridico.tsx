import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AssistenteJuridico = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Buscar documentos disponíveis para contexto
      const { data: documentos } = await supabase
        .from('documentos_juridicos')
        .select('vector_store_id')
        .eq('status', 'pronto')
        .not('vector_store_id', 'is', null);

      const vectorStoreIds = documentos?.map(d => d.vector_store_id).filter(Boolean) || [];

      // Se há documentos, usar busca com file_search
      if (vectorStoreIds.length > 0) {
        const { data, error } = await supabase.functions.invoke('buscar-documentos', {
          body: { 
            query: input,
            vector_store_ids: vectorStoreIds,
          }
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Senão, usar o assistente normal
        const { data, error } = await supabase.functions.invoke('assistente-juridico', {
          body: { messages: [...messages, userMessage] }
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro ao chamar assistente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter resposta do assistente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <h2 className="font-serif font-semibold text-lg">Assistente Jurídico com IA</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Faça perguntas sobre jurisprudência, legislação e notícias jurídicas
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Olá! Sou seu assistente jurídico.</p>
              <p className="text-sm mt-2">Posso buscar informações atualizadas na web para ajudá-lo.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta jurídica..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
