import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/catalog/ServiceCatalogCard.css';

const ServiceCatalogCard = ({ service, onClick }) => {
  // Форматирование цены
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price).toLocaleString('ru-RU');
    }
    return price?.toLocaleString('ru-RU') || '0';
  };

  return (
    <div className="service-catalog-card" onClick={() => onClick(service)}>
      <div className="service-catalog-image-container">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="service-catalog-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="service-catalog-default-image">
            <span className="service-icon">✂️</span>
          </div>
        )}
        <div className="service-catalog-default-image-placeholder" style={{display: 'none'}}>
          <span className="service-icon">✂️</span>
        </div>
      </div>
      
      <div className="service-catalog-content">
        <h3 className="service-catalog-title">{service.name}</h3>
        <p className="service-catalog-description">
          {service.description || 'Описание отсутствует'}
        </p>
        
        <div className="service-catalog-meta">
          <div className="service-catalog-price">от {formatPrice(service.price)} ₽</div>
          <div className="service-catalog-duration">{service.duration} мин</div>
        </div>
        
        {service.rating && (
          <div className="service-catalog-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{service.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
};

ServiceCatalogCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration: PropTypes.number,
    image_url: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onClick: PropTypes.func
};

ServiceCatalogCard.defaultProps = {
  onClick: () => {}
};

export default ServiceCatalogCard;