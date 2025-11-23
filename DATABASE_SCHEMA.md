# Estrutura do Banco de Dados - RDM Advogados

Este documento descreve a estrutura completa do banco de dados do sistema de automação jurídica.

## Visão Geral

O banco de dados foi projetado para suportar:
- Gestão de clientes e processos
- Controle de publicações e intimações
- Cálculo automático de prazos processuais
- Gestão de tarefas e workflows
- Sistema de auditoria com prazo D+1
- Integração com EasyJur, ConversApp e e-mail corporativo

## Tabelas Principais

### 1. `clientes`
Armazena dados dos clientes do escritório.

**Campos principais:**
- `id` (UUID): Identificador único
- `nome_completo` (TEXT): Nome completo do cliente
- `email` (TEXT): E-mail de contato
- `telefone` (TEXT): Telefone de contato
- `cpf_cnpj` (TEXT): CPF ou CNPJ
- `endereco` (TEXT): Endereço completo
- `dados_adicionais` (JSONB): Dados complementares em formato flexível

**Índices:**
- `idx_clientes_email`: Para busca por e-mail
- `idx_clientes_cpf_cnpj`: Para busca por CPF/CNPJ

---

### 2. `processos`
Centraliza informações dos processos jurídicos.

**Campos principais:**
- `id` (UUID): Identificador único
- `numero_processo` (TEXT, UNIQUE): Número CNJ do processo
- `cliente_id` (UUID): Referência ao cliente
- `tribunal` (TEXT): Tribunal onde tramita
- `vara` (TEXT): Vara do processo
- `tipo_processo` (TEXT): Cível, penal, trabalhista, etc.
- `tipo_acao` (TEXT): Tipo de ação judicial
- `valor_causa` (DECIMAL): Valor da causa
- `polo` (TEXT): Ativo, passivo, autor, réu
- `fase_processual` (TEXT): Fase atual do processo
- `status` (TEXT): Ativo, arquivado, suspenso, etc.
- `data_distribuicao` (DATE): Data de distribuição

**Índices:**
- `idx_processos_numero`: Busca por número do processo
- `idx_processos_cliente`: Busca por cliente
- `idx_processos_tribunal`: Busca por tribunal
- `idx_processos_status`: Busca por status

---

### 3. `publicacoes`
Registra todas as publicações e intimações lidas do EasyJur.

**Campos principais:**
- `id` (UUID): Identificador único
- `processo_id` (UUID): Referência ao processo
- `numero_processo` (TEXT): Número CNJ
- `tribunal` (TEXT): Tribunal
- `tipo_publicacao` (TEXT): Intimação, sentença, despacho, etc.
- `texto_completo` (TEXT): Texto integral da publicação
- `texto_resumido` (TEXT): Resumo em linguagem acessível
- `data_publicacao` (DATE): Data da publicação
- `data_leitura` (TIMESTAMP): Quando foi lida pelo sistema
- `hash_conteudo` (TEXT): Hash para detectar duplicidades
- `status` (TEXT): Pendente, lida, notificada, processada
- `tem_prazo` (BOOLEAN): Se gera prazo processual
- `notificado_cliente` (BOOLEAN): Se cliente foi notificado
- `data_notificacao` (TIMESTAMP): Quando cliente foi notificado

**Índices:**
- `idx_publicacoes_processo`: Por processo
- `idx_publicacoes_numero_processo`: Por número
- `idx_publicacoes_data_publicacao`: Por data (DESC)
- `idx_publicacoes_status`: Por status
- `idx_publicacoes_hash`: Para detecção de duplicidades

**Controle de Duplicidade:**
O campo `hash_conteudo` armazena um hash do conteúdo da publicação para evitar processamento duplicado.

---

### 4. `feriados`
Tabela de feriados para cálculo correto de prazos processuais.

**Campos principais:**
- `id` (UUID): Identificador único
- `data` (DATE, UNIQUE): Data do feriado
- `descricao` (TEXT): Descrição do feriado
- `tipo` (TEXT): Nacional, estadual, municipal, forense
- `estado` (TEXT): Estado (se aplicável)
- `municipio` (TEXT): Município (se aplicável)

**Índices:**
- `idx_feriados_data`: Busca por data
- `idx_feriados_tipo`: Busca por tipo

