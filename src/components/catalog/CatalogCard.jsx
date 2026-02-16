import React from 'react';
import PropTypes from 'prop-types';
import '../../style/catalog/CatalogCard.css';

const CatalogCard = ({ service, onClick }) => {
  return (
    <div className="catalog-card" onClick={() => onClick(service)}>
      {service.image_url && (
        <img 
          src={service.image_url} 
          alt={service.name} 
          className="catalog-card-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="catalog-card-content">
        <h3 className="catalog-card-title">{service.name}</h3>
        <p className="catalog-card-description">
          {service.description || 'Описание отсутствует'}
        </p>
        <div className="catalog-card-meta">
          <span className="catalog-card-price">от {service.price} ₽</span>
          {service.time_slot_start && service.time_slot_end ? (
            <span className="catalog-card-time-slot">
              {service.time_slot_start.substring(0, 5)} - {service.time_slot_end.substring(0, 5)}
            </span>
          ) : (
            <span className="catalog-card-duration">{service.duration_minutes || service.duration} мин</span>
          )}
        </div>
      </div>
    </div>
  );
};

CatalogCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number, // старое поле для совместимости
    duration_minutes: PropTypes.number, // новое поле для продолжительности в минутах
    time_slot_start: PropTypes.string, // новое поле для времени начала
    time_slot_end: PropTypes.string, // новое поле для времени окончания
    image_url: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func
};

CatalogCard.defaultProps = {
  onClick: () => {}
};

export default CatalogCard;