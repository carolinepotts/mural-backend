import { Injectable, Logger } from '@nestjs/common';
import { AccountCreditedPayload } from '../types/order.types';

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  /**
   * Stub: will be implemented to call Mural Pay withdrawal API and persist to Supabase.
   */
  async initiateWithdrawal(_payload: AccountCreditedPayload): Promise<void> {
    this.logger.log(
      'initiateWithdrawal called (stub); real implementation pending',
    );
  }
}