---

### 5. `prazos_processuais`
Gerencia todos os prazos processuais calculados automaticamente.

**Campos principais:**
- `id` (UUID): Identificador único
- `processo_id` (UUID): Referência ao processo
- `publicacao_id` (UUID): Referência à publicação que originou
- `numero_processo` (TEXT): Número CNJ
- `tipo_prazo` (TEXT): Recurso, manifestação, cumprimento, etc.
- `descricao` (TEXT): Descrição do prazo
- `data_inicio` (DATE): Data de início
- `data_vencimento` (DATE): Data de vencimento
- `dias_prazo` (INTEGER): Quantidade de dias
- `dias_restantes` (INTEGER): Dias até o vencimento (calculado automaticamente)
- `base_legal` (TEXT): CPC art. X, CPP art. Y, CLT art. Z
- `tipo_processo` (TEXT): Cível, penal, trabalhista
- `status` (TEXT): Aberto, vencido, cumprido, cancelado
- `prioridade` (TEXT): Baixa, normal, alta, urgente
- `responsavel` (TEXT): Advogado responsável

**Índices:**
- `idx_prazos_processo`: Por processo
- `idx_prazos_numero_processo`: Por número
- `idx_prazos_vencimento`: Por data de vencimento
- `idx_prazos_status`: Por status
- `idx_prazos_prioridade`: Por prioridade

**Triggers Automáticos:**
1. `trigger_calcular_dias_restantes`: Calcula automaticamente os dias restantes
2. `trigger_atualizar_status_prazo`: Marca como "vencido" automaticamente quando a data passa

---

### 6. `tarefas`
Sistema de gestão de tarefas do escritório.

**Campos principais:**
- `id` (UUID): Identificador único
- `processo_id` (UUID): Referência ao processo
- `prazo_id` (UUID): Referência ao prazo (se aplicável)
- `publicacao_id` (UUID): Referência à publicação (se aplicável)
- `titulo` (TEXT): Título da tarefa
- `descricao` (TEXT): Descrição detalhada
- `tipo_tarefa` (TEXT): Prazo, audiência, reunião, análise, petição, administrativa
- `prioridade` (TEXT): Baixa, normal, alta, urgente
- `status` (TEXT): Aberta, em_andamento, concluída, cancelada, em_revisao
- `responsavel` (TEXT): Responsável pela tarefa
- `data_limite` (DATE): Prazo de conclusão
- `data_conclusao` (TIMESTAMP): Quando foi concluída
- `estimativa_horas` (DECIMAL): Estimativa de horas
- `tags` (TEXT[]): Tags para organização

**Índices:**
- `idx_tarefas_processo`: Por processo
- `idx_tarefas_status`: Por status
- `idx_tarefas_prioridade`: Por prioridade
- `idx_tarefas_data_limite`: Por data limite
- `idx_tarefas_responsavel`: Por responsável

---

### 7. `auditorias`
Sistema de auditoria interna com prazo D+1 para divergências cadastrais.

**Campos principais:**
- `id` (UUID): Identificador único
- `tipo_auditoria` (TEXT): Divergência_cadastral, inconsistência_prazo, erro_sistema, revisão_manual
- `categoria` (TEXT): Administrativo, processual, financeiro, integração
- `prioridade` (TEXT): Baixa, normal, alta, crítica
- `status` (TEXT): Aberta, em_análise, resolvida, cancelada
- `entidade_afetada` (TEXT): Cliente, processo, publicação, prazo
- `entidade_id` (UUID): ID da entidade afetada
- `titulo` (TEXT): Título da auditoria
- `descricao` (TEXT): Descrição do problema
- `campos_divergentes` (JSONB): Campos com divergência em formato JSON
- `evidencias` (JSONB): Evidências do problema
- `sugestao_correcao` (TEXT): Sugestão de como corrigir
- `responsavel` (TEXT): Default: "Supervisora Administrativa"
- `data_identificacao` (TIMESTAMP): Quando foi identificado
- `data_limite` (TIMESTAMP): Prazo para correção (D+1)
- `data_resolucao` (TIMESTAMP): Quando foi resolvido

