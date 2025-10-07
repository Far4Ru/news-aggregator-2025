import { type NewsItem } from '../types/news';
import { type NewsSource } from '../types/sources';

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Запуск нового проекта в сфере IT',
    content: 'Компания анонсировала запуск инновационного проекта в области искусственного интеллекта. Проект направлен на создание передовых решений для автоматизации бизнес-процессов.',
    short_content: 'Компания анонсировала запуск инновационного проекта в области искусственного интеллекта.',
    source_id: 'tech-news',
    source_type: 'website',
    published_at: new Date().toISOString(),
    rating: 15,
    tags: ['IT', 'искусственный интеллект', 'инновации'],
    url: 'https://example.com/news/1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Изменения в налоговом законодательстве',
    content: 'Правительство внесло поправки в налоговый кодекс, затрагивающие малый бизнес. Новые правила вступят в силу с начала следующего квартала.',
    short_content: 'Правительство внесло поправки в налоговый кодекс, затрагивающие малый бизнес.',
    source_id: 'business-news',
    source_type: 'rss',
    published_at: new Date(Date.now() - 86400000).toISOString(),
    rating: 8,
    tags: ['налоги', 'бизнес', 'законодательство'],
    url: 'https://example.com/news/2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockSources: NewsSource[] = [
  {
    id: 'tech-news',
    name: 'Tech News',
    description: 'Последние новости из мира технологий',
    url: 'https://tech-news.example.com',
    type: 'website',
    activity_data: [5, 7, 3, 8, 6, 4, 9],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'business-news',
    name: 'Business Daily',
    description: 'Экономические и бизнес новости',
    url: 'https://business-daily.example.com',
    type: 'rss',
    activity_data: [2, 3, 1, 4, 2, 3, 5],
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
