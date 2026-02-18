import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/catalog/ServiceVariation.css';

const ServiceVariation = ({ variation, onSelect }) => {
  // Форматирование времени для отображения
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Преобразуем время из формата HH:mm:ss в HH:mm
    return timeString.substring(0, 5);
  };

  return (
    <div className="service-variation" onClick={() => onSelect(variation)}>
      <div className="variation-header">
        <h4 className="variation-title">{variation.name}</h4>
        {variation.is_popular && (
          <span className="popular-badge">Популярный</span>
        )}
      </div>

      <p className="variation-description">
        {variation.description || 'Описание отсутствует'}
      </p>

      <div className="variation-details">
        <div className="variation-provider">
          {variation.master_id && (
            <span className="provider-type">Мастер</span>
          )}
          {variation.salon_id && (
            <span className="provider-type">Салон</span>
          )}
        </div>

        <div className="variation-meta">
          <span className="variation-price">{variation.price} ₽</span>
          {variation.time_slot_start && variation.time_slot_end ? (
            <span className="variation-time-slot">
              {formatTime(variation.time_slot_start)} - {formatTime(variation.time_slot_end)}
            </span>
          ) : (
            <span className="variation-duration">{variation.duration_minutes || variation.duration} мин</span>
          )}
        </div>
      </div>
    </div>
  );
};

ServiceVariation.propTypes = {
  variation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number, // старое поле для совместимости
    duration_minutes: PropTypes.number, // новое поле для продолжительности в минутах
    time_slot_start: PropTypes.string, // новое поле для времени начала
    time_slot_end: PropTypes.string, // новое поле для времени окончания
    is_popular: PropTypes.bool,
    master_id: PropTypes.number,
    salon_id: PropTypes.number
  }).isRequired,
  onSelect: PropTypes.func
};

ServiceVariation.defaultProps = {
  onSelect: () => {}
};

export default ServiceVariation;