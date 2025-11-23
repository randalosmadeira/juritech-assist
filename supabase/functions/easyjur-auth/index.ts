import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthResponse {
  success: boolean
  sessionId?: string
  message?: string
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action } = await req.json()
    
    console.log(`[EasyJur Auth] Action: ${action}`)

    if (action === 'login') {
      const username = Deno.env.get('EASYJUR_USERNAME')
      const password = Deno.env.get('EASYJUR_PASSWORD')

      if (!username || !password) {
        throw new Error('Credenciais do EasyJur não configuradas')
      }

      // Log início da tentativa de login
      await supabaseClient
        .from('easyjur_auth_logs')
        .insert({
          action: 'login_attempt',
          status: 'started',
          details: { timestamp: new Date().toISOString() }
        })

      console.log('[EasyJur Auth] Iniciando login no EasyJur...')
      
      // CENÁRIO A: Se houver API oficial (futuro)
      // const apiResponse = await fetch('https://api.easyjur.com/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // })

      // CENÁRIO B: RPA/Automação de navegador (atual)
      // Nota: Esta implementação é um placeholder que simula o processo
      // Em produção, seria necessário usar Puppeteer ou similar
      
      // Simulação de login bem-sucedido para desenvolvimento
      const mockSessionData = {
        sessionId: crypto.randomUUID(),
        loginUrl: 'https://app.easyjur.com/acesso/login.php',
        authenticatedAt: new Date().toISOString(),
        method: 'RPA_PLACEHOLDER'
      }

      // Salvar sessão no banco
      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('easyjur_sessions')
        .upsert({
          id: crypto.randomUUID(),
          session_data: mockSessionData,
          is_active: true,
          last_login_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        }, { onConflict: 'id' })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Log sucesso
      await supabaseClient
        .from('easyjur_auth_logs')
        .insert({
          action: 'login_attempt',
          status: 'success',
          details: { 
            sessionId: mockSessionData.sessionId,
            timestamp: new Date().toISOString()
          }
        })

      console.log('[EasyJur Auth] Login realizado com sucesso')

      const response: AuthResponse = {
        success: true,
        sessionId: mockSessionData.sessionId,
        message: 'Autenticação realizada com sucesso (modo desenvolvimento)'
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'check_session') {
      // Verificar se há sessão ativa
      const { data: sessions, error: checkError } = await supabaseClient
        .from('easyjur_sessions')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (checkError) throw checkError

      const hasActiveSession = sessions && sessions.length > 0

      console.log(`[EasyJur Auth] Sessão ativa: ${hasActiveSession}`)

      const response: AuthResponse = {
        success: hasActiveSession,
        sessionId: sessions?.[0]?.session_data?.sessionId,
        message: hasActiveSession 
          ? 'Sessão ativa encontrada' 
          : 'Nenhuma sessão ativa'
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Ação não reconhecida')

  } catch (error) {
    console.error('[EasyJur Auth] Erro:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

    const response: AuthResponse = {
      success: false,
      error: errorMessage
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})