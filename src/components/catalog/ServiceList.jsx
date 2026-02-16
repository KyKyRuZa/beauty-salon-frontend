import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ServiceVariation from './ServiceVariation'; // Обновленный компонент для отображения вариантов услуг
import '../../style/catalog/ServiceList.css';

const ServiceList = ({ services = [], onServiceSelect }) => {
  const [filteredServices, setFilteredServices] = useState(services);
  const [loading] = useState(false);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  return (
    <div className="service-list-container">
      <div className="service-list-grid">
        {filteredServices.map((service) => (
          <ServiceVariation
            key={service.id}
            service={service}
            onClick={onServiceSelect}
          />
        ))}
      </div>
      {filteredServices.length === 0 && !loading && (
        <div className="no-services-message">
          В этой категории пока нет вариантов услуг
        </div>
      )}
    </div>
  );
};

ServiceList.propTypes = {
  categoryId: PropTypes.number,
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.number,
      time_slot_start: PropTypes.string, // Новое поле для времени начала
      time_slot_end: PropTypes.string,   // Новое поле для времени окончания
      duration_minutes: PropTypes.number // Новое поле для продолжительности в минутах
    })
  ),
  onServiceSelect: PropTypes.func
};

ServiceList.defaultProps = {
  categoryId: null,
  services: [],
  onServiceSelect: () => {}
};

export default ServiceList;