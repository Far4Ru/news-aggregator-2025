// src/services/GigaChatService.ts

export interface GigaChatResponse {
  title: string;
  summary: string;
  tags: string[];
  language: string;
}

export class GigaChatService {
  private authUrl: string = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  private apiUrl: string = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
  private accessToken: string = '';
  private tokenExpires: number = 0;

  constructor() {
    // Данные аутентификации из .env
  }

  private async authenticate(): Promise<void> {
    const clientId = process.env.GIGACHAT_CLIENT_ID;
    const clientSecret = process.env.GIGACHAT_CLIENT_SECRET;
    const scope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';

    if (!clientId || !clientSecret) {
      throw new Error('GigaChat credentials not found in environment variables');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'RqUID': this.generateRqUID(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `scope=${scope}`
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: any = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000; // -1 минута для запаса

      console.log('GigaChat authentication successful');
    } catch (error) {
      console.error('GigaChat authentication error:', error);
      throw error;
    }
  }

  private generateRqUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpires) {
      await this.authenticate();
    }
  }

  async processNewsContent(content: string): Promise<GigaChatResponse> {
    try {
      await this.ensureAuthenticated();
      
      const language = this.detectLanguage(content);
      const prompt = this.generatePrompt(content, language);
      
      const result = await this.callGigaChatAPI(prompt);
      
      return this.parseGigaChatResponse(result, language);
    } catch (error) {
      console.error('GigaChat processing error:', error);
      return this.generateFallbackResponse(content);
    }
  }

  private detectLanguage(text: string): string {
    const russianChars = text.match(/[а-яА-ЯёЁ]/g);
    const englishChars = text.match(/[a-zA-Z]/g);
    
    if (russianChars && russianChars.length > text.length * 0.1) {
      return 'ru';
    } else if (englishChars && englishChars.length > text.length * 0.1) {
      return 'en';
    }
    return 'ru'; // по умолчанию русский, т.к. GigaChat лучше работает с русским
  }

  private generatePrompt(content: string, language: string): string {
    const languagePrompts = {
      ru: `Ты - профессиональный редактор новостей. Проанализируй следующий текст новости и верни ответ в формате JSON:

Требования:
- Заголовок: краткий, информативный, привлекающий внимание (до 80 символов)
- Краткое содержание: 2-3 предложения, раскрывающие суть новости
- Теги: 3-5 релевантных ключевых слов или фраз

Формат ответа:
{
  "title": "заголовок",
  "summary": "краткое содержание", 
  "tags": ["тег1", "тег2", "тег3"]
}

Текст новости: ${content.substring(0, 3500)}

Важно: отвечай ТОЛЬКО в формате JSON без дополнительного текста, комментариев или разметки.`,

      en: `You are a professional news editor. Analyze the following news text and return response in JSON format:

Requirements:
- Title: concise, informative, attention-grabbing (up to 80 characters)
- Summary: 2-3 sentences revealing the essence of the news
- Tags: 3-5 relevant keywords or phrases

Response format:
{
  "title": "headline",
  "summary": "summary",
  "tags": ["tag1", "tag2", "tag3"]
}

News text: ${content.substring(0, 3500)}

Important: respond ONLY in JSON format without any additional text, comments or markup.`
    };

    return languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.ru;
  }

  private async callGigaChatAPI(prompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "GigaChat", // или "GigaChat-Plus" для более продвинутой версии
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      throw new Error(`GigaChat API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }

  private parseGigaChatResponse(response: string, language: string): GigaChatResponse {
    try {
      // Очищаем ответ от возможных форматирований
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Валидация и нормализация ответа
      return {
        title: this.validateTitle(parsed.title, language),
        summary: this.validateSummary(parsed.summary),
        tags: this.validateTags(parsed.tags),
        language
      };
    } catch (error) {
      console.error('Failed to parse GigaChat response:', error, 'Response:', response);
      return this.generateFallbackResponse('');
    }
  }

  private validateTitle(title: any, language: string): string {
    if (typeof title !== 'string' || !title.trim()) {
      return language === 'ru' ? 'Новость' : 'News';
    }
    
    // Ограничиваем длину заголовка
    return title.trim().substring(0, 100);
  }

  private validateSummary(summary: any): string {
    if (typeof summary !== 'string' || !summary.trim()) {
      return 'Информация недоступна';
    }
    
    return summary.trim().substring(0, 300);
  }

  private validateTags(tags: any): string[] {
    if (!Array.isArray(tags)) {
      return [];
    }
    
    return tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim())
      .slice(0, 5);
  }

  private generateFallbackResponse(content: string): GigaChatResponse {
    const language = this.detectLanguage(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      title: sentences[0]?.substring(0, 80) + '...' || (language === 'ru' ? 'Новость' : 'News'),
      summary: sentences.slice(0, 2).join('. ') + '.' || (language === 'ru' ? 'Информация недоступна' : 'Information not available'),
      tags: this.extractTagsFallback(content),
      language
    };
  }

  private extractTagsFallback(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\sа-яё]/gi, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const commonWords = new Set([
      'this', 'that', 'with', 'from', 'have', 'were', 'them', 'will', 'their',
      'этот', 'это', 'что', 'как', 'так', 'или', 'если', 'когда', 'потом'
    ]);
    
    return [...new Set(words.filter(word => 
      !commonWords.has(word) && word.length > 3
    ))].slice(0, 5);
  }
}