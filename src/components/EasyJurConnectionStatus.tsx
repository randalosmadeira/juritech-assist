import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function EasyJurConnectionStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    sessionId?: string;
    message?: string;
  } | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('easyjur-auth', {
        body: { action: 'check_session' }
      });

      if (error) throw error;

      setStatus({
        connected: data.success,
        sessionId: data.sessionId,
        message: data.message
      });

      if (data.success) {
        toast.success('Conexão com EasyJur ativa');
      } else {
        toast.info('Nenhuma sessão ativa no EasyJur');
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      toast.error('Erro ao verificar conexão com EasyJur');
      setStatus({
        connected: false,
        message: 'Erro ao verificar conexão'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const connectToEasyJur = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('easyjur-auth', {
        body: { action: 'login' }
      });

      if (error) throw error;

      if (data.success) {
        setStatus({
          connected: true,
          sessionId: data.sessionId,
          message: data.message
        });
        toast.success('Conectado ao EasyJur com sucesso');
      } else {
        throw new Error(data.error || 'Falha ao conectar');
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast.error('Erro ao conectar com EasyJur');
      setStatus({
        connected: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Conexão EasyJur</CardTitle>
            <CardDescription>
              Status da autenticação com o sistema EasyJur
            </CardDescription>
          </div>
          {status && (
            <Badge variant={status.connected ? "default" : "secondary"}>
              {status.connected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.message && (
          <p className="text-sm text-muted-foreground">{status.message}</p>
        )}
        
        {status?.sessionId && (
          <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
            Session ID: {status.sessionId.substring(0, 16)}...
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Status
              </>
            )}
          </Button>

          <Button
            onClick={connectToEasyJur}
            disabled={isConnecting || status?.connected}
            size="sm"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar ao EasyJur'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}