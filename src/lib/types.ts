export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'datetime' | 'number' | 'email' | 'phone' | 'file' | 'signature' | 'rating';
  label: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: string[]; // For select, multiselect, radio
  conditionalLogic?: {
    showIf: {
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
      value: any;
    };
  };
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  settings: {
    allowMultipleSubmissions: boolean;
    requireClientSelection: boolean;
    enableDrafts: boolean;
    enableSignatures: boolean;
  };
}

// Submission data structure
export interface SubmissionData {
  [fieldId: string]: any;
}

// Extended types with relationships
export interface UserWithBusiness extends Database['public']['Tables']['users']['Row'] {
  business?: Database['public']['Tables']['businesses']['Row'];
}

export interface FormWithSubmissions extends Database['public']['Tables']['forms']['Row'] {
  submissions?: Database['public']['Tables']['form_submissions']['Row'][];
  submissionCount?: number;
}

export interface SubmissionWithDetails extends Database['public']['Tables']['form_submissions']['Row'] {
  form?: Database['public']['Tables']['forms']['Row'];
  client?: Database['public']['Tables']['clients']['Row'];
  submitted_by_user?: Database['public']['Tables']['users']['Row'];
}