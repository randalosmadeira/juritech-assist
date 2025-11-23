import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Publicacao {
  numero_processo: string;
  data_publicacao: string;
  tipo_publicacao: string;
  texto_completo: string;
  tribunal: string;
}

function createHash(content: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 64);
}

function detectarPrazo(texto: string): { tem_prazo: boolean; dias_prazo?: number; tipo_prazo?: string } {
  const prazoRegex = /prazo\s+de\s+(\d+)\s+dias?/gi;
  const intimacaoRegex = /intima[çc][ãa]o.*?(\d+)\s+dias?/gi;
  const citacaoRegex = /cita[çc][ãa]o.*?(\d+)\s+dias?/gi;
  
  let match = prazoRegex.exec(texto);
  if (match) {
    return { tem_prazo: true, dias_prazo: parseInt(match[1]), tipo_prazo: 'generico' };
  }
  
  match = intimacaoRegex.exec(texto);
  if (match) {
    return { tem_prazo: true, dias_prazo: parseInt(match[1]), tipo_prazo: 'intimacao' };
  }
  
  match = citacaoRegex.exec(texto);
  if (match) {
    return { tem_prazo: true, dias_prazo: parseInt(match[1]), tipo_prazo: 'citacao' };
  }
  
  return { tem_prazo: false };
}

async function calcularDataVencimento(
  dataInicio: string, 
  diasPrazo: number,
  supabase: any
): Promise<string> {
  // Buscar todos os feriados a partir da data de início
  const { data: feriados, error: feriadosError } = await supabase
    .from('feriados')
    .select('data')
    .gte('data', dataInicio);

  if (feriadosError) {
    console.error('Erro ao buscar feriados:', feriadosError);
    // Em caso de erro, usar cálculo simples como fallback
    const data = new Date(dataInicio);
    data.setDate(data.getDate() + diasPrazo);
    return data.toISOString().split('T')[0];
  }

  // Criar Set de datas de feriados para lookup rápido
  const feriadosSet = new Set(
    (feriados || []).map((f: any) => f.data)
  );

  let diasContados = 0;
  let dataAtual = new Date(dataInicio);

  while (diasContados < diasPrazo) {
    dataAtual.setDate(dataAtual.getDate() + 1);
    
    const diaSemana = dataAtual.getDay();
    const dataFormatada = dataAtual.toISOString().split('T')[0];
    
    // Pular finais de semana (0 = domingo, 6 = sábado)
    if (diaSemana === 0 || diaSemana === 6) {
      continue;
    }
    
    // Pular feriados
    if (feriadosSet.has(dataFormatada)) {
      continue;
    }
    
    diasContados++;
  }

  return dataAtual.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando sincronização de publicações do EasyJur...');

    // Buscar sessão ativa do EasyJur
    const { data: session, error: sessionError } = await supabase
      .from('easyjur_sessions')
      .select('*')
      .eq('is_active', true)
      .order('last_login_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError || !session) {
      console.error('Nenhuma sessão ativa encontrada:', sessionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma sessão ativa do EasyJur. Faça login primeiro.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sessão ativa encontrada, buscando publicações...');

    // Simular chamada ao EasyJur para buscar publicações
    // Em produção, isso seria uma chamada real à API do EasyJur
    const mockPublicacoes: Publicacao[] = [
      {
        numero_processo: '1000001-01.2025.8.06.0001',
        data_publicacao: '2025-01-20',
        tipo_publicacao: 'intimacao',
        texto_completo: 'Fica a parte intimada para apresentar manifestação no prazo de 15 dias, sob pena de preclusão.',
        tribunal: 'TJCE'
      },
      {
        numero_processo: '1000002-01.2025.8.06.0001',
        data_publicacao: '2025-01-21',
        tipo_publicacao: 'despacho',
        texto_completo: 'Defiro o pedido de dilação de prazo. Prazo de 30 dias para juntada de documentos.',
        tribunal: 'TJCE'
      }
    ];

    const results = {
      total: mockPublicacoes.length,
      novas: 0,
      duplicadas: 0,
      com_prazo: 0,
      erros: 0
    };

    for (const pub of mockPublicacoes) {
      try {
        const hash = createHash(pub.numero_processo + pub.data_publicacao + pub.texto_completo);
        
        // Verificar se publicação já existe
        const { data: existente } = await supabase
          .from('publicacoes')
          .select('id')
          .eq('hash_conteudo', hash)
          .maybeSingle();

        if (existente) {
          console.log(`Publicação duplicada detectada: ${pub.numero_processo}`);
          results.duplicadas++;
          continue;
        }

        // Detectar prazo no texto
        const prazoInfo = detectarPrazo(pub.texto_completo);
        
        // Buscar processo relacionado
        const { data: processo } = await supabase
          .from('processos')
          .select('id')
          .eq('numero_processo', pub.numero_processo)
          .maybeSingle();

        // Inserir publicação
        const { data: novaPublicacao, error: pubError } = await supabase
          .from('publicacoes')
          .insert({
            numero_processo: pub.numero_processo,
            data_publicacao: pub.data_publicacao,
            tipo_publicacao: pub.tipo_publicacao,
            texto_completo: pub.texto_completo,
            tribunal: pub.tribunal,
            hash_conteudo: hash,
            tem_prazo: prazoInfo.tem_prazo,
            status: 'pendente',
            processo_id: processo?.id || null,
            texto_resumido: pub.texto_completo.substring(0, 200) + '...'
          })
          .select()
          .single();

        if (pubError) {
          console.error('Erro ao inserir publicação:', pubError);
          results.erros++;
          continue;
        }

        console.log(`Nova publicação inserida: ${pub.numero_processo}`);
        results.novas++;

        // Se detectou prazo, criar registro de prazo processual
        if (prazoInfo.tem_prazo && prazoInfo.dias_prazo) {
          const dataVencimento = await calcularDataVencimento(pub.data_publicacao, prazoInfo.dias_prazo, supabase);
          
          const { error: prazoError } = await supabase
            .from('prazos_processuais')
            .insert({
              numero_processo: pub.numero_processo,
              processo_id: processo?.id || null,
              publicacao_id: novaPublicacao.id,
              tipo_prazo: prazoInfo.tipo_prazo || 'generico',
              descricao: `Prazo de ${prazoInfo.dias_prazo} dias identificado automaticamente`,
              dias_prazo: prazoInfo.dias_prazo,
              data_inicio: pub.data_publicacao,
              data_vencimento: dataVencimento,
              status: 'aberto',
              prioridade: 'alta'
            });

          if (prazoError) {
            console.error('Erro ao inserir prazo:', prazoError);
          } else {
            console.log(`Prazo processual criado: ${prazoInfo.dias_prazo} dias`);
            results.com_prazo++;
          }
        }

        // Log da operação
        await supabase.from('easyjur_auth_logs').insert({
          action: 'sync_publicacao',
          status: 'success',
          details: {
            numero_processo: pub.numero_processo,
            tem_prazo: prazoInfo.tem_prazo,
            tipo_publicacao: pub.tipo_publicacao
          }
        });

      } catch (error) {
        console.error(`Erro ao processar publicação ${pub.numero_processo}:`, error);
        results.erros++;
        
        await supabase.from('easyjur_auth_logs').insert({
          action: 'sync_publicacao',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
          details: { numero_processo: pub.numero_processo }
        });
      }
    }

    console.log('Sincronização concluída:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sincronização de publicações concluída',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
