export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string | null
          data_nascimento: string | null
          endereco: string | null
          id: string
          idade: number | null
          nome: string
          numero: string | null
          profissao: string | null
          rg_cpf: string | null
          sexo: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          nome: string
          numero?: string | null
          profissao?: string | null
          rg_cpf?: string | null
          sexo?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          id?: string
          idade?: number | null
          nome?: string
          numero?: string | null
          profissao?: string | null
          rg_cpf?: string | null
          sexo?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fichas_avaliacao: {
        Row: {
          amamentando: boolean | null
          caracteristica_pelo_cor: string | null
          caracteristica_pelo_espessura: string | null
          cliente_id: string | null
          concordancia_tratamento: boolean | null
          created_at: string | null
          data_consentimento: string | null
          disfuncao_hormonal: boolean | null
          doenca_autoimune: boolean | null
          doenca_pele: boolean | null
          fototipo: string | null
          gestante: boolean | null
          id: string
          ja_fez_laser: boolean | null
          medicamento_cabelo_unha: boolean | null
          medicamento_continuo: boolean | null
          medicamento_fotossensibilizante: boolean | null
          observacoes: string | null
          qual_acido: string | null
          qual_alergia: string | null
          qual_disfuncao_hormonal: string | null
          qual_medicamento_cabelo_unha: string | null
          qual_medicamento_continuo: string | null
          qual_reposicao_hormonal: string | null
          qual_suplementacao: string | null
          reposicao_hormonal: boolean | null
          responsavel_legal: string | null
          sessoes_laser_anteriores: number | null
          tem_alergia: boolean | null
          termos_explicados: boolean | null
          updated_at: string | null
          usa_acido: boolean | null
          usa_protetor_solar: boolean | null
          usa_suplementacao: boolean | null
        }
        Insert: {
          amamentando?: boolean | null
          caracteristica_pelo_cor?: string | null
          caracteristica_pelo_espessura?: string | null
          cliente_id?: string | null
          concordancia_tratamento?: boolean | null
          created_at?: string | null
          data_consentimento?: string | null
          disfuncao_hormonal?: boolean | null
          doenca_autoimune?: boolean | null
          doenca_pele?: boolean | null
          fototipo?: string | null
          gestante?: boolean | null
          id?: string
          ja_fez_laser?: boolean | null
          medicamento_cabelo_unha?: boolean | null
          medicamento_continuo?: boolean | null
          medicamento_fotossensibilizante?: boolean | null
          observacoes?: string | null
          qual_acido?: string | null
          qual_alergia?: string | null
          qual_disfuncao_hormonal?: string | null
          qual_medicamento_cabelo_unha?: string | null
          qual_medicamento_continuo?: string | null
          qual_reposicao_hormonal?: string | null
          qual_suplementacao?: string | null
          reposicao_hormonal?: boolean | null
          responsavel_legal?: string | null
          sessoes_laser_anteriores?: number | null
          tem_alergia?: boolean | null
          termos_explicados?: boolean | null
          updated_at?: string | null
          usa_acido?: boolean | null
          usa_protetor_solar?: boolean | null
          usa_suplementacao?: boolean | null
        }
        Update: {
          amamentando?: boolean | null
          caracteristica_pelo_cor?: string | null
          caracteristica_pelo_espessura?: string | null
          cliente_id?: string | null
          concordancia_tratamento?: boolean | null
          created_at?: string | null
          data_consentimento?: string | null
          disfuncao_hormonal?: boolean | null
          doenca_autoimune?: boolean | null
          doenca_pele?: boolean | null
          fototipo?: string | null
          gestante?: boolean | null
          id?: string
          ja_fez_laser?: boolean | null
          medicamento_cabelo_unha?: boolean | null
          medicamento_continuo?: boolean | null
          medicamento_fotossensibilizante?: boolean | null
          observacoes?: string | null
          qual_acido?: string | null
          qual_alergia?: string | null
          qual_disfuncao_hormonal?: string | null
          qual_medicamento_cabelo_unha?: string | null
          qual_medicamento_continuo?: string | null
          qual_reposicao_hormonal?: string | null
          qual_suplementacao?: string | null
          reposicao_hormonal?: boolean | null
          responsavel_legal?: string | null
          sessoes_laser_anteriores?: number | null
          tem_alergia?: boolean | null
          termos_explicados?: boolean | null
          updated_at?: string | null
          usa_acido?: boolean | null
          usa_protetor_solar?: boolean | null
          usa_suplementacao?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fichas_avaliacao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fichas_avaliacao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_tratamentos_ativos"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      sessoes: {
        Row: {
          created_at: string | null
          data_sessao: string
          eh_reavaliacao: boolean | null
          id: string
          observacoes: string | null
          profissional_responsavel: string | null
          protocolo_utilizado: string | null
          tratamento_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_sessao: string
          eh_reavaliacao?: boolean | null
          id?: string
          observacoes?: string | null
          profissional_responsavel?: string | null
          protocolo_utilizado?: string | null
          tratamento_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_sessao?: string
          eh_reavaliacao?: boolean | null
          id?: string
          observacoes?: string | null
          profissional_responsavel?: string | null
          protocolo_utilizado?: string | null
          tratamento_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "clientes_tratamentos_ativos"
            referencedColumns: ["tratamento_id"]
          },
          {
            foreignKeyName: "sessoes_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos: {
        Row: {
          area_tratamento: string
          cliente_id: string | null
          created_at: string | null
          id: string
          observacoes_gerais: string | null
          sessoes_recomendadas: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          area_tratamento: string
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          observacoes_gerais?: string | null
          sessoes_recomendadas?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          area_tratamento?: string
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          observacoes_gerais?: string | null
          sessoes_recomendadas?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tratamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_tratamentos_ativos"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          tipo_usuario: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          tipo_usuario?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          tipo_usuario?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      clientes_tratamentos_ativos: {
        Row: {
          area_tratamento: string | null
          cliente_id: string | null
          cliente_nome: string | null
          sessoes_realizadas: number | null
          sessoes_recomendadas: number | null
          status: string | null
          telefone: string | null
          tratamento_id: string | null
        }
        Relationships: []
      }
      estatisticas_gerais: {
        Row: {
          sessoes_hoje: number | null
          total_clientes: number | null
          total_sessoes: number | null
          total_tratamentos: number | null
          tratamentos_ativos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      buscar_clientes: {
        Args: { termo_busca: string }
        Returns: {
          id: string
          nome: string
          telefone: string
          rg_cpf: string
          cidade: string
        }[]
      }
      proximas_sessoes: {
        Args: { dias_limite?: number }
        Returns: {
          sessao_id: string
          cliente_nome: string
          area_tratamento: string
          data_sessao: string
          profissional_responsavel: string
        }[]
      }
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
