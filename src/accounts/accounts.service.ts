import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MuralPayAccountResponse } from '../types/account.types';

const DEFAULT_MURAL_API_URL = 'https://api.muralpay.com';

@Injectable()
export class AccountsService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('MURAL_API_URL') ?? DEFAULT_MURAL_API_URL;
    this.apiKey = this.configService.get<string>('MURAL_API_KEY') ?? '';

    if (!this.apiKey) {
      throw new Error('MURAL_API_KEY must be set in environment');
    }
  }

  /**
   * Fetches the USDC wallet balance for the given Mural Pay account ID.
   * Returns 0 if no USDC balance entry is present.
   */
  async getWalletBalance(accountId: string): Promise<number> {
    const url = `${this.baseUrl}/api/accounts/${accountId}`;
    let response;
    try {
      response = await firstValueFrom(
        this.httpService.get<MuralPayAccountResponse>(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }),
      );
    } catch (err) {
      const message = err?.response?.data ?? err?.message ?? err;
      throw new Error(`Failed to fetch account balance: ${message}`);
    }

    const data = response.data;
    const balances = data?.accountDetails?.balances ?? [];
    const usdc = balances.find((b) => b.tokenSymbol === 'USDC');
    return usdc?.tokenAmount ?? 0;
  }
}
