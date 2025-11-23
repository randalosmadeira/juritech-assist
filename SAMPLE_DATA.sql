-- ============================================================
-- DADOS DE EXEMPLO PARA TESTES
-- RDM Advogados - Sistema de Automação Jurídica
-- ============================================================
-- 
-- ATENÇÃO: Este arquivo contém dados fictícios para testes.
-- Execute via Lovable Cloud Backend ou SQL Editor.
-- 
-- Para executar: copie e cole no SQL Editor do backend.
-- ============================================================

-- 1. INSERIR CLIENTES DE TESTE
INSERT INTO public.clientes (nome_completo, email, telefone, cpf_cnpj, endereco) VALUES
('João da Silva Santos', 'joao.santos@email.com', '(98) 98765-4321', '123.456.789-00', 'Rua A, 123 - São Luís/MA'),
('Maria Oliveira Costa', 'maria.costa@email.com', '(98) 98765-4322', '987.654.321-00', 'Av. B, 456 - São Luís/MA'),
('Empresa XYZ Ltda', 'contato@empresaxyz.com', '(98) 98765-4323', '12.345.678/0001-90', 'Rua C, 789 - São Luís/MA');

-- 2. INSERIR PROCESSOS DE TESTE
INSERT INTO public.processos (numero_processo, cliente_id, tribunal, vara, tipo_processo, tipo_acao, polo, fase_processual, status, data_distribuicao) VALUES
(
  '0001234-56.2024.8.16.0001',
  (SELECT id FROM public.clientes WHERE nome_completo = 'João da Silva Santos' LIMIT 1),
  'TJMA',
  '1ª Vara Cível',
  'Cível',
  'Ação de Cobrança',
  'Autor',
  'Instrução',
  'ativo',
  '2024-01-15'
),
(
  '0007890-12.2024.8.16.0001',
  (SELECT id FROM public.clientes WHERE nome_completo = 'Maria Oliveira Costa' LIMIT 1),
  'TJMA',
  '2ª Vara Cível',
  'Cível',
  'Ação de Indenização',
  'Autor',
  'Sentença',
  'ativo',
  '2024-03-20'
),
(
  '0003456-78.2024.8.16.0001',
  (SELECT id FROM public.clientes WHERE nome_completo = 'Empresa XYZ Ltda' LIMIT 1),
  'TJMA',
  '5ª Vara Empresarial',
  'Cível',
  'Recuperação Judicial',
  'Requerente',
  'Análise',
  'ativo',
  '2024-02-10'
);

-- 3. INSERIR FERIADOS DE 2025 (NACIONAL + MARANHÃO)
INSERT INTO public.feriados (data, descricao, tipo, estado) VALUES
('2025-01-01', 'Ano Novo', 'nacional', NULL),
('2025-02-24', 'Carnaval', 'nacional', NULL),
('2025-02-25', 'Carnaval', 'nacional', NULL),
('2025-02-26', 'Quarta-feira de Cinzas (até 12h)', 'nacional', NULL),
('2025-04-18', 'Sexta-feira Santa', 'nacional', NULL),
('2025-04-21', 'Tiradentes', 'nacional', NULL),
('2025-05-01', 'Dia do Trabalho', 'nacional', NULL),
('2025-06-19', 'Corpus Christi', 'nacional', NULL),
('2025-07-28', 'Adesão do Maranhão à Independência', 'estadual', 'MA'),
('2025-09-07', 'Independência do Brasil', 'nacional', NULL),
('2025-10-12', 'Nossa Senhora Aparecida', 'nacional', NULL),
('2025-11-02', 'Finados', 'nacional', NULL),
('2025-11-15', 'Proclamação da República', 'nacional', NULL),
('2025-11-20', 'Dia da Consciência Negra', 'nacional', NULL),
('2025-12-08', 'Dia de Nossa Senhora da Conceição (Padroeira do MA)', 'estadual', 'MA'),
('2025-12-25', 'Natal', 'nacional', NULL);

-- 4. INSERIR PUBLICAÇÕES DE TESTE
INSERT INTO public.publicacoes (
  processo_id,
  numero_processo,
  tribunal,
  tipo_publicacao,
  texto_completo,
  texto_resumido,
  data_publicacao,
  data_leitura,
  hash_conteudo,
  status,
  tem_prazo,
  notificado_cliente
) VALUES
(
  (SELECT id FROM public.processos WHERE numero_processo = '0001234-56.2024.8.16.0001' LIMIT 1),
  '0001234-56.2024.8.16.0001',
  'TJMA',
  'Intimação',
  'Intimação para manifestação sobre documentos juntados aos autos pela parte contrária. Prazo: 15 dias.',
  'O tribunal solicita que você se manifeste sobre documentos apresentados pela parte contrária no prazo de 15 dias.',
  '2025-11-20',
  '2025-11-21 08:30:00',
  'hash_001_manifestacao_documentos',
  'lida',
  true,
  false
),
(
  (SELECT id FROM public.processos WHERE numero_processo = '0007890-12.2024.8.16.0001' LIMIT 1),
  '0007890-12.2024.8.16.0001',
  'TJMA',
  'Sentença',
  'Sentença proferida nos autos. Procedente o pedido inicial. Condenação da parte ré ao pagamento de indenização por danos morais no valor de R$ 10.000,00.',
  'A sentença foi favorável! O juiz julgou procedente o pedido e a parte contrária foi condenada a pagar R$ 10.000,00 de indenização.',
  '2025-11-19',
  '2025-11-20 09:15:00',
  'hash_002_sentenca_procedente',
  'notificada',
  true,
  true
);

