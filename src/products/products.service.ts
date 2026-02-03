import { Injectable } from '@nestjs/common';
import { Product } from '../types/product.types';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('products')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data ?? [];
  }
}
