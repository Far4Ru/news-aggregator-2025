import Parser from 'rss-parser';
import { BaseParser } from '../base/BaseParser';
import { ParseResult, NewsItem } from '../../types';
import { Helpers } from '../../utils/helpers';

interface CacheData {
  data: NewsItem[];
  timestamp: number;
}

interface RSSFeed {
  url: string;
  name: string;
  sourceName: string;
}

export class RSSParser extends BaseParser {
  private parser: Parser;
  private cache: CacheData | null = null;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 минут

  constructor(sourceId: string, sourceUrl: string, config: any) {
    super(sourceId, sourceUrl, 'rss', config);
    this.parser = new Parser({
      timeout: this.config.timeout,
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['description', 'description'],
          ['pubDate', 'pubDate'],
          ['contentSnippet', 'contentSnippet']
        ]
      }
    });
  }

  async parse(): Promise<ParseResult> {
    try {
      // const { limit = 20, source } = this.config;

      // Проверяем кэш
      // if (this.cache && this.cache.timestamp && (Date.now() - this.cache.timestamp) < this.CACHE_DURATION) {
      //   const filteredData = this.filterNews(this.cache.data, limit, source);
      //   return { success: true, data: filteredData };
      // }

      const feeds: RSSFeed[] = [
        { url: 'https://lenta.ru/rss/news', name: 'lenta', sourceName: 'Лента.ру' },
        // { url: 'https://rss.newsru.com/russia/news', name: 'newsru', sourceName: 'NewsRU' },
        { url: 'https://www.vedomosti.ru/rss/news', name: 'vedomosti', sourceName: 'Ведомости' }
      ];

      const allNews: NewsItem[] = [];

      for (const feed of feeds) {
        try {
          const feedData = await this.parser.parseURL(feed.url);
          
          for (const item of feedData.items) {
            const content = this.extractContent(item);
            const title = item.title || 'Без заголовка';
            
            if (content && title !== 'Без заголовка') {
              const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
              const newsItem = this.createBasicNewsItem(
                title,
                content,
                item.link,
                publishedAt
              );

              // Добавляем дополнительную информацию о источнике
              // newsItem.id = `${feed.name}-${item.guid || item.link}`;
              // newsItem.source_name = feed.sourceName;
              
              if (this.validateNewsItem(newsItem)) {
                allNews.push(newsItem);
              }
            }
          }
        } catch (error) {
          console.log(`RSSParser error for ${feed.name}:`, error);
        }
      }

      // Сортировка по дате публикации (новые сначала)
      const sortedNews = allNews.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );

      // Обновляем кэш
      this.cache = {
        data: sortedNews,
        timestamp: Date.now()
      };

      // const filteredData = this.filterNews(sortedNews, 20, source);
      return { success: true, data: sortedNews,
        sourceName: 'unknown',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('RSSParser error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceName: 'unknown',
        timestamp: new Date()
      };
    }
  }

  private extractContent(item: any): string {
    if (item.contentEncoded) {
      return Helpers.sanitizeHtml(item.contentEncoded);
    }
    if (item.content) {
      return Helpers.sanitizeHtml(item.content);
    }
    if (item.description) {
      return Helpers.sanitizeHtml(item.description);
    }
    if (item.summary) {
      return Helpers.sanitizeHtml(item.summary);
    }
    if (item.contentSnippet) {
      return Helpers.sanitizeHtml(item.contentSnippet);
    }
    return '';
  }

  private filterNews(news: NewsItem[], limit: number, source?: string): NewsItem[] {
    let filtered = news;
    
    if (source) {
      filtered = filtered.filter(item => item.source_id === source);
    }
    
    return filtered.slice(0, limit);
  }

  // Метод для очистки кэша
  clearCache(): void {
    this.cache = null;
  }

  // Метод для получения информации о кэше
  getCacheInfo(): { hasCache: boolean; age: number } {
    if (!this.cache || !this.cache.timestamp) {
      return { hasCache: false, age: 0 };
    }
    
    return {
      hasCache: true,
      age: Date.now() - this.cache.timestamp
    };
  }
}