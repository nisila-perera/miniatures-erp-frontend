export interface Resin {
  id: string;
  color: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  purchase_date: string;
  purchase_source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResinCreate {
  color: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  purchase_date: string;
  purchase_source?: string;
  notes?: string;
}

export interface PaintBottle {
  id: string;
  color: string;
  brand: string;
  volume_ml: number;
  current_volume_ml: number;
  cost: number;
  purchase_date: string;
  purchase_source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaintBottleCreate {
  color: string;
  brand: string;
  volume_ml: number;
  current_volume_ml: number;
  cost: number;
  purchase_date: string;
  purchase_source?: string;
  notes?: string;
}
