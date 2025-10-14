import { Plus, Minus, BarChart3, ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { type NewsSource } from '../../types/sources';

interface SourceCardProps {
  source: NewsSource
  isAdded: boolean
  onAdd: (sourceId: string) => void
  onRemove: (sourceId: string) => void
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  isAdded,
  onAdd,
  onRemove
}) => {
  const [sourceActivity, setSourceActivity] = useState<number[]>([]);

  useEffect(() => {
    setSourceActivity(source.activity_data = [...Array(7)].map(() => Math.floor(Math.random() * 10)));
  }, []);
  // const totalActivity = source.activity_data.reduce((sum, count) => sum + count, 0)
  const maxActivity = Math.max(...sourceActivity);

  return (
    <div className='source-card'>
      <div className='source-card__header'>
        <h3 className='source-card__title'>{source.name}</h3>
        <span className={`source-card__type source-card__type--${source.type}`}>
          {source.type}
        </span>
      </div>

      <p className='source-card__description'>{source.description}</p>

      <div className='source-card__activity'>
        <div className='source-card__activity-header'>
          <BarChart3 size={16} />
          <span>Активность (последние 7 дней)</span>
        </div>
        <div className='source-card__chart'>
          {sourceActivity.map((count, index) => (
            <div
              key={index}
              className='source-card__bar'
              style={{
                height: `${maxActivity > 0 ? (count / maxActivity) * 40 : 0}px`
              }}
              title={`${count} новостей`}
            />
          ))}
        </div>
      </div>

      <div className='source-card__actions'>
        <a
          href={source.url}
          target='_blank'
          rel='noopener noreferrer'
          className='source-card__link'
        >
          <ExternalLink size={16} />
          Перейти
        </a>

        {isAdded ? (
          <button
            className='source-card__button source-card__button--remove'
            onClick={() => onRemove(source.id)}
          >
            <Minus size={16} />
            Удалить
          </button>
        ) : (
          <button
            className='source-card__button source-card__button--add'
            onClick={() => onAdd(source.id)}
          >
            <Plus size={16} />
            Добавить
          </button>
        )}
      </div>
    </div>
  );
};
