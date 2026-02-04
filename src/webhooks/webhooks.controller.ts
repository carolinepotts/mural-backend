import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  AccountCreditedPayload,
  MuralPayWebhookPayload,
} from '../types/order.types';
import { OrdersService } from '../orders/orders.service';

type MuralPayEventHandler = (
  payload: MuralPayWebhookPayload,
) => Promise<void> | void;

const MERCHANT_WALLET_ADDRESS = '0xfb7814e50Af76Cea24e2174973000A45e134A2Bf';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  private readonly muralPayEventHandlers: Record<string, MuralPayEventHandler> =
    {
      account_credited: (payload) =>
        this.handleAccountCredited(payload.payload as AccountCreditedPayload),
    };

  constructor(private readonly ordersService: OrdersService) {}

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
    const { tokenAmount, transactionDetails, accountWalletAddress } = payload;

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
