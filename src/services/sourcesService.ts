import { supabase, supabaseModerator } from './supabase'
import { NewsSource } from '../types'
import { mockSources } from '../utils/mockData'

export const sourcesService = {
    async getSources(searchQuery: string = '') {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 500))

        let filteredSources = [...mockSources]

        if (searchQuery) {
            filteredSources = filteredSources.filter(source =>
                source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                source.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filteredSources
    },

    async addSource(sourceData: {
        name: string
        description: string
        url: string
        type: string
    }) {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 500))
        return null
    },

    async getSourcesForModeration() {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockSources
    },

    async moderateSource(sourceId: string, action: 'approve' | 'reject') {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return null
    }
}