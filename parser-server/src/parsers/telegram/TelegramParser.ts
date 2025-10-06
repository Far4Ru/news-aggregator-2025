import { BaseParser } from '../base/BaseParser';
import { ParseResult, NewsItem } from '../../types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TelegramParserUtils } from './TelegramParserUtils';

export class TelegramParser extends BaseParser {
  private channelUsername: string;

  constructor(sourceId: string, sourceUrl: string, config: any) {
    super(sourceId, sourceUrl, 'telegram', config);
    this.channelUsername = TelegramParserUtils.parseChannelLink(sourceUrl).username;
  }

  async parse(): Promise<ParseResult> {
    try {
      console.log(`Parsing Telegram channel: ${this.channelUsername}`);
      
      const messages = await this.parseTelegramChannel(this.channelUsername);
      const newsItems: NewsItem[] = [];

      for (const message of messages) {
        if (message.text && message.date) {
          try {
            const newsItem = await this.createEnhancedNewsItem(
              this.generateTitle(message.text),
              message.text,
              `https://t.me/s/${this.channelUsername}`,
              new Date(message.date)
            );

            if (this.validateNewsItem(newsItem)) {
              newsItems.push(newsItem);
            }
          } catch (error) {
            console.error('Error enhancing news item:', error);
            // Fallback на базовый метод
            const basicItem = this.createBasicNewsItem(
              this.generateTitle(message.text),
              message.text,
              `https://t.me/s/${this.channelUsername}`,
              new Date(message.date)
            );
            if (this.validateNewsItem(basicItem)) {
              newsItems.push(basicItem);
            }
          }
        }
      }

      return {
        success: true,
        data: newsItems,
        sourceName: 'Telegram',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('TelegramParser error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        sourceName: 'Telegram',
        timestamp: new Date()
      };
    }
  }

  private async parseTelegramChannel(channelUsername: string): Promise<TelegramMessage[]> {
    try {
      const url = `https://t.me/s/${channelUsername}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: this.config.timeout || 30000
      });

      const $ = cheerio.load(response.data);
      const messages: TelegramMessage[] = [];

      $('.tgme_widget_message').each((index, element) => {
        const $message = $(element);
        const text = $message.find('.tgme_widget_message_text').text().trim();
        const date = $message.find('.tgme_widget_message_date time').attr('datetime');
        const views = $message.find('.tgme_widget_message_views').text().trim();
        const postUrl = $message.find('.tgme_widget_message_date').attr('href');

        if (text) {
          messages.push({
            text,
            date: date || '',
            views,
            url: postUrl || `https://t.me/s/${channelUsername}`
          });
        }
      });

      return messages;
    } catch (error) {
      console.error('Error parsing Telegram channel:', error);
      throw new Error(`Failed to parse Telegram channel: ${channelUsername}`);
    }
  }

  private generateTitle(text: string): string {
    // Генерируем заголовок из первых N символов текста
    const maxTitleLength = 100;
    if (text.length <= maxTitleLength) {
      return text;
    }
    
    return text.substring(0, maxTitleLength) + '...';
  }
}

interface TelegramMessage {
  text: string;
  date: string;
  views: string;
  url?: string;
}