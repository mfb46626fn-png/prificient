export type PaymentGatewayInfo = {
  rate: number;
  fixed: number;
  active: boolean;
};

export type StoreSettings = {
  user_id?: string;
  company_type: string;
  active_channels: Record<string, boolean>;
  payment_gateways: Record<string, PaymentGatewayInfo>;
  avg_shipping_cost: number;
  avg_packaging_cost: number;
  currency?: string;
  updated_at?: string;
};

// Platform Intelligence Types
export type PlatformRule = {
  name: string;
  commission_rate: number;
  transaction_fee_rate: number;
  payment_processor_fee_rate: number;
  fixed_fee: number;
  description: string;
}
