import type { NewsSource } from '../types/sources';
import { mockSources } from '../utils/mockData';

import { supabase } from './supabase';

export const sourcesService = {
  async getSources(searchQuery = '') {
    const { data: sources, error } = await supabase
      .from('sources')
      .select('*');

    console.log(sources, error);
    let filteredSources = [...mockSources, ...sources as NewsSource[]];

    if (searchQuery) {
      filteredSources = filteredSources.filter(source =>
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                source.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredSources;
  },

  async addSource(sourceData: {
        name: string
        description: string
        url: string
        type: string
    }) {
    const { data, error } = await supabase
      .from('sources')
      .insert([
        {
          ...sourceData,
          status: 'pending'
        },
      ] as any)
      .select();

    console.log(data, error);

    return null;
  },

  async getSourcesForModeration() {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockSources;
  },

  async moderateSource(_sourceId: string, _action: 'approve' | 'reject') {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 200));

    return null;
  }
};
