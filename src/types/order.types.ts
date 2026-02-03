export type OrderStatus = 'PENDING' | 'PAID';

export interface Order {
  id: string;
  product_id: string;
  customer_email: string;
  price_usdc: string;
  status: OrderStatus;
  source_wallet_address: string;
  payment_detected_at: string | null;
  payment_tx_hash: string | null;
  created_at: string;
}

export interface CreateOrderDto {
  product_id: string;
  customer_email: string;
  source_wallet_address: string;
}
