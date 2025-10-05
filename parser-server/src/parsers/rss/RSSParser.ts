import Parser from 'rss-parser';
import { BaseParser } from '../base/BaseParser';
import { ParseResult, NewsItem } from '../../types';
import { Helpers } from '../../utils/helpers';

export class RSSParser extends BaseParser {
  private parser: Parser;

  constructor(sourceId: string, config: any) {
    super(sourceId, 'rss', config);
    this.parser = new Parser({
      timeout: this.config.timeout,
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['description', 'description'],
          ['pubDate', 'pubDate']
        ]
      }
    });
  }

  async parse(): Promise<ParseResult> {
    try {
      const feed = await this.parser.parseURL(this.config.url);
      const newsItems: NewsItem[] = [];

      for (const item of feed.items.slice(0, 20)) { // Берем последние 20 статей
        const content = this.extractContent(item);
        const title = item.title || 'Без заголовка';
        
        if (content && title !== 'Без заголовка') {
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
          const newsItem = this.createNewsItem(
            title,
            content,
            item.link,
            publishedAt
          );

          if (this.validateNewsItem(newsItem)) {
            newsItems.push(newsItem);
          }
        }
      }

      return { success: true, data: newsItems };
    } catch (error) {
      console.error('RSSParser error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
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
    return '';
  }
}