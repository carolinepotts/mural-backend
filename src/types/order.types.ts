export type OrderStatus = 'PENDING' | 'PAID';

export interface Order {
  id: string;
  product_id: string;
  customer_email: string;
  price_usdc: string;
  status: OrderStatus;
  source_wallet_address: string;
  payment_transaction_date: string | null;
  payment_tx_hash: string | null;
  created_at: string;
}

export interface CreateOrderDto {
  product_id: string;
  customer_email: string;
  source_wallet_address: string;
}

export interface AccountCreditedPayload {
  type: 'account_credited';
  accountId: string;
  organizationId: string;
  transactionId: string;
  accountWalletAddress: string;
  tokenAmount: {
    blockchain: string;
    tokenAmount: number;
    tokenSymbol: string;
    tokenContractAddress: string;
  };
  transactionDetails: {
    blockchain: string;
    transactionDate: string;
    transactionHash: string;
    sourceWalletAddress: string;
    destinationWalletAddress: string;
  };
}

export type MuralPayWebhookPayload = {
  payload: AccountCreditedPayload | { type: string };
};
