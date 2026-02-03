import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CreateOrderDto } from '../types/order.types';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    if (!dto.product_id || !dto.customer_email || !dto.source_wallet_address) {
      throw new BadRequestException(
        'product_id, customer_email, and source_wallet_address are required',
      );
    }
    return this.ordersService.create(
      dto.product_id,
      dto.customer_email,
      dto.source_wallet_address,
    );
  }

  @Get()
  async getAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
