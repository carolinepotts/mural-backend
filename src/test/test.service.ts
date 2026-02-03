import { Injectable } from '@nestjs/common';
import { TestItem } from '../types/test-item.types';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TestService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<TestItem[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('test_items')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch test items: ${error.message}`);
    }

    return data ?? [];
  }

  async create(name: string): Promise<TestItem> {
    const { data, error } = await this.supabase
      .getClient()
      .from('test_items')
      .insert({ name })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test item: ${error.message}`);
    }

    return data;
  }
}
