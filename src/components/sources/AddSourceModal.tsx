import { X } from 'lucide-react'
import React, { useState } from 'react'

interface AddSourceModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (source: {
        name: string
        description: string
        url: string
        type: string
    }) => void
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        url: '',
        type: 'website'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name && formData.url) {
            onAdd(formData)
            setFormData({ name: '', description: '', url: '', type: 'website' })
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal">
            <div className="modal__content modal__content--large">
                <div className="modal__header">
                    <h3 className="modal__title">Добавить источник</h3>
                    <button className="modal__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__form">
                    <div className="form__group">
                        <label className="form__label">Название *</label>
                        <input
                            type="text"
                            className="form__input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label">Описание</label>
                        <textarea
                            className="form__textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label">URL *</label>
                        <input
                            type="url"
                            className="form__input"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label">Тип источника</label>
                        <select
                            className="form__select"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="website">Веб-сайт</option>
                            <option value="telegram">Telegram</option>
                            <option value="rss">RSS</option>
                            <option value="other">Другое</option>
                        </select>
                    </div>

                    <div className="modal__actions">
                        <button type="button" className="button button--secondary" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="button button--primary">
                            Добавить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}