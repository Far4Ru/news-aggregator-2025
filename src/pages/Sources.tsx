import { Plus } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { SearchBar } from '../components/common/SearchBar';
import { AddSourceModal } from '../components/sources/AddSourceModal';
import { SourceList } from '../components/sources/SourceList';
import { useAppSettings } from '../hooks/useLocalStorage';
import { useNotification } from '../hooks/useNotification';
import { sourcesService } from '../services/sourcesService';
import type { NewsSource } from '../types/sources';

export const Sources: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  const { showCardNotification: showNotification } = useNotification();

  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadSources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sourcesService.getSources(searchQuery);

      setSources(data);
    } catch (error) {
      console.error('Error loading sources:', error);
      showNotification('Ошибка при загрузке источников', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showNotification]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleAddSource = async (sourceData: any) => {
    try {
      await sourcesService.addSource(sourceData);
      showNotification('Источник добавлен и ожидает модерации',  'success');
      loadSources(); // Перезагружаем список
    } catch (error) {
      console.error('Error adding source:', error);
      showNotification('Ошибка при добавлении источника', 'error');
    }
  };

  const handleAddUserSource = (sourceId: string) => {
    const newSelectedSources = [...settings.selectedSources, sourceId];

    setSettings({
      ...settings,
      selectedSources: newSelectedSources as any
    });
    showNotification('Источник добавлен в вашу подборку', 'success' );
  };

  const handleRemoveUserSource = (sourceId: string) => {
    const newSelectedSources = settings.selectedSources.filter(id => id !== sourceId);

    setSettings({
      ...settings,
      selectedSources: newSelectedSources
    });
    showNotification('Источник удален из вашей подборки', 'success');
  };

  const filteredSources = sources.filter(source =>
    source.status === 'approved' ||
        (settings.userRole === 'moderator' && source.status === 'pending')
  );

  return (
    <div className='page'>
      <div className='page__header'>
        <h1 className='page__title'>Источники</h1>
        <p className='page__subtitle'>Управляйте вашими источниками новостей</p>
      </div>

      <div className='page__actions'>
        <div className='page__search'>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder='Поиск источников...'
          />
        </div>
        <button
          className='button button--primary'
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Добавить источник
        </button>
      </div>

      <div className='page__content-block'>
        <SourceList
          sources={filteredSources}
          loading={loading}
          userSources={settings.selectedSources}
          onAddSource={handleAddUserSource}
          onRemoveSource={handleRemoveUserSource}
        />
      </div>

      <AddSourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSource}
      />
    </div>
  );
};
