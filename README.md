# RDM Advogados - Sistema de Automação Jurídica

Sistema de automação desenvolvido para o escritório RDM Advogados Associados, integrando EasyJur, ConversApp e e-mail corporativo para gestão automatizada de publicações, prazos e tarefas jurídicas.

## 📋 Visão Geral

Este sistema automatiza rotinas administrativas essenciais:
- ✅ Leitura diária de publicações e intimações do EasyJur
- ✅ Cálculo automático de prazos processuais (CPC, CPP, CLT)
- ✅ Notificações aos clientes via ConversApp (WhatsApp)
- ✅ Gestão de tarefas e workflows
- ✅ Sistema de auditoria com prazo D+1 para divergências cadastrais
- ✅ Relatórios gerenciais e operacionais

## 🗄️ Banco de Dados

O sistema utiliza **Lovable Cloud** (Supabase) com as seguintes tabelas:

| Tabela | Descrição |
|--------|-----------|
| `clientes` | Gestão de clientes do escritório |
| `processos` | Centralização de processos jurídicos |
| `publicacoes` | Registro de publicações e intimações |
| `prazos_processuais` | Controle automatizado de prazos com triggers |
| `tarefas` | Sistema de tarefas e atividades |
| `auditorias` | Sistema de auditoria com prazo D+1 |
| `workflows` | Fluxos de trabalho automatizados |
| `feriados` | Calendário para cálculo de prazos |
| `easyjur_sessions` | Gestão de sessões do EasyJur |
| `easyjur_auth_logs` | Logs de autenticação |

📖 **Documentação completa**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Edge Functions**: Deno para automações
- **Integrações**: EasyJur, ConversApp, E-mail corporativo

### Módulos Principais
1. **Autenticação EasyJur**: Login seguro com credenciais em Supabase Secrets
2. **Leitura de Publicações**: Extração diária de publicações
3. **Cálculo de Prazos**: Algoritmo automático baseado em legislação
4. **Notificações**: Envio formatado ao cliente via ConversApp
5. **Auditoria**: Sistema D+1 para correção de divergências
6. **Relatórios**: Dashboards e exportação de dados

📖 **Especificação técnica completa**: [ESPECIFICACAO_TECNICA.md](./ESPECIFICACAO_TECNICA.md)

## 🚀 Como Executar

### Pré-requisitos
- Node.js & npm ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Acesso ao projeto Lovable
- Credenciais do EasyJur configuradas

### Instalação Local

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Entre no diretório
cd <YOUR_PROJECT_NAME>

# 3. Instale as dependências
npm i

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração de Secrets

As credenciais são armazenadas em **Supabase Secrets**:

1. Acesse o backend: [View Backend]
2. Configure os secrets:
   - `EASYJUR_USERNAME`
   - `EASYJUR_PASSWORD`
   - (Futuros: `CONVERSAPP_API_KEY`, `EMAIL_PASSWORD`)

⚠️ **Nunca** exponha credenciais no código!

## 📦 Deploy

1. Abra [Lovable Project](https://lovable.dev/projects/5e9d9bc7-a75d-4d2d-a019-128eb20c04be)
2. Clique em **Share → Publish**
3. Configure domínio customizado em **Settings → Domains**

📖 Leia mais: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain)

## 🔐 Segurança e LGPD

- ✅ RLS (Row Level Security) habilitado em todas as tabelas
- ✅ Credenciais armazenadas em Supabase Secrets
- ✅ Acesso via service role apenas para edge functions
- ✅ Logs de auditoria completos
- ✅ Minimização de dados pessoais
- ✅ Conformidade com LGPD e Estatuto da OAB

## 📊 Funcionalidades Principais

### 1. Dashboard Administrativo
- Estatísticas em tempo real
- Publicações recentes
- Prazos próximos
- Status das integrações

### 2. Autenticação EasyJur
- Login automatizado
- Gestão de sessões
- Logs de auditoria
- Detecção de erros

### 3. Sistema de Prazos
- Cálculo automático (CPC, CPP, CLT)
- Calendário de feriados
- Alertas de vencimento
- Triggers automáticos

### 4. Auditorias D+1
- Detecção automática de divergências
- Prazo de 1 dia útil para correção
- Responsável: Supervisora Administrativa
- Rastreamento de resolução

## 🛠️ Desenvolvimento

### Estrutura de Arquivos

```
src/
├── components/         # Componentes React
│   ├── ui/            # Componentes shadcn/ui
│   └── EasyJurConnectionStatus.tsx
├── pages/             # Páginas da aplicação
│   ├── Index.tsx      # Landing page
│   ├── Dashboard.tsx  # Dashboard administrativo
│   └── Architecture.tsx # Documentação arquitetural
├── integrations/
│   └── supabase/      # Cliente Supabase (auto-gerado)
└── main.tsx           # Entry point

supabase/
├── config.toml        # Configuração do Supabase
└── functions/         # Edge Functions
    └── easyjur-auth/  # Autenticação EasyJur
```

### Edge Functions

As edge functions são **deployadas automaticamente** quando você faz alterações.

#### easyjur-auth
Gerencia autenticação com o EasyJur:
- `POST { action: "login" }` - Realiza login
- `POST { action: "check_session" }` - Verifica sessão ativa

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Estrutura completa do banco |
| [ESPECIFICACAO_TECNICA.md](./ESPECIFICACAO_TECNICA.md) | Especificação técnica detalhada |

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação técnica](./ESPECIFICACAO_TECNICA.md)
2. Verifique os logs no backend
3. Entre em contato com o suporte Lovable

## 📝 Licença

© 2025 RDM Advogados Associados. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando [Lovable](https://lovable.dev)**