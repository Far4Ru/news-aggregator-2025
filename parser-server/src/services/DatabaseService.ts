import { createClient } from '@supabase/supabase-js';
import { config } from '../utils/config';
import { NewsItem, Source } from '../types';

export class DatabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey);
  }

  async getSources(): Promise<Source[]> {
    const { data, error } = await this.supabase
      .from('sources')
      .select('*')
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
    return data || [];
  }

  async createNews(newsItems: NewsItem[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    // Проверяем на дубликаты перед вставкой
    for (const item of newsItems) {
      try {
        const { error } = await this.supabase
          .from('news')
          .insert([item]);

        if (error) {
          errors.push(`Failed to insert "${item.title}": ${error.message}`);
        } else {
          successCount++;
        }
      } catch (error) {
        errors.push(`Error inserting "${item.title}": ${error}`);
      }
    }

    return { success: successCount, errors };
  }

  async checkDuplicate(title: string, sourceId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('news')
      .select('id')
      .eq('source_id', sourceId)
      .ilike('title', `%${title.substring(0, 50)}%`)
      .limit(1);

    if (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }

    return data && data.length > 0;
  }
}