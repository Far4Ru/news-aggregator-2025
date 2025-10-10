import { createClient } from '@supabase/supabase-js';
import { config } from '../utils/config';
import { NewsItem, Source } from '../types';

interface Result {
  success: any,
  error: any
}
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

  async createShortContent(item: NewsItem): Promise<Result> {
    const result: Result = {
      success: null,
      error: null,
    }
    try {
      const shortContentItem = {
        content_text: item.short_content,
        created_at: item.created_at,
      }
      const { data, error } = await this.supabase
        .from('short_contents')
        .insert([shortContentItem]);
      console.log(data, error)
      if (Array.isArray(data)) {
        result.success = data[0]
      }
      result.error = error
    } catch (error) {
      result.error = error
    }
    return result;
  }

  async createNews(newsItems: NewsItem[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let successCount = 0;

    // Проверяем на дубликаты перед вставкой
    for (const item of newsItems) {
      try {
        const shortContentResult = await this.createShortContent(item);
        if (shortContentResult.success) {
          const newsItem = {
            source_id: item.source_id,
            published_at: item.published_at,
            url: item.url,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            original_content: item.content,
            short_content_id: shortContentResult.success.id
          }
          const { error } = await this.supabase
            .from('news')
            .insert([newsItem]);

          console.log(error)
          if (error) {
            errors.push(`Failed to insert "${item.title}": ${error.message}`);
          } else {
            successCount++;
          }
        } else {
          errors.push(shortContentResult.error)
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