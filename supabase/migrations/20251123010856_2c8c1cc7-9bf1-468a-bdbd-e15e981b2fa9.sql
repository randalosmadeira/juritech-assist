-- Tabela para armazenar sessões e logs de autenticação do EasyJur
CREATE TABLE public.easyjur_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.easyjur_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: apenas funções do sistema podem acessar (não expor ao cliente)
CREATE POLICY "Service role only access"
ON public.easyjur_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela para logs de autenticação e auditoria
CREATE TABLE public.easyjur_auth_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.easyjur_auth_logs ENABLE ROW LEVEL SECURITY;

-- Policy: apenas service role pode acessar logs
CREATE POLICY "Service role only access logs"
ON public.easyjur_auth_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_easyjur_sessions_updated_at
BEFORE UPDATE ON public.easyjur_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();