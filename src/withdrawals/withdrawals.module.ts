import { Module } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';

@Module({
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
