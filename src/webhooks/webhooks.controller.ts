import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  AccountCreditedPayload,
  MuralPayWebhookPayload,
} from '../types/order.types';
import { AccountsService } from '../accounts/accounts.service';
import { OrdersService } from '../orders/orders.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';

type MuralPayEventHandler = (
  payload: MuralPayWebhookPayload,
) => Promise<void> | void;

const MERCHANT_WALLET_ADDRESS = '0xfb7814e50Af76Cea24e2174973000A45e134A2Bf';
const WITHDRAWAL_THRESHOLD_USDC = 10;

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  private readonly muralPayEventHandlers: Record<string, MuralPayEventHandler> =
    {
      account_credited: (payload) =>
        this.handleAccountCredited(payload.payload as AccountCreditedPayload),
    };

  constructor(
    private readonly ordersService: OrdersService,
    private readonly accountService: AccountsService,
    private readonly withdrawalsService: WithdrawalsService,
  ) {}

  @Post('muralpay')
  async muralpay(@Body() body: MuralPayWebhookPayload) {
    const payload = body?.payload;

    const handler = payload?.type
      ? this.muralPayEventHandlers[payload.type]
      : undefined;

    if (!handler) {
      this.logger.log(
        `MuralPay webhook: not an event we care about (type=${payload?.type ?? 'undefined'})`,
      );
      return { received: true };
    }

    await handler(body);
    return { received: true };
  }

  private async handleAccountCredited(
    payload: AccountCreditedPayload,
  ): Promise<void> {
    const { tokenAmount, accountWalletAddress } = payload;

    if (accountWalletAddress !== MERCHANT_WALLET_ADDRESS) {
      this.logger.log(
        `MuralPay webhook: not an event for our merchant account (accountWalletAddress=${accountWalletAddress})`,
      );
      return;
    }

    if (
      tokenAmount.blockchain !== 'POLYGON' ||
      tokenAmount.tokenSymbol !== 'USDC'
    ) {
      this.logger.log(
        `MuralPay webhook: not Polygon USDC (blockchain=${tokenAmount.blockchain}, symbol=${tokenAmount.tokenSymbol})`,
      );
      return;
    }

    await this.markOrderAsPaidIfNeeded(payload);

    await this.initiateWithdrawalIfNeeded(payload);
  }

  private async initiateWithdrawalIfNeeded(payload: AccountCreditedPayload) {
    const balance = await this.accountService.getWalletBalance(
      payload.accountId,
    );

    if (balance < WITHDRAWAL_THRESHOLD_USDC) {
      this.logger.log(
        `MuralPay: balance ${balance} USDC below threshold ${WITHDRAWAL_THRESHOLD_USDC}, skipping withdrawal`,
      );
      return;
    }

    await this.withdrawalsService.initiateWithdrawal(payload);
  }

  private async markOrderAsPaidIfNeeded(payload: AccountCreditedPayload) {
    const { transactionDetails, tokenAmount } = payload;
    const order =
      await this.ordersService.findOldestPendingOrderBySourceAndPrice(
        transactionDetails.sourceWalletAddress,
        tokenAmount.tokenAmount,
      );

    if (!order) {
      this.logger.log(
        `MuralPay webhook: could not match payment to an order (sourceWallet=${transactionDetails.sourceWalletAddress}, amount=${tokenAmount.tokenAmount})`,
      );
      return;
    }

    await this.ordersService.markOrderPaid(
      order.id,
      transactionDetails.transactionHash,
      transactionDetails.transactionDate,
    );
  }
}