**Índices:**
- `idx_auditorias_tipo`: Por tipo
- `idx_auditorias_categoria`: Por categoria
- `idx_auditorias_status`: Por status
- `idx_auditorias_prioridade`: Por prioridade
- `idx_auditorias_data_limite`: Por data limite
- `idx_auditorias_entidade`: Por entidade afetada

**Regra D+1:**
Para auditorias de tipo "divergencia_cadastral", o campo `data_limite` deve ser automaticamente configurado para data_identificacao + 1 dia útil.

---

### 8. `workflows`
Controle de fluxos de trabalho automatizados.

**Campos principais:**
- `id` (UUID): Identificador único
- `processo_id` (UUID): Referência ao processo
- `nome_workflow` (TEXT): Nome do fluxo
- `tipo_workflow` (TEXT): Publicação, prazo, audiência, financeiro
- `etapa_atual` (TEXT): Etapa atual do fluxo
- `status` (TEXT): Ativo, pausado, concluído, cancelado
- `progresso` (INTEGER): 0-100%
- `historico_etapas` (JSONB): Array de etapas com timestamps
- `dados_contexto` (JSONB): Dados contextuais do workflow

**Índices:**
- `idx_workflows_processo`: Por processo
- `idx_workflows_status`: Por status
- `idx_workflows_tipo`: Por tipo

---

### 9. `easyjur_sessions`
Gerencia sessões de autenticação com o EasyJur.

**Campos principais:**
- `id` (UUID): Identificador único
- `session_data` (JSONB): Dados da sessão
- `is_active` (BOOLEAN): Se está ativa
- `last_login_at` (TIMESTAMP): Último login
- `last_error` (TEXT): Último erro
- `expires_at` (TIMESTAMP): Quando expira

---

### 10. `easyjur_auth_logs`
Logs de autenticação e auditoria do EasyJur.

**Campos principais:**
- `id` (UUID): Identificador único
- `action` (TEXT): Ação realizada
- `status` (TEXT): Status da ação
- `details` (JSONB): Detalhes em JSON
- `error_message` (TEXT): Mensagem de erro (se houver)

---

## Segurança (RLS)

**Todas as tabelas têm Row Level Security (RLS) habilitado.**

As políticas atuais permitem acesso apenas via `service_role`, garantindo que:
- Apenas edge functions autorizadas podem acessar os dados
- Não há acesso direto do frontend às tabelas sensíveis
- Auditoria completa de todas as operações

## Triggers Automáticos

### 1. Atualização de `updated_at`
Todas as tabelas principais têm trigger para atualizar automaticamente o campo `updated_at`:
- `clientes`
- `processos`
- `publicacoes`
- `prazos_processuais`
- `tarefas`
- `auditorias`
- `workflows`

### 2. Cálculo de Dias Restantes
`trigger_calcular_dias_restantes` em `prazos_processuais`:
- Calcula automaticamente `dias_restantes` = `data_vencimento` - `CURRENT_DATE`
- Executa em INSERT e UPDATE

### 3. Atualização de Status de Prazo
`trigger_atualizar_status_prazo` em `prazos_processuais`:
- Marca automaticamente como "vencido" quando `data_vencimento` < `CURRENT_DATE`
- Apenas se status atual for "aberto"

## Próximos Passos

1. **Povoar tabela de feriados**: Inserir feriados nacionais, estaduais e municipais
2. **Implementar edge functions**: Para leitura de publicações e cálculo de prazos
3. **Configurar integrações**: ConversApp e e-mail corporativo
4. **Dashboard operacional**: Interface para visualização de dados
5. **Relatórios**: Implementar geração de relatórios diários e gerenciais

## Manutenção

- **Backup**: Recomendado backup diário automatizado
- **Logs**: Manter logs por no mínimo 90 dias (configurável)
- **Auditoria**: Revisar auditorias semanalmente
- **Feriados**: Atualizar anualmente

## Notas Importantes

⚠️ **LGPD**: Dados pessoais são armazenados de forma minimizada e com controle de acesso rigoroso.

⚠️ **Segurança**: Credenciais são armazenadas em Supabase Secrets, nunca no código.

⚠️ **Integridade**: Foreign keys garantem integridade referencial entre tabelas.

⚠️ **Performance**: Índices criados nas colunas mais consultadas para otimização.