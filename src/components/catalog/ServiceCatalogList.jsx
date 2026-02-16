import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../style/catalog/ServiceCatalogList.css';

const ServiceCatalogList = ({ 
  services = [], 
}) => {
  const [filteredServices, setFilteredServices] = useState(services);
  const [loading] = useState(false);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  return (
    <div className="service-catalog-list-container">
      {filteredServices.length === 0 && !loading && (
        <div className="no-services-message">
          В этой категории пока нет услуг
        </div>
      )}
    </div>
  );
};

ServiceCatalogList.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      duration: PropTypes.number,
      image_url: PropTypes.string,
      rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      is_popular: PropTypes.bool,
      popularity_score: PropTypes.number
    })
  ),
  onServiceSelect: PropTypes.func,
  showFilters: PropTypes.bool,
  initialFilter: PropTypes.string
};

ServiceCatalogList.defaultProps = {
  services: [],
  onServiceSelect: () => {},
  showFilters: true,
  initialFilter: 'all'
};

export default ServiceCatalogList;