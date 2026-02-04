import { Body, Controller, Logger, Post } from '@nestjs/common';
import {
  AccountCreditedPayload,
  MuralPayWebhookPayload,
} from '../types/order.types';
import { OrdersService } from '../orders/orders.service';

type MuralPayEventHandler = (
  payload: MuralPayWebhookPayload,
) => Promise<void> | void;

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  private readonly muralPayEventHandlers: Record<string, MuralPayEventHandler> =
    {
      account_credited: (payload) =>
        this.handleAccountCredited(payload as AccountCreditedPayload),
    };

  constructor(private readonly ordersService: OrdersService) {}

  @Post('muralpay')
  async muralpay(@Body() body: MuralPayWebhookPayload) {
    const handler = body?.type
      ? this.muralPayEventHandlers[body.type]
      : undefined;

    if (!handler) {
      this.logger.log(
        `MuralPay webhook: not an event we care about (type=${body?.type ?? 'undefined'})`,
      );
      return { received: true };
    }

    await handler(body);
    return { received: true };
  }

  private async handleAccountCredited(
    payload: AccountCreditedPayload,
  ): Promise<void> {
    const { tokenAmount, transactionDetails } = payload;

    if (
      tokenAmount.blockchain !== 'polygon' ||
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
