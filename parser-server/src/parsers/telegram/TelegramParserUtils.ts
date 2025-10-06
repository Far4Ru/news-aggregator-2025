interface TelegramChannelInfo {
  username: string;
  normalized: string;
  fullUrl: string;
  isValid: boolean;
}

/**
 * Расширенный парсер для обработки ссылок на Telegram каналы на сервере
 */
export class TelegramParserUtils {
  private static readonly USERNAME_PATTERN = /^[a-zA-Z0-9_]{5,32}$/;
  
  /**
   * Полностью анализирует ссылку на Telegram канал
   */
  public static parseChannelLink(url: string): TelegramChannelInfo {
    const username = this.extractUsername(url);
    const isValid = this.validateUsername(username);
    
    return {
      username: username || '',
      normalized: username || url,
      fullUrl: username ? `https://t.me/${username}` : '',
      isValid
    };
  }
  
  /**
   * Извлекает username из ссылки
   */
  private static extractUsername(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const trimmedUrl = url.trim();
    
    const patterns = [
      /^(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)(?:\/)?$/,
      /^@([a-zA-Z0-9_]+)$/,
      /^(?:https?:\/\/)?(?:www\.)?telegram\.me\/([a-zA-Z0-9_]+)(?:\/)?$/,
      /^([a-zA-Z0-9_]+)$/
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }

    return null;
  }
  
  /**
   * Валидирует username согласно требованиям Telegram
   */
  private static validateUsername(username: string | null): boolean {
    if (!username) return false;
    
    // Telegram usernames must be 5-32 characters long
    // and contain only a-z, A-Z, 0-9, and underscores
    return this.USERNAME_PATTERN.test(username);
  }
  
  /**
   * Пакетная обработка массива ссылок
   */
  public static parseMultipleLinks(links: string[]): TelegramChannelInfo[] {
    return links.map(link => this.parseChannelLink(link));
  }
}

// Пример использования на сервере
/*
const channelInfo = TelegramChannelParser.parseChannelLink('https://t.me/rian_ru');
console.log(channelInfo);
// {
//   username: 'rian_ru',
//   normalized: 'rian_ru',
//   fullUrl: 'https://t.me/rian_ru',
//   isValid: true
// }
*/