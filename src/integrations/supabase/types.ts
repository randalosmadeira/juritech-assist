export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      auditorias: {
        Row: {
          campos_divergentes: Json | null
          categoria: string
          created_at: string
          data_identificacao: string
          data_limite: string | null
          data_resolucao: string | null
          descricao: string
          entidade_afetada: string | null
          entidade_id: string | null
          evidencias: Json | null
          id: string
          metadados: Json | null
          observacoes: string | null
          prioridade: string | null
          responsavel: string | null
          status: string | null
          sugestao_correcao: string | null
          tipo_auditoria: string
          titulo: string
          updated_at: string
        }
        Insert: {
          campos_divergentes?: Json | null
          categoria: string
          created_at?: string
          data_identificacao?: string
          data_limite?: string | null
          data_resolucao?: string | null
          descricao: string
          entidade_afetada?: string | null
          entidade_id?: string | null
          evidencias?: Json | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          prioridade?: string | null
          responsavel?: string | null
          status?: string | null
          sugestao_correcao?: string | null
          tipo_auditoria: string
          titulo: string
          updated_at?: string
        }
        Update: {
          campos_divergentes?: Json | null
          categoria?: string
          created_at?: string
          data_identificacao?: string
          data_limite?: string | null
          data_resolucao?: string | null
          descricao?: string
          entidade_afetada?: string | null
          entidade_id?: string | null
          evidencias?: Json | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          prioridade?: string | null
          responsavel?: string | null
          status?: string | null
          sugestao_correcao?: string | null
          tipo_auditoria?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          dados_adicionais: Json | null
          email: string | null
          endereco: string | null
          id: string
          nome_completo: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          dados_adicionais?: Json | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome_completo: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          dados_adicionais?: Json | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome_completo?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      easyjur_auth_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      easyjur_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_error: string | null
          last_login_at: string | null
          session_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_login_at?: string | null
          session_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_login_at?: string | null
          session_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      feriados: {
        Row: {
          created_at: string
          data: string
          descricao: string
          estado: string | null
          id: string
          municipio: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao: string
          estado?: string | null
          id?: string
          municipio?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          estado?: string | null
          id?: string
          municipio?: string | null
          tipo?: string
        }
        Relationships: []
      }
      prazos_processuais: {
        Row: {
          base_legal: string | null
          created_at: string
          data_inicio: string
          data_vencimento: string
          descricao: string
          dias_prazo: number
          dias_restantes: number | null
          id: string
          metadados: Json | null
          numero_processo: string
          observacoes: string | null
          prioridade: string | null
          processo_id: string | null
          publicacao_id: string | null
          responsavel: string | null
          status: string | null
          tipo_prazo: string
          tipo_processo: string | null
          updated_at: string
        }
        Insert: {
          base_legal?: string | null
          created_at?: string
          data_inicio: string
          data_vencimento: string
          descricao: string
          dias_prazo: number
          dias_restantes?: number | null
          id?: string
          metadados?: Json | null
          numero_processo: string
          observacoes?: string | null
          prioridade?: string | null
          processo_id?: string | null
          publicacao_id?: string | null
          responsavel?: string | null
          status?: string | null
          tipo_prazo: string
          tipo_processo?: string | null
          updated_at?: string
        }
        Update: {
          base_legal?: string | null
          created_at?: string
          data_inicio?: string
          data_vencimento?: string
          descricao?: string
          dias_prazo?: number
          dias_restantes?: number | null
          id?: string
          metadados?: Json | null
          numero_processo?: string
          observacoes?: string | null
          prioridade?: string | null
          processo_id?: string | null
          publicacao_id?: string | null
          responsavel?: string | null
          status?: string | null
          tipo_prazo?: string
          tipo_processo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prazos_processuais_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prazos_processuais_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: false
            referencedRelation: "publicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          cliente_id: string | null
          created_at: string
          dados_adicionais: Json | null
          data_distribuicao: string | null
          fase_processual: string | null
          id: string
          numero_processo: string
          polo: string | null
          status: string | null
          tipo_acao: string | null
          tipo_processo: string | null
          tribunal: string
          updated_at: string
          valor_causa: number | null
          vara: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          dados_adicionais?: Json | null
          data_distribuicao?: string | null
          fase_processual?: string | null
          id?: string
          numero_processo: string
          polo?: string | null
          status?: string | null
          tipo_acao?: string | null
          tipo_processo?: string | null
          tribunal: string
          updated_at?: string
          valor_causa?: number | null
          vara?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          dados_adicionais?: Json | null
          data_distribuicao?: string | null
          fase_processual?: string | null
          id?: string
          numero_processo?: string
          polo?: string | null
          status?: string | null
          tipo_acao?: string | null
          tipo_processo?: string | null
          tribunal?: string
          updated_at?: string
          valor_causa?: number | null
          vara?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      publicacoes: {
        Row: {
          created_at: string
          data_leitura: string | null
          data_notificacao: string | null
          data_publicacao: string
          hash_conteudo: string
          id: string
          metadados: Json | null
          notificado_cliente: boolean | null
          numero_processo: string
          processo_id: string | null
          status: string | null
          tem_prazo: boolean | null
          texto_completo: string
          texto_resumido: string | null
          tipo_publicacao: string
          tribunal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          data_notificacao?: string | null
          data_publicacao: string
          hash_conteudo: string
          id?: string
          metadados?: Json | null
          notificado_cliente?: boolean | null
          numero_processo: string
          processo_id?: string | null
          status?: string | null
          tem_prazo?: boolean | null
          texto_completo: string
          texto_resumido?: string | null
          tipo_publicacao: string
          tribunal: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          data_notificacao?: string | null
          data_publicacao?: string
          hash_conteudo?: string
          id?: string
          metadados?: Json | null
          notificado_cliente?: boolean | null
          numero_processo?: string
          processo_id?: string | null
          status?: string | null
          tem_prazo?: boolean | null
          texto_completo?: string
          texto_resumido?: string | null
          tipo_publicacao?: string
          tribunal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicacoes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_limite: string | null
          descricao: string | null
          estimativa_horas: number | null
          id: string
          metadados: Json | null
          observacoes: string | null
          prazo_id: string | null
          prioridade: string | null
          processo_id: string | null
          publicacao_id: string | null
          responsavel: string | null
          status: string | null
          tags: string[] | null
          tipo_tarefa: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_limite?: string | null
          descricao?: string | null
          estimativa_horas?: number | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          prazo_id?: string | null
          prioridade?: string | null
          processo_id?: string | null
          publicacao_id?: string | null
          responsavel?: string | null
          status?: string | null
          tags?: string[] | null
          tipo_tarefa: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_limite?: string | null
          descricao?: string | null
          estimativa_horas?: number | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          prazo_id?: string | null
          prioridade?: string | null
          processo_id?: string | null
          publicacao_id?: string | null
          responsavel?: string | null
          status?: string | null
          tags?: string[] | null
          tipo_tarefa?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_prazo_id_fkey"
            columns: ["prazo_id"]
            isOneToOne: false
            referencedRelation: "prazos_processuais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_publicacao_id_fkey"
            columns: ["publicacao_id"]
            isOneToOne: false
            referencedRelation: "publicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          dados_contexto: Json | null
          etapa_atual: string
          historico_etapas: Json | null
          id: string
          nome_workflow: string
          processo_id: string | null
          progresso: number | null
          status: string | null
          tipo_workflow: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dados_contexto?: Json | null
          etapa_atual: string
          historico_etapas?: Json | null
          id?: string
          nome_workflow: string
          processo_id?: string | null
          progresso?: number | null
          status?: string | null
          tipo_workflow: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dados_contexto?: Json | null
          etapa_atual?: string
          historico_etapas?: Json | null
          id?: string
          nome_workflow?: string
          processo_id?: string | null
          progresso?: number | null
          status?: string | null
          tipo_workflow?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
