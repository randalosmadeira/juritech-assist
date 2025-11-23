import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoria = formData.get('categoria') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    console.log('Processando arquivo:', file.name, 'para usuário:', user.id);

    // Upload para o Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `documentos/${fileName}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('documentos-juridicos')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw uploadError;
    }

    // Criar registro no banco com user_id
    const { data: documento, error: dbError } = await supabase
      .from('documentos_juridicos')
      .insert({
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        status: 'processando',
        categoria: categoria || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : null,
        user_id: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao criar registro:', dbError);
      throw dbError;
    }

    // Processar em background - criar vector store
    (async () => {
      try {
        console.log('Criando vector store para documento:', documento.id);

        // 1. Upload do arquivo para OpenAI
        const uploadFormData = new FormData();
        uploadFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name);
        uploadFormData.append('purpose', 'assistants');

        const uploadResponse = await fetch('https://ai.gateway.lovable.dev/v1/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 429) {
            throw new Error('Limite de requisições excedido. Tente novamente em alguns instantes.');
          }
          if (uploadResponse.status === 402) {
            throw new Error('Créditos do Lovable AI esgotados. Entre em contato com o administrador.');
          }
          const error = await uploadResponse.text();
          throw new Error(`Erro no upload Lovable AI: ${error}`);
        }

        const fileData = await uploadResponse.json();
        console.log('Arquivo enviado para OpenAI:', fileData.id);

        // 2. Criar vector store
        const vectorStoreResponse = await fetch('https://ai.gateway.lovable.dev/v1/vector_stores', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
          },
          body: JSON.stringify({
            name: file.name,
            file_ids: [fileData.id],
          }),
        });

        if (!vectorStoreResponse.ok) {
          if (vectorStoreResponse.status === 429) {
            throw new Error('Limite de requisições excedido. Tente novamente em alguns instantes.');
          }
          if (vectorStoreResponse.status === 402) {
            throw new Error('Créditos do Lovable AI esgotados. Entre em contato com o administrador.');
          }
          const error = await vectorStoreResponse.text();
          throw new Error(`Erro ao criar vector store: ${error}`);
        }

        const vectorStore = await vectorStoreResponse.json();
        console.log('Vector store criado:', vectorStore.id);

        // 3. Atualizar documento com IDs
        const { error: updateError } = await supabase
          .from('documentos_juridicos')
          .update({
            vector_store_id: vectorStore.id,
            file_id: fileData.id,
            status: 'pronto',
          })
          .eq('id', documento.id);

        if (updateError) {
          console.error('Erro ao atualizar documento:', updateError);
        } else {
          console.log('Documento processado com sucesso:', documento.id);
        }
      } catch (error) {
        console.error('Erro no processamento em background:', error);
        // Atualizar status para erro
        await supabase
          .from('documentos_juridicos')
          .update({ status: 'erro' })
          .eq('id', documento.id);
      }
    })().catch(console.error);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documento: {
          id: documento.id,
          nome_arquivo: documento.nome_arquivo,
          status: documento.status,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no upload:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