-- 5. INSERIR PRAZOS PROCESSUAIS DE TESTE
INSERT INTO public.prazos_processuais (
  processo_id,
  publicacao_id,
  numero_processo,
  tipo_prazo,
  descricao,
  data_inicio,
  data_vencimento,
  dias_prazo,
  base_legal,
  tipo_processo,
  status,
  prioridade
) VALUES
(
  (SELECT id FROM public.processos WHERE numero_processo = '0001234-56.2024.8.16.0001' LIMIT 1),
  (SELECT id FROM public.publicacoes WHERE hash_conteudo = 'hash_001_manifestacao_documentos' LIMIT 1),
  '0001234-56.2024.8.16.0001',
  'Manifestação',
  'Manifestação sobre documentos juntados pela parte contrária',
  '2025-11-21',
  '2025-12-11',
  15,
  'CPC, art. 437',
  'civel',
  'aberto',
  'alta'
),
(
  (SELECT id FROM public.processos WHERE numero_processo = '0007890-12.2024.8.16.0001' LIMIT 1),
  (SELECT id FROM public.publicacoes WHERE hash_conteudo = 'hash_002_sentenca_procedente' LIMIT 1),
  '0007890-12.2024.8.16.0001',
  'Recurso de Apelação',
  'Prazo para interpor recurso de apelação (parte ré)',
  '2025-11-20',
  '2025-12-05',
  15,
  'CPC, art. 1003',
  'civel',
  'aberto',
  'normal'
);

-- 6. INSERIR TAREFAS DE TESTE
INSERT INTO public.tarefas (
  processo_id,
  prazo_id,
  titulo,
  descricao,
  tipo_tarefa,
  prioridade,
  status,
  responsavel,
  data_limite
) VALUES
(
  (SELECT id FROM public.processos WHERE numero_processo = '0001234-56.2024.8.16.0001' LIMIT 1),
  (SELECT id FROM public.prazos_processuais WHERE tipo_prazo = 'Manifestação' LIMIT 1),
  'Redigir manifestação sobre documentos',
  'Analisar documentos juntados pela parte contrária e elaborar manifestação técnica',
  'peticao',
  'alta',
  'aberta',
  'Dr. Roberto Mendes',
  '2025-12-08'
),
(
  (SELECT id FROM public.processos WHERE numero_processo = '0007890-12.2024.8.16.0001' LIMIT 1),
  NULL,
  'Notificar cliente sobre sentença favorável',
  'Enviar notificação formal ao cliente informando sobre sentença procedente',
  'administrativa',
  'normal',
  'concluida',
  'Secretaria',
  '2025-11-20'
);

-- 7. INSERIR AUDITORIAS DE TESTE (Divergência Cadastral D+1)
INSERT INTO public.auditorias (
  tipo_auditoria,
  categoria,
  prioridade,
  status,
  entidade_afetada,
  entidade_id,
  titulo,
  descricao,
  campos_divergentes,
  sugestao_correcao,
  responsavel,
  data_identificacao,
  data_limite
) VALUES
(
  'divergencia_cadastral',
  'administrativo',
  'alta',
  'aberta',
  'cliente',
  (SELECT id FROM public.clientes WHERE nome_completo = 'João da Silva Santos' LIMIT 1),
  'Divergência no e-mail do cliente',
  'O e-mail cadastrado no sistema difere do e-mail informado no processo.',
  '{"campo": "email", "valor_atual": "joao.santos@email.com", "valor_esperado": "joao.silva.santos@email.com"}',
  'Verificar com o cliente qual e-mail está correto e atualizar no cadastro',
  'Supervisora Administrativa',
  '2025-11-22 10:00:00',
  '2025-11-23 23:59:59'
);

-- 8. INSERIR WORKFLOWS DE TESTE
INSERT INTO public.workflows (
  processo_id,
  nome_workflow,
  tipo_workflow,
  etapa_atual,
  status,
  progresso,
  historico_etapas
) VALUES
(
  (SELECT id FROM public.processos WHERE numero_processo = '0001234-56.2024.8.16.0001' LIMIT 1),
  'Processamento de Intimação - Manifestação',
  'publicacao',
  'Aguardando redação da petição',
  'ativo',
  60,
  '[
    {"etapa": "Leitura da publicação", "timestamp": "2025-11-21T08:30:00Z", "status": "concluido"},
    {"etapa": "Cálculo de prazo", "timestamp": "2025-11-21T08:31:00Z", "status": "concluido"},
    {"etapa": "Criação de tarefa", "timestamp": "2025-11-21T08:32:00Z", "status": "concluido"},
    {"etapa": "Aguardando redação", "timestamp": "2025-11-21T08:33:00Z", "status": "em_andamento"}
  ]'
);

-- ============================================================
-- CONSULTAS ÚTEIS PARA TESTES
-- ============================================================

-- Verificar clientes cadastrados
-- SELECT * FROM public.clientes;

-- Verificar processos com clientes
-- SELECT p.*, c.nome_completo 
-- FROM public.processos p 
-- LEFT JOIN public.clientes c ON p.cliente_id = c.id;

-- Verificar prazos abertos
-- SELECT * FROM public.prazos_processuais 
-- WHERE status = 'aberto' 
-- ORDER BY data_vencimento;

-- Verificar auditorias pendentes
-- SELECT * FROM public.auditorias 
-- WHERE status = 'aberta' 
-- ORDER BY data_limite;

-- Verificar publicações não notificadas
-- SELECT * FROM public.publicacoes 
-- WHERE notificado_cliente = false;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================