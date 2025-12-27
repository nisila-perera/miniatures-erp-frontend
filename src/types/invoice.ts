export interface InvoiceTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceTemplateCreate {
  name: string;
  subject: string;
  body_html: string;
  is_default: boolean;
}

export interface InvoiceTemplateUpdate {
  name?: string;
  subject?: string;
  body_html?: string;
  is_default?: boolean;
}
