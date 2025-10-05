import React, { useState, useEffect } from 'react'
import { NewsSource } from '@/types'
import { SourceList } from '@/components/sources/SourceList'
import { AddSourceModal } from '@/components/sources/AddSourceModal'
import { SearchBar } from '@/components/common/SearchBar'
import { sourcesService } from '@/services/sourcesService'
import { useAppSettings } from '@/hooks/useLocalStorage'
import { useNotifications } from '@/hooks/useNotifications'
import { Plus } from 'lucide-react'

export const Sources: React.FC = () => {
    const { settings, setSettings } = useAppSettings()
    const { showNotification } = useNotifications()

    const [sources, setSources] = useState<NewsSource[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        loadSources()
    }, [searchQuery])

    const loadSources = async () => {
        setLoading(true)
        try {
            const data = await sourcesService.getSources(searchQuery)
            setSources(data)
        } catch (error) {
            console.error('Error loading sources:', error)
            showNotification('Ошибка при загрузке источников', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAddSource = async (sourceData: any) => {
        try {
            await sourcesService.addSource(sourceData)
            showNotification('Источник добавлен и ожидает модерации', 'success')
            loadSources() // Перезагружаем список
        } catch (error) {
            console.error('Error adding source:', error)
            showNotification('Ошибка при добавлении источника', 'error')
        }
    }

    const handleAddUserSource = (sourceId: string) => {
        const newSelectedSources = [...settings.selectedSources, sourceId]
        setSettings({
            ...settings,
            selectedSources: newSelectedSources
        })
        showNotification('Источник добавлен в вашу подборку', 'success')
    }

    const handleRemoveUserSource = (sourceId: string) => {
        const newSelectedSources = settings.selectedSources.filter(id => id !== sourceId)
        setSettings({
            ...settings,
            selectedSources: newSelectedSources
        })
        showNotification('Источник удален из вашей подборки', 'success')
    }

    const filteredSources = sources.filter(source =>
        source.status === 'approved' ||
        (settings.userRole === 'moderator' && source.status === 'pending')
    )

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Источники</h1>
                <p className="page__subtitle">Управляйте вашими источниками новостей</p>
            </div>

            <div className="page__actions">
                <div className="page__search">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Поиск источников..."
                    />
                </div>
                <button
                    className="button button--primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={20} />
                    Добавить источник
                </button>
            </div>

            <div className="page__content">
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
    )
}