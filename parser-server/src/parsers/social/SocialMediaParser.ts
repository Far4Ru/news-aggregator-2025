import puppeteer from 'puppeteer';
import { BaseParser } from '../base/BaseParser';
import { ParseResult, NewsItem } from '../../types';

export class SocialMediaParser extends BaseParser {
  private browser: puppeteer.Browser | null = null;

  constructor(sourceId: string, config: any) {
    super(sourceId, 'social', config);
  }

  async parse(): Promise<ParseResult> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await this.browser.newPage();
      await page.setUserAgent(this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(this.config.url, { 
        waitUntil: 'networkidle2', 
        timeout: this.config.timeout 
      });

      await this.delay(5000);

      // Базовый парсинг для социальных сетей
      const posts = await page.evaluate(() => {
        const postElements = document.querySelectorAll('[data-testid*="post"], [role*="article"], .post, .tweet');
        const results: any[] = [];

        postElements.forEach(element => {
          const textElement = element.querySelector('[lang], .post-content, .tweet-text');
          const timeElement = element.querySelector('time');
          
          if (textElement) {
            const content = textElement.textContent?.trim();
            const timeText = timeElement?.getAttribute('datetime');
            
            if (content && content.length > 20) {
              results.push({
                content,
                publishedAt: timeText ? new Date(timeText) : new Date()
              });
            }
          }
        });

        return results;
      });

      const newsItems: NewsItem[] = [];

      for (const post of posts.slice(0, 15)) {
        const title = post.content.substring(0, 80) + '...';
        const newsItem = this.createNewsItem(
          title,
          post.content,
          this.config.url,
          post.publishedAt
        );

        if (this.validateNewsItem(newsItem)) {
          newsItems.push(newsItem);
        }
      }

      return { success: true, data: newsItems };
    } catch (error) {
      console.error('SocialMediaParser error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}