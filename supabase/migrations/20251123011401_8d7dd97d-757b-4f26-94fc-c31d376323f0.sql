-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  dados_adicionais JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_clientes_cpf_cnpj ON public.clientes(cpf_cnpj);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access clientes"
ON public.clientes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de processos
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  tribunal TEXT NOT NULL,
  vara TEXT,
  tipo_processo TEXT,
  tipo_acao TEXT,
  valor_causa DECIMAL(15,2),
  polo TEXT, -- ativo, passivo, autor, réu
  fase_processual TEXT,
  status TEXT DEFAULT 'ativo',
  data_distribuicao DATE,
  dados_adicionais JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_processos_numero ON public.processos(numero_processo);
CREATE INDEX idx_processos_cliente ON public.processos(cliente_id);
CREATE INDEX idx_processos_tribunal ON public.processos(tribunal);
CREATE INDEX idx_processos_status ON public.processos(status);

ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access processos"
ON public.processos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de publicações
CREATE TABLE public.publicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
  numero_processo TEXT NOT NULL,
  tribunal TEXT NOT NULL,
  tipo_publicacao TEXT NOT NULL,
  texto_completo TEXT NOT NULL,
  texto_resumido TEXT,
  data_publicacao DATE NOT NULL,
  data_leitura TIMESTAMP WITH TIME ZONE,
  hash_conteudo TEXT NOT NULL, -- para detectar duplicidades
  status TEXT DEFAULT 'pendente', -- pendente, lida, notificada, processada
  tem_prazo BOOLEAN DEFAULT false,
  notificado_cliente BOOLEAN DEFAULT false,
  data_notificacao TIMESTAMP WITH TIME ZONE,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_publicacoes_processo ON public.publicacoes(processo_id);
CREATE INDEX idx_publicacoes_numero_processo ON public.publicacoes(numero_processo);
CREATE INDEX idx_publicacoes_data_publicacao ON public.publicacoes(data_publicacao DESC);
CREATE INDEX idx_publicacoes_status ON public.publicacoes(status);
CREATE INDEX idx_publicacoes_hash ON public.publicacoes(hash_conteudo);

ALTER TABLE public.publicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access publicacoes"
ON public.publicacoes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de feriados para cálculo de prazos
CREATE TABLE public.feriados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL, -- nacional, estadual, municipal, forense
  estado TEXT,
  municipio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_feriados_data ON public.feriados(data);
CREATE INDEX idx_feriados_tipo ON public.feriados(tipo);

ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access feriados"
ON public.feriados
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de prazos processuais
CREATE TABLE public.prazos_processuais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
  publicacao_id UUID REFERENCES public.publicacoes(id) ON DELETE SET NULL,
  numero_processo TEXT NOT NULL,
  tipo_prazo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  dias_prazo INTEGER NOT NULL,
  dias_restantes INTEGER,
  base_legal TEXT, -- ex: CPC art. 1003, CPP art. 588, CLT art. 775
  tipo_processo TEXT, -- civel, penal, trabalhista
  status TEXT DEFAULT 'aberto', -- aberto, vencido, cumprido, cancelado
  prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta, urgente
  responsavel TEXT,
  observacoes TEXT,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_prazos_processo ON public.prazos_processuais(processo_id);
CREATE INDEX idx_prazos_numero_processo ON public.prazos_processuais(numero_processo);
CREATE INDEX idx_prazos_vencimento ON public.prazos_processuais(data_vencimento);
CREATE INDEX idx_prazos_status ON public.prazos_processuais(status);
CREATE INDEX idx_prazos_prioridade ON public.prazos_processuais(prioridade);

