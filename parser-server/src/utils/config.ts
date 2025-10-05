import { ParserConfig } from '../types';

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  },
  parsers: {
    default: {
      timeout: parseInt(process.env.PARSER_TIMEOUT || '30000'),
      headless: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    } as ParserConfig,
    telegram: {
      timeout: 60000,
      headless: true
    } as ParserConfig,
    rss: {
      timeout: 15000,
      headless: false
    } as ParserConfig
  },
  cron: {
    newsUpdate: '0 */2 * * *', // Каждые 2 часа
    cleanup: '0 0 * * *' // Ежедневно в полночь
  },
  files: {
    tempDir: './data/temp',
    archiveDir: './data/archive',
    keepTempFiles: 24 * 7 // Хранить временные файлы 7 дней
  }
};