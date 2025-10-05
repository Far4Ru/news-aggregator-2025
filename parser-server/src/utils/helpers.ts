export class Helpers {
  static generateShortContent(content: string, maxLength: number = 200): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const shortContent = sentences.slice(0, 2).join('. ') + '.';
    
    if (shortContent.length > maxLength) {
      return shortContent.substring(0, maxLength - 3) + '...';
    }
    
    return shortContent;
  }

  static extractTags(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const commonWords = new Set(['this', 'that', 'with', 'from', 'have', 'were', 'them', 'will', 'their']);
    const uniqueWords = [...new Set(words.filter(word => 
      !commonWords.has(word) && word.length > 3
    ))].slice(0, 5);
    
    return uniqueWords;
  }

  static sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static formatDate(date: Date): string {
    return date.toISOString().replace(/[:.]/g, '-');
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}