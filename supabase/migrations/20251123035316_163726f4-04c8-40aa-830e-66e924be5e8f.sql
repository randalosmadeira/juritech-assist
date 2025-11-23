-- Criar bucket de storage para documentos jurídicos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-juridicos', 'documentos-juridicos', false);

-- Criar tabela para rastrear documentos
CREATE TABLE public.documentos_juridicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  vector_store_id TEXT,
  file_id TEXT,
  status TEXT NOT NULL DEFAULT 'processando',
  categoria TEXT,
  tags TEXT[],
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.documentos_juridicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (service role apenas)
CREATE POLICY "Service role access documentos"
ON public.documentos_juridicos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- RLS policy para storage
CREATE POLICY "Service role can upload documents"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'documentos-juridicos');

CREATE POLICY "Service role can read documents"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'documentos-juridicos');

CREATE POLICY "Service role can delete documents"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'documentos-juridicos');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_documentos_juridicos_updated_at
BEFORE UPDATE ON public.documentos_juridicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();