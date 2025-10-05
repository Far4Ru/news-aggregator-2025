import { ParserConfig, ParseResult, NewsItem } from '../../types';
import { Helpers } from '../../utils/helpers';

export abstract class BaseParser {
  protected config: ParserConfig;
  protected sourceId: string;
  protected sourceType: string;

  constructor(sourceId: string, sourceType: string, config: ParserConfig) {
    this.sourceId = sourceId;
    this.sourceType = sourceType;
    this.config = config;
  }

  abstract parse(): Promise<ParseResult>;

  protected createNewsItem(
    title: string,
    content: string,
    url?: string,
    publishedAt?: Date
  ): NewsItem {
    const shortContent = Helpers.generateShortContent(content);
    const tags = Helpers.extractTags(content + ' ' + title);

    return {
      title: title.trim(),
      content: content.trim(),
      short_content: shortContent,
      source_id: this.sourceId,
      source_type: this.sourceType as any,
      published_at: publishedAt || new Date(),
      rating: 0,
      tags,
      url,
      status: 'pending'
    };
  }

  protected validateNewsItem(item: NewsItem): boolean {
    return !!(item.title && item.content && item.title.length > 5 && item.content.length > 10);
  }
}