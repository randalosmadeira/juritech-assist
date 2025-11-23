import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrasilAPIFeriado {
  date: string;
  name: string;
  type: string;
}

interface RequestBody {
  ano?: number;
  estado?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extrair parâmetros da requisição
    const body: RequestBody = req.method === 'POST' 
      ? await req.json().catch(() => ({}))
      : {};
    
    const ano = body.ano || new Date().getFullYear();
    const estado = body.estado || null;

    console.log(`Iniciando importação de feriados para o ano ${ano}...`);

    // Buscar feriados nacionais da BrasilAPI
    const apiUrl = `https://brasilapi.com.br/api/feriados/v1/${ano}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Erro ao buscar feriados da API: ${response.status} ${response.statusText}`);
    }

    const feriadosAPI: BrasilAPIFeriado[] = await response.json();
    console.log(`Feriados encontrados na API: ${feriadosAPI.length}`);

    const results = {
      total: feriadosAPI.length,
      novos: 0,
      duplicados: 0,
      erros: 0,
      feriados_importados: [] as string[]
    };

    // Processar cada feriado
    for (const feriado of feriadosAPI) {
      try {
        // Verificar se feriado já existe
        const { data: existente } = await supabase
          .from('feriados')
          .select('id')
          .eq('data', feriado.date)
          .eq('tipo', 'nacional')
          .maybeSingle();

        if (existente) {
          console.log(`Feriado duplicado: ${feriado.name} em ${feriado.date}`);
          results.duplicados++;
          continue;
        }

        // Mapear tipo da API para tipo do banco
        let tipoFeriado = 'nacional';
        if (feriado.type === 'national') {
          tipoFeriado = 'nacional';
        }

        // Inserir novo feriado
        const { error: insertError } = await supabase
          .from('feriados')
          .insert({
            data: feriado.date,
            descricao: feriado.name,
            tipo: tipoFeriado,
            estado: estado,
            municipio: null
          });

        if (insertError) {
          console.error(`Erro ao inserir feriado ${feriado.name}:`, insertError);
          results.erros++;
          continue;
        }

        console.log(`Feriado importado: ${feriado.name} em ${feriado.date}`);
        results.novos++;
        results.feriados_importados.push(`${feriado.name} (${feriado.date})`);

      } catch (error) {
        console.error(`Erro ao processar feriado ${feriado.name}:`, error);
        results.erros++;
      }
    }

    console.log('Importação concluída:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Importação de feriados do ano ${ano} concluída`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na importação:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: 'Verifique se a API BrasilAPI está disponível e se o ano é válido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
