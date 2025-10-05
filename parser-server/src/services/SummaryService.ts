import { NewsItem } from '../types';
import { Helpers } from '../utils/helpers';

export class SummaryService {
  // Базовая реализация сервиса суммаризации
  // В реальном приложении можно интегрировать с локальными LLM или внешними API

  async generateSummary(newsItems: NewsItem[]): Promise<string> {
    if (newsItems.length === 0) return 'Нет новостей для суммаризации';

    if (newsItems.length === 1) {
      return newsItems[0].short_content;
    }

    // Простая суммаризация нескольких новостей
    const topics = this.extractCommonTopics(newsItems);
    const summary = `Основные темы: ${topics.join(', ')}. ${newsItems.length} новостей за последний период.`;

    return summary;
  }

  private extractCommonTopics(newsItems: NewsItem[]): string[] {
    const allTags = newsItems.flatMap(item => item.tags);
    const tagCount: Record<string, number> = {};

    allTags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  // Метод для улучшения краткого содержания (можно заменить на LLM)
  enhanceShortContent(content: string, title: string): string {
    // Простая эвристика для улучшения краткого содержания
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).map(s => s.trim() + '.').join(' ');
    }
    
    return Helpers.generateShortContent(title + '. ' + content);
  }
}