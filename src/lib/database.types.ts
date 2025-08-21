export type UserRole = 'owner' | 'manager' | 'staff';
export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type FormStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type SubmissionStatus = 'draft' | 'submitted' | 'reviewed' | 'approved';

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: any | null; // JSONB
          subscription_tier: SubscriptionTier;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: any | null;
          subscription_tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: any | null;
          subscription_tier?: SubscriptionTier;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          business_id: string | null;
          role: UserRole;
          first_name: string | null;
          last_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          business_id?: string | null;
          role?: UserRole;
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          business_id?: string | null;
          role?: UserRole;
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_invitations: {
        Row: {
          id: string;
          business_id: string;
          email: string;
          role: UserRole;
          invited_by: string | null;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          email: string;
          role: UserRole;
          invited_by?: string | null;
          token: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          email?: string;
          role?: UserRole;
          invited_by?: string | null;
          token?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          date_of_birth: string | null;
          contact_info: any | null;
          medical_record_number: string | null;
          notes: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          date_of_birth?: string | null;
          contact_info?: any | null;
          medical_record_number?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          date_of_birth?: string | null;
          contact_info?: any | null;
          medical_record_number?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          template_schema: any;
          is_system_template: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          template_schema: any;
          is_system_template?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          template_schema?: any;
          is_system_template?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string | null;
          fields_schema: any;
          template_id: string | null;
          created_by: string | null;
          status: FormStatus;
          version: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description?: string | null;
          fields_schema: any;
          template_id?: string | null;
          created_by?: string | null;
          status?: FormStatus;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          description?: string | null;
          fields_schema?: any;
          template_id?: string | null;
          created_by?: string | null;
          status?: FormStatus;
          version?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_submissions: {
        Row: {
          id: string;
          form_id: string;
          client_id: string | null;
          submitted_by: string | null;
          submission_data: any;
          status: SubmissionStatus;
          submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          client_id?: string | null;
          submitted_by?: string | null;
          submission_data: any;
          status?: SubmissionStatus;
          submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          client_id?: string | null;
          submitted_by?: string | null;
          submission_data?: any;
          status?: SubmissionStatus;
          submitted_at?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string | null;
          user_id: string | null;
          table_name: string;
          record_id: string | null;
          action: string;
          old_values: any | null;
          new_values: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          user_id?: string | null;
          table_name: string;
          record_id?: string | null;
          action: string;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          user_id?: string | null;
          table_name?: string;
          record_id?: string | null;
          action?: string;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      subscription_tier: SubscriptionTier;
      form_status: FormStatus;
      submission_status: SubmissionStatus;
    };
  };
}
