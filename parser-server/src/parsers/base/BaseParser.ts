import { GigaChatService } from '../../services/GigaChatService';
import { ParserConfig, ParseResult, NewsItem } from '../../types';
import { Helpers } from '../../utils/helpers';

export abstract class BaseParser {
  protected config: ParserConfig;
  protected sourceId: string;
  protected sourceType: string;
  protected gigaChatService: GigaChatService;

  constructor(sourceId: string, sourceUrl: string, sourceType: string, config: ParserConfig) {
    this.sourceId = sourceId;
    this.sourceType = sourceType;
    this.config = config;
    this.gigaChatService = new GigaChatService();
  }

  abstract parse(): Promise<ParseResult>;

  protected async createEnhancedNewsItem(
    title: string,
    content: string,
    url?: string,
    publishedAt?: Date
  ): Promise<NewsItem> {
    // Используем оригинальный заголовок как fallback
    const originalTitle = title.trim();
    return this.createBasicNewsItem(originalTitle, content, url, publishedAt);
    try {
      // Объединяем заголовок и контент для лучшего анализа
      const fullContent = `${originalTitle}. ${content}`;
      
      const enhancedContent = await this.gigaChatService.processNewsContent(fullContent);
      
      return {
        title: enhancedContent.title || originalTitle,
        content: content.trim(),
        short_content: enhancedContent.summary,
        source_id: this.sourceId,
        source_type: this.sourceType as any,
        published_at: publishedAt || new Date(),
        rating: 0,
        tags: enhancedContent.tags,
        url,
        status: 'pending',
        language: enhancedContent.language
      };
    } catch (error) {
      console.error('GigaChat enhancement failed, using fallback:', error);
      return this.createBasicNewsItem(originalTitle, content, url, publishedAt);
    }
  }

  protected createBasicNewsItem(
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
      status: 'pending',
      language: this.detectLanguage(content)
    };
  }

  private detectLanguage(text: string): string {
    const russianChars = text.match(/[а-яА-ЯёЁ]/g);
    const englishChars = text.match(/[a-zA-Z]/g);
    
    if (russianChars && russianChars.length > text.length * 0.1) {
      return 'ru';
    } else if (englishChars && englishChars.length > text.length * 0.1) {
      return 'en';
    }
    return 'ru';
  }

  protected validateNewsItem(item: NewsItem): boolean {
    return !!(item.title && item.content && item.title.length > 5 && item.content.length > 10);
  }
}