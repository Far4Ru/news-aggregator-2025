import { BaseParser } from '../base/BaseParser';
import { ParseResult, NewsItem } from '../../types';
import axios from 'axios';

export class PodcastParser extends BaseParser {
  constructor(sourceId: string, config: any) {
    super(sourceId, 'podcast', config);
  }

  async parse(): Promise<ParseResult> {
    try {
      // Для подкастов парсим RSS фид с описаниями эпизодов
      const response = await axios.get(this.config.url, {
        timeout: this.config.timeout
      });

      const rssContent = response.data;
      const episodes = this.parseRSSForEpisodes(rssContent);

      const newsItems: NewsItem[] = [];

      for (const episode of episodes.slice(0, 10)) {
        const newsItem = this.createNewsItem(
          episode.title,
          episode.description,
          episode.link,
          episode.publishedAt
        );

        if (this.validateNewsItem(newsItem)) {
          newsItems.push(newsItem);
        }
      }

      return { success: true, data: newsItems };
    } catch (error) {
      console.error('PodcastParser error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private parseRSSForEpisodes(rssContent: string): any[] {
    const episodes: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(rssContent)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const descriptionMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

      if (titleMatch && descriptionMatch) {
        episodes.push({
          title: titleMatch[1].trim(),
          description: descriptionMatch[1].trim(),
          link: linkMatch ? linkMatch[1].trim() : '',
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1].trim()) : new Date()
        });
      }
    }

    return episodes;
  }
}