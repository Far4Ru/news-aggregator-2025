export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  short_content: string;
  source_id: string;
  source_type: 'telegram' | 'rss' | 'social' | 'podcast' | 'website';
  published_at: Date;
  rating: number;
  tags: string[];
  url?: string;
  status: 'pending' | 'approved' | 'rejected';
  language?: string; // Добавляем поле языка
  created_at?: Date;
  updated_at?: Date;
}

export interface Source {
  id?: string;
  name: string;
  description?: string;
  url: string;
  type: 'telegram' | 'rss' | 'website' | 'social' | 'podcast' | 'other';
  activity_data: number[];
  status: 'pending' | 'approved' | 'rejected';
  added_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ParserConfig {
  timeout: number;
  headless: boolean;
  userAgent?: string;
}

export interface ParseResult {
  success: boolean;
  data?: NewsItem[];
  error?: string;
  sourceName: string;
  timestamp: Date;
}

export interface TempNewsFile {
  filename: string;
  source: string;
  items: NewsItem[];
  parsedAt: Date;
  filePath: string;
}