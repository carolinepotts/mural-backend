import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { OrdersModule } from '../orders/orders.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [OrdersModule, AccountsModule, WithdrawalsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
