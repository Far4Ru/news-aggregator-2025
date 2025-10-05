import React from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Поиск...'
}) => {
    return (
        <div className="search-bar">
            <div className="search-bar__icon">
                <Search size={20} />
            </div>
            <input
                type="text"
                className="search-bar__input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    )
}