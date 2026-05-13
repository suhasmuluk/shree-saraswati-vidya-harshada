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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          status: string
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          metadata: Json | null
          performed_at: string
          performed_by: string | null
          reason: string | null
        }
        Insert: {
          action: string
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          exam_date: string
          exam_name: string
          grade: string | null
          id: string
          marks_obtained: number
          remarks: string | null
          result_status: string
          student_id: string
          subject: string
          total_marks: number
        }
        Insert: {
          created_at?: string
          exam_date?: string
          exam_name: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          remarks?: string | null
          result_status?: string
          student_id: string
          subject: string
          total_marks?: number
        }
        Update: {
          created_at?: string
          exam_date?: string
          exam_name?: string
          grade?: string | null
          id?: string
          marks_obtained?: number
          remarks?: string | null
          result_status?: string
          student_id?: string
          subject?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          month: string
          payment_mode: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          month: string
          payment_mode?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          month?: string
          payment_mode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          payment_date: string | null
          payment_mode: string | null
          payment_status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          month: string
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          address: string | null
          alternate_contact: string | null
          class_interested: string | null
          contact_number: string
          converted_student_id: string | null
          created_at: string
          email: string | null
          id: string
          inquiry_date: string
          parent_name: string
          previous_school: string | null
          remarks: string | null
          source: string
          status: string
          student_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          alternate_contact?: string | null
          class_interested?: string | null
          contact_number: string
          converted_student_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inquiry_date?: string
          parent_name: string
          previous_school?: string | null
          remarks?: string | null
          source?: string
          status?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          alternate_contact?: string | null
          class_interested?: string | null
          contact_number?: string
          converted_student_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inquiry_date?: string
          parent_name?: string
          previous_school?: string | null
          remarks?: string | null
          source?: string
          status?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_converted_student_id_fkey"
            columns: ["converted_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      salaries: {
        Row: {
          base_salary: number
          created_at: string
          deduction: number
          half_days: number
          id: string
          month: string
          net_salary: number
          payment_date: string | null
          payment_status: string
          person_id: string
          person_type: string
          present_days: number
          updated_at: string
          working_days: number
        }
        Insert: {
          base_salary?: number
          created_at?: string
          deduction?: number
          half_days?: number
          id?: string
          month: string
          net_salary?: number
          payment_date?: string | null
          payment_status?: string
          person_id: string
          person_type: string
          present_days?: number
          updated_at?: string
          working_days?: number
        }
        Update: {
          base_salary?: number
          created_at?: string
          deduction?: number
          half_days?: number
          id?: string
          month?: string
          net_salary?: number
          payment_date?: string | null
          payment_status?: string
          person_id?: string
          person_type?: string
          present_days?: number
          updated_at?: string
          working_days?: number
        }
        Relationships: []
      }
      siblings: {
        Row: {
          created_at: string
          id: string
          linked_student_id: string | null
          relationship: string
          sibling_class: string | null
          sibling_name: string
          sibling_section: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_student_id?: string | null
          relationship?: string
          sibling_class?: string | null
          sibling_name: string
          sibling_section?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_student_id?: string | null
          relationship?: string
          sibling_class?: string | null
          sibling_name?: string
          sibling_section?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "siblings_linked_student_id_fkey"
            columns: ["linked_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "siblings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          archive_reason: string | null
          archived_at: string | null
          base_salary: number
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          name: string
          phone: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          base_salary?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          name: string
          phone: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          base_salary?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          name?: string
          phone?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          person_id: string
          person_type: string
          status: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          person_id: string
          person_type: string
          status: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          person_id?: string
          person_type?: string
          status?: string
        }
        Relationships: []
      }
      student_achievements: {
        Row: {
          achievement_date: string
          category: string
          created_at: string
          description: string | null
          id: string
          student_id: string
          title: string
        }
        Insert: {
          achievement_date?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          student_id: string
          title: string
        }
        Update: {
          achievement_date?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_date: string
          archive_reason: string | null
          archived_at: string | null
          books_issued: boolean
          class_id: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          gender: string | null
          has_transport: boolean
          id: string
          inquiry_id: string | null
          is_active: boolean
          is_deleted: boolean
          items_issue_date: string | null
          items_remarks: string | null
          materials_issued: boolean
          name: string
          parent_name: string
          parent_phone: string
          photo_url: string | null
          status: string
          transport_route: string | null
          transport_type: string | null
          uniform_issued: boolean
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string
          archive_reason?: string | null
          archived_at?: string | null
          books_issued?: boolean
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          gender?: string | null
          has_transport?: boolean
          id?: string
          inquiry_id?: string | null
          is_active?: boolean
          is_deleted?: boolean
          items_issue_date?: string | null
          items_remarks?: string | null
          materials_issued?: boolean
          name: string
          parent_name: string
          parent_phone: string
          photo_url?: string | null
          status?: string
          transport_route?: string | null
          transport_type?: string | null
          uniform_issued?: boolean
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string
          archive_reason?: string | null
          archived_at?: string | null
          books_issued?: boolean
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          gender?: string | null
          has_transport?: boolean
          id?: string
          inquiry_id?: string | null
          is_active?: boolean
          is_deleted?: boolean
          items_issue_date?: string | null
          items_remarks?: string | null
          materials_issued?: boolean
          name?: string
          parent_name?: string
          parent_phone?: string
          photo_url?: string | null
          status?: string
          transport_route?: string | null
          transport_type?: string | null
          uniform_issued?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          base_salary: number
          class_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          is_deleted: boolean
          name: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          base_salary?: number
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          name: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          base_salary?: number
          class_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          name?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer"
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
      app_role: ["admin", "manager", "viewer"],
    },
  },
} as const
