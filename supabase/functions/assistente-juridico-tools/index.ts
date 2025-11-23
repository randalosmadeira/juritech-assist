import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const tools = [
  {
    type: "function",
    name: "buscar_prazos",
    description: "Busca prazos processuais por número de processo. Retorna todos os prazos abertos e seus detalhes.",
    parameters: {
      type: "object",
      properties: {
        numero_processo: {
          type: "string",
          description: "Número do processo no formato CNJ (ex: 0001234-56.2024.8.16.0001)"
        }
      },
      required: ["numero_processo"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "buscar_publicacoes",
    description: "Busca publicações de um processo específico ou publicações recentes.",
    parameters: {
      type: "object",
      properties: {
        numero_processo: {
          type: "string",
          description: "Número do processo (opcional). Se não informado, retorna publicações recentes."
        },
        limite: {
          type: "number",
          description: "Número máximo de publicações a retornar (padrão: 5)"
        }
      },
      required: [],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "calcular_prazo",
    description: "Calcula a data de vencimento de um prazo processual considerando dias úteis e feriados.",
    parameters: {
      type: "object",
      properties: {
        data_inicio: {
          type: "string",
          description: "Data de início no formato YYYY-MM-DD"
        },
        dias_prazo: {
          type: "number",
          description: "Número de dias úteis do prazo"
        },
        estado: {
          type: "string",
          description: "Estado (UF) para considerar feriados locais (ex: MA)"
        }
      },
      required: ["data_inicio", "dias_prazo"],
      additionalProperties: false
    },
    strict: true
  },
  {
    type: "function",
    name: "listar_processos",
    description: "Lista processos ativos no sistema.",
    parameters: {
      type: "object",
      properties: {
        limite: {
          type: "number",
          description: "Número máximo de processos a retornar (padrão: 10)"
        }
      },
      required: [],
      additionalProperties: false
    },
    strict: true
  }
];

async function executarTool(toolName: string, args: any, supabase: any) {
  console.log(`Executando tool: ${toolName}`, args);

  switch (toolName) {
    case "buscar_prazos": {
      const { numero_processo } = args;
      const { data, error } = await supabase
        .from('prazos_processuais')
        .select('*')
        .eq('numero_processo', numero_processo)
        .eq('status', 'aberto')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return {
        sucesso: true,
        prazos: data || [],
        quantidade: data?.length || 0
      };
    }

    case "buscar_publicacoes": {
      const { numero_processo, limite = 5 } = args;
      let query = supabase
        .from('publicacoes')
        .select('*')
        .order('data_publicacao', { ascending: false })
        .limit(limite);

      if (numero_processo) {
        query = query.eq('numero_processo', numero_processo);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        sucesso: true,
        publicacoes: data || [],
        quantidade: data?.length || 0
      };
    }

    case "calcular_prazo": {
      const { data_inicio, dias_prazo, estado } = args;
      
      // Buscar feriados
      let feriadosQuery = supabase
        .from('feriados')
        .select('data')
        .gte('data', data_inicio);

      if (estado) {
        feriadosQuery = feriadosQuery.or(`tipo.eq.nacional,estado.eq.${estado}`);
      } else {
        feriadosQuery = feriadosQuery.eq('tipo', 'nacional');
      }

      const { data: feriadosData, error: feriadosError } = await feriadosQuery;
      if (feriadosError) throw feriadosError;

      const feriados = new Set(feriadosData?.map((f: any) => f.data) || []);

      // Calcular data de vencimento
      let dataAtual = new Date(data_inicio);
      let diasContados = 0;

      while (diasContados < dias_prazo) {
        dataAtual.setDate(dataAtual.getDate() + 1);
        const dataStr = dataAtual.toISOString().split('T')[0];
        const diaSemana = dataAtual.getDay();

        // Pular finais de semana e feriados
        if (diaSemana !== 0 && diaSemana !== 6 && !feriados.has(dataStr)) {
          diasContados++;
        }
      }

      const dataVencimento = dataAtual.toISOString().split('T')[0];
      const hoje = new Date().toISOString().split('T')[0];
      const diasRestantes = Math.ceil((dataAtual.getTime() - new Date(hoje).getTime()) / (1000 * 60 * 60 * 24));

      return {
        sucesso: true,
        data_inicio,
        dias_prazo,
        data_vencimento: dataVencimento,
        dias_restantes: diasRestantes,
        feriados_considerados: feriados.size
      };
    }

    case "listar_processos": {
      const { limite = 10 } = args;
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) throw error;

      return {
        sucesso: true,
        processos: data || [],
        quantidade: data?.length || 0
      };
    }

    default:
      return { erro: "Tool não reconhecida" };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Chamando OpenAI com tools...', { messageCount: messages.length });

    // Primeira chamada ao modelo
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente jurídico especializado em direito processual brasileiro. Você tem acesso a ferramentas para:
- Buscar prazos processuais
- Buscar publicações
- Calcular datas de vencimento considerando feriados e dias úteis
- Listar processos ativos

Use essas ferramentas sempre que necessário para fornecer informações precisas e atualizadas. Seja objetivo e cite os dados obtidos das ferramentas.`
          },
          ...messages
        ],
        tools: tools,
        tool_choice: "auto",
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    let data = await response.json();
    let assistantMessage = data.choices[0].message;

    // Se o modelo quer usar tools, executar e chamar novamente
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('Executando', assistantMessage.tool_calls.length, 'tool calls');

      const toolMessages = [];
      
      // Executar todas as tool calls
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        const toolResult = await executarTool(toolName, toolArgs, supabase);
        
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }

      // Segunda chamada com os resultados das tools
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente jurídico especializado em direito processual brasileiro. Você tem acesso a ferramentas para:
- Buscar prazos processuais
- Buscar publicações
- Calcular datas de vencimento considerando feriados e dias úteis
- Listar processos ativos

Use essas ferramentas sempre que necessário para fornecer informações precisas e atualizadas. Seja objetivo e cite os dados obtidos das ferramentas.`
            },
            ...messages,
            assistantMessage,
            ...toolMessages
          ],
          max_completion_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro OpenAI (segunda chamada):', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      data = await response.json();
    }

    console.log('Resposta gerada com sucesso');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no assistente jurídico:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
