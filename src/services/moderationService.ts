import { mockNews } from '../utils/mockData';

import { supabase } from './supabase';

export const moderationService = {
  async getNewNews() {
    const { data: news, error } = await supabase
      .from('news')
      .select('*');

    console.log(error);
  
    let filteredNews = [...mockNews, ...news as any];

    return filteredNews;
  },

  async moderateNews(newsId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('news')
      .update({ status })
      .eq('id', newsId)
      .select();

    console.log(data, error);

    return null;
  },

  async blockIp(_ip: string) {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 200));

    return { success: true };
  }
};
