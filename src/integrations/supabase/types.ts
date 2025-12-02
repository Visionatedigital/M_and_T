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
      asset_valuations: {
        Row: {
          collateral_id: string
          created_at: string
          id: string
          notes: string | null
          valuation_amount: number
          valuation_date: string
          valuation_method: string | null
          valued_by: string
        }
        Insert: {
          collateral_id: string
          created_at?: string
          id?: string
          notes?: string | null
          valuation_amount: number
          valuation_date: string
          valuation_method?: string | null
          valued_by: string
        }
        Update: {
          collateral_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          valuation_amount?: number
          valuation_date?: string
          valuation_method?: string | null
          valued_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_valuations_collateral_id_fkey"
            columns: ["collateral_id"]
            isOneToOne: false
            referencedRelation: "collateral"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_performance: {
        Row: {
          active_clients: number
          branch_id: string
          created_at: string
          default_rate: number | null
          id: string
          new_clients: number
          period_end: string
          period_start: string
          total_disbursed: number
          total_loans: number
          total_repayments: number
        }
        Insert: {
          active_clients?: number
          branch_id: string
          created_at?: string
          default_rate?: number | null
          id?: string
          new_clients?: number
          period_end: string
          period_start: string
          total_disbursed?: number
          total_loans?: number
          total_repayments?: number
        }
        Update: {
          active_clients?: number
          branch_id?: string
          created_at?: string
          default_rate?: number | null
          id?: string
          new_clients?: number
          period_end?: string
          period_start?: string
          total_disbursed?: number
          total_loans?: number
          total_repayments?: number
        }
        Relationships: [
          {
            foreignKeyName: "branch_performance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          code: string
          created_at: string
          email: string | null
          id: string
          manager_id: string | null
          name: string
          phone: string | null
          status: string
          territory_id: string | null
          updated_at: string
        }
        Insert: {
          address: string
          code: string
          created_at?: string
          email?: string | null
          id?: string
          manager_id?: string | null
          name: string
          phone?: string | null
          status?: string
          territory_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          phone?: string | null
          status?: string
          territory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      collateral: {
        Row: {
          created_at: string
          current_value: number | null
          description: string
          estimated_value: number
          id: string
          loan_application_id: string | null
          location: string | null
          notes: string | null
          registration_number: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description: string
          estimated_value: number
          id?: string
          loan_application_id?: string | null
          location?: string | null
          notes?: string | null
          registration_number?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string
          estimated_value?: number
          id?: string
          loan_application_id?: string | null
          location?: string | null
          notes?: string | null
          registration_number?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collateral_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      collateral_insurance: {
        Row: {
          collateral_id: string
          coverage_amount: number
          created_at: string
          expiry_date: string
          id: string
          insurance_company: string
          notes: string | null
          policy_number: string
          premium_amount: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          collateral_id: string
          coverage_amount: number
          created_at?: string
          expiry_date: string
          id?: string
          insurance_company: string
          notes?: string | null
          policy_number: string
          premium_amount: number
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          collateral_id?: string
          coverage_amount?: number
          created_at?: string
          expiry_date?: string
          id?: string
          insurance_company?: string
          notes?: string | null
          policy_number?: string
          premium_amount?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collateral_insurance_collateral_id_fkey"
            columns: ["collateral_id"]
            isOneToOne: false
            referencedRelation: "collateral"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interest_rate_settings: {
        Row: {
          base_rate: number
          created_at: string
          effective_from: string
          effective_to: string | null
          id: string
          margin: number | null
          notes: string | null
          product_id: string
          rate_type: string
        }
        Insert: {
          base_rate: number
          created_at?: string
          effective_from: string
          effective_to?: string | null
          id?: string
          margin?: number | null
          notes?: string | null
          product_id: string
          rate_type: string
        }
        Update: {
          base_rate?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          margin?: number | null
          notes?: string | null
          product_id?: string
          rate_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_rate_settings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          address: string
          approved_at: string | null
          assigned_officer_id: string | null
          created_at: string
          date_of_birth: string
          email: string
          employer_name: string | null
          employment_status: string
          full_name: string
          id: string
          id_number: string
          loan_amount: number
          loan_duration_months: number
          loan_product: string
          loan_purpose: string
          monthly_income: number | null
          phone_number: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          approved_at?: string | null
          assigned_officer_id?: string | null
          created_at?: string
          date_of_birth: string
          email: string
          employer_name?: string | null
          employment_status: string
          full_name: string
          id?: string
          id_number: string
          loan_amount: number
          loan_duration_months: number
          loan_product: string
          loan_purpose: string
          monthly_income?: number | null
          phone_number: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          approved_at?: string | null
          assigned_officer_id?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string
          employer_name?: string | null
          employment_status?: string
          full_name?: string
          id?: string
          id_number?: string
          loan_amount?: number
          loan_duration_months?: number
          loan_product?: string
          loan_purpose?: string
          monthly_income?: number | null
          phone_number?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_products: {
        Row: {
          base_interest_rate: number
          code: string
          created_at: string
          description: string | null
          id: string
          late_payment_penalty_rate: number | null
          max_amount: number
          max_duration_months: number
          min_amount: number
          min_duration_months: number
          name: string
          processing_fee_percentage: number
          status: string
          updated_at: string
        }
        Insert: {
          base_interest_rate: number
          code: string
          created_at?: string
          description?: string | null
          id?: string
          late_payment_penalty_rate?: number | null
          max_amount: number
          max_duration_months: number
          min_amount: number
          min_duration_months: number
          name: string
          processing_fee_percentage?: number
          status?: string
          updated_at?: string
        }
        Update: {
          base_interest_rate?: number
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          late_payment_penalty_rate?: number | null
          max_amount?: number
          max_duration_months?: number
          min_amount?: number
          min_duration_months?: number
          name?: string
          processing_fee_percentage?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_performance: {
        Row: {
          approved_applications: number
          average_loan_amount: number | null
          created_at: string
          default_rate: number | null
          id: string
          period_end: string
          period_start: string
          product_id: string
          rejected_applications: number
          total_applications: number
          total_disbursed: number
        }
        Insert: {
          approved_applications?: number
          average_loan_amount?: number | null
          created_at?: string
          default_rate?: number | null
          id?: string
          period_end: string
          period_start: string
          product_id: string
          rejected_applications?: number
          total_applications?: number
          total_disbursed?: number
        }
        Update: {
          approved_applications?: number
          average_loan_amount?: number | null
          created_at?: string
          default_rate?: number | null
          id?: string
          period_end?: string
          period_start?: string
          product_id?: string
          rejected_applications?: number
          total_applications?: number
          total_disbursed?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_performance_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          full_name: string
          id: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      territories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "loan_officer" | "client"
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
    Enums: {
      app_role: ["admin", "loan_officer", "client"],
    },
  },
} as const
