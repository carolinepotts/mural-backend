/**
 * Types for Mural Pay account API response (GET /api/accounts/{id}).
 */

export interface MuralPayAccountBalance {
  tokenAmount: number;
  tokenSymbol: string;
}

export interface MuralPayAccountDetails {
  balances: MuralPayAccountBalance[];
}

export interface MuralPayAccountResponse {
  id: string;
  accountDetails?: MuralPayAccountDetails;
}
