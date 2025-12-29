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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          id: string
          monthly_income: number | null
          name: string
          type: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_income?: number | null
          name: string
          type: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          monthly_income?: number | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          month: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          month: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          month?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          is_completed: boolean
          name: string
          notes: string | null
          target_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          is_completed?: boolean
          name: string
          notes?: string | null
          target_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          is_completed?: boolean
          name?: string
          notes?: string | null
          target_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      installments: {
        Row: {
          completed_payments: number
          created_at: string
          down_payment: number
          id: string
          interest_rate: number
          item_name: string
          monthly_payment: number
          next_due_date: string
          provider: string
          remaining_amount: number
          status: string
          total_amount: number
          total_payments: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_payments?: number
          created_at?: string
          down_payment?: number
          id?: string
          interest_rate?: number
          item_name: string
          monthly_payment: number
          next_due_date: string
          provider: string
          remaining_amount: number
          status?: string
          total_amount: number
          total_payments: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_payments?: number
          created_at?: string
          down_payment?: number
          id?: string
          interest_rate?: number
          item_name?: string
          monthly_payment?: number
          next_due_date?: string
          provider?: string
          remaining_amount?: number
          status?: string
          total_amount?: number
          total_payments?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          amount_owed: number
          created_at: string
          id: string
          monthly_payment: number
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_owed: number
          created_at?: string
          id?: string
          monthly_payment: number
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_owed?: number
          created_at?: string
          id?: string
          monthly_payment?: number
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          ticker: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          ticker: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          ticker?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          activity_type: string | null
          amount: number
          category_id: string | null
          created_at: string
          day_of_month: number
          frequency: string
          id: string
          is_active: boolean
          last_generated_date: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          day_of_month: number
          frequency: string
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          frequency?: string
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_income: {
        Row: {
          activity_type: string | null
          amount: number
          category_id: string | null
          created_at: string
          day_of_month: number
          frequency: string
          id: string
          is_active: boolean
          last_generated_date: string | null
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          day_of_month: number
          frequency: string
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          day_of_month?: number
          frequency?: string
          id?: string
          is_active?: boolean
          last_generated_date?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_income_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          activity_type: string | null
          amount: number
          category_id: string | null
          category_name: string
          created_at: string
          date: string
          description: string | null
          id: string
          installment_id: string | null
          receipt_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          amount: number
          category_id?: string | null
          category_name: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          installment_id?: string | null
          receipt_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          amount?: number
          category_id?: string | null
          category_name?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          installment_id?: string | null
          receipt_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
