import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../types/order.types';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrdersService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(
    productId: string,
    customerEmail: string,
    sourceWalletAddress: string,
  ): Promise<Order> {
    const { data: product, error: productError } = await this.supabase
      .getClient()
      .from('products')
      .select('id, price_usdc')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new NotFoundException(
        `Product not found: ${productId}. ${productError?.message ?? ''}`.trim(),
      );
    }

    const priceUsdc = product.price_usdc;
    if (priceUsdc == null) {
      throw new BadRequestException(
        `Product ${productId} has no price_usdc set`,
      );
    }

    const { data: order, error: orderError } = await this.supabase
      .getClient()
      .from('orders')
      .insert({
        product_id: productId,
        customer_email: customerEmail,
        price_usdc: priceUsdc,
        source_wallet_address: sourceWalletAddress,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    return order as Order;
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return (data ?? []) as Order[];
  }

  async findOne(id: string): Promise<Order> {
    const { data, error } = await this.supabase
      .getClient()
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `Order not found: ${id}. ${error?.message ?? ''}`.trim(),
      );
    }

    return data as Order;
  }
}
