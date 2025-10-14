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
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          diagnosis: string | null
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          patient_id: string
          prescription: string | null
          reason: string
          status: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescription?: string | null
          reason: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescription?: string | null
          reason?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_credentials: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string | null
          id: string
          languages: string[] | null
          license_number: string
          medical_school: string | null
          specialization: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          years_of_experience: number
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          languages?: string[] | null
          license_number: string
          medical_school?: string | null
          specialization: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          years_of_experience: number
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string | null
          id?: string
          languages?: string[] | null
          license_number?: string
          medical_school?: string | null
          specialization?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          years_of_experience?: number
        }
        Relationships: []
      }
      patient_medical_history: {
        Row: {
          alcohol_consumption: string | null
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          created_at: string | null
          current_medications: string[] | null
          exercise_frequency: string | null
          family_history: string[] | null
          height_cm: number | null
          id: string
          past_surgeries: string[] | null
          patient_id: string
          smoking_status: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          alcohol_consumption?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          current_medications?: string[] | null
          exercise_frequency?: string | null
          family_history?: string[] | null
          height_cm?: number | null
          id?: string
          past_surgeries?: string[] | null
          patient_id: string
          smoking_status?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          alcohol_consumption?: string | null
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          created_at?: string | null
          current_medications?: string[] | null
          exercise_frequency?: string | null
          family_history?: string[] | null
          height_cm?: number | null
          id?: string
          past_surgeries?: string[] | null
          patient_id?: string
          smoking_status?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          advice: string | null
          created_at: string
          diagnosis: string
          doctor_id: string
          id: string
          medicines: Json
          patient_age: number
          patient_id: string
          patient_name: string
          prescription_date: string
          updated_at: string
        }
        Insert: {
          advice?: string | null
          created_at?: string
          diagnosis: string
          doctor_id: string
          id?: string
          medicines: Json
          patient_age: number
          patient_id: string
          patient_name: string
          prescription_date?: string
          updated_at?: string
        }
        Update: {
          advice?: string | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string
          id?: string
          medicines?: Json
          patient_age?: number
          patient_id?: string
          patient_name?: string
          prescription_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      symptom_checks: {
        Row: {
          age_range: string | null
          ai_analysis: Json
          conditions_identified: string[] | null
          created_at: string | null
          duration: string | null
          id: string
          is_emergency: boolean | null
          severity: string | null
          severity_level: string | null
          symptoms: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          ai_analysis: Json
          conditions_identified?: string[] | null
          created_at?: string | null
          duration?: string | null
          id?: string
          is_emergency?: boolean | null
          severity?: string | null
          severity_level?: string | null
          symptoms: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          ai_analysis?: Json
          conditions_identified?: string[] | null
          created_at?: string | null
          duration?: string | null
          id?: string
          is_emergency?: boolean | null
          severity?: string | null
          severity_level?: string | null
          symptoms?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "doctor" | "patient"
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
      app_role: ["doctor", "patient"],
    },
  },
} as const
