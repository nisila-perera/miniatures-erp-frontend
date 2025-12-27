export interface Painter {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PainterCreate {
  name: string;
  email?: string;
  phone?: string;
}

export interface PainterUpdate {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}