ALTER TABLE public.prazos_processuais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access prazos"
ON public.prazos_processuais
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de tarefas
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
  prazo_id UUID REFERENCES public.prazos_processuais(id) ON DELETE SET NULL,
  publicacao_id UUID REFERENCES public.publicacoes(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_tarefa TEXT NOT NULL, -- prazo, audiencia, reuniao, analise, peticao, administrativa
  prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta, urgente
  status TEXT DEFAULT 'aberta', -- aberta, em_andamento, concluida, cancelada, em_revisao
  responsavel TEXT,
  data_limite DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  estimativa_horas DECIMAL(5,2),
  tags TEXT[],
  observacoes TEXT,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_tarefas_processo ON public.tarefas(processo_id);
CREATE INDEX idx_tarefas_status ON public.tarefas(status);
CREATE INDEX idx_tarefas_prioridade ON public.tarefas(prioridade);
CREATE INDEX idx_tarefas_data_limite ON public.tarefas(data_limite);
CREATE INDEX idx_tarefas_responsavel ON public.tarefas(responsavel);

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access tarefas"
ON public.tarefas
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de auditorias
CREATE TABLE public.auditorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_auditoria TEXT NOT NULL, -- divergencia_cadastral, inconsistencia_prazo, erro_sistema, revisao_manual
  categoria TEXT NOT NULL, -- administrativo, processual, financeiro, integracao
  prioridade TEXT DEFAULT 'normal', -- baixa, normal, alta, critica
  status TEXT DEFAULT 'aberta', -- aberta, em_analise, resolvida, cancelada
  entidade_afetada TEXT, -- cliente, processo, publicacao, prazo
  entidade_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  campos_divergentes JSONB, -- ex: { "campo": "email", "valor_atual": "x", "valor_esperado": "y" }
  evidencias JSONB,
  sugestao_correcao TEXT,
  responsavel TEXT DEFAULT 'Supervisora Administrativa',
  data_identificacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_limite TIMESTAMP WITH TIME ZONE, -- D+1 para divergências cadastrais
  data_resolucao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  metadados JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditorias_tipo ON public.auditorias(tipo_auditoria);
CREATE INDEX idx_auditorias_categoria ON public.auditorias(categoria);
CREATE INDEX idx_auditorias_status ON public.auditorias(status);
CREATE INDEX idx_auditorias_prioridade ON public.auditorias(prioridade);
CREATE INDEX idx_auditorias_data_limite ON public.auditorias(data_limite);
CREATE INDEX idx_auditorias_entidade ON public.auditorias(entidade_afetada, entidade_id);

ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access auditorias"
ON public.auditorias
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tabela de workflows
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
  nome_workflow TEXT NOT NULL,
  tipo_workflow TEXT NOT NULL, -- publicacao, prazo, audiencia, financeiro
  etapa_atual TEXT NOT NULL,
  status TEXT DEFAULT 'ativo', -- ativo, pausado, concluido, cancelado
  progresso INTEGER DEFAULT 0, -- 0-100
  historico_etapas JSONB, -- array de etapas com timestamps
  dados_contexto JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflows_processo ON public.workflows(processo_id);
CREATE INDEX idx_workflows_status ON public.workflows(status);
CREATE INDEX idx_workflows_tipo ON public.workflows(tipo_workflow);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access workflows"
ON public.workflows
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Triggers para updated_at em todas as tabelas
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processos_updated_at
BEFORE UPDATE ON public.processos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publicacoes_updated_at
BEFORE UPDATE ON public.publicacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prazos_updated_at
BEFORE UPDATE ON public.prazos_processuais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auditorias_updated_at
BEFORE UPDATE ON public.auditorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular dias restantes de prazo
CREATE OR REPLACE FUNCTION public.calcular_dias_restantes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.dias_restantes := NEW.data_vencimento - CURRENT_DATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calcular_dias_restantes
BEFORE INSERT OR UPDATE ON public.prazos_processuais
FOR EACH ROW
EXECUTE FUNCTION public.calcular_dias_restantes();

-- Função para atualizar status de prazo automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_status_prazo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'aberto' THEN
    NEW.status := 'vencido';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_status_prazo
BEFORE INSERT OR UPDATE ON public.prazos_processuais
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_status_prazo();