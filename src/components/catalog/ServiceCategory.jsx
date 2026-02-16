import React from 'react';
import PropTypes from 'prop-types';
import '../../style/catalog/ServiceCategory.css';

const ServiceCategory = ({ category, onClick }) => {
  return (
    <div className="service-category" onClick={() => onClick(category)}>
      {category.image_url && (
        <img 
          src={category.image_url} 
          alt={category.name} 
          className="category-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="category-content">
        <h3 className="category-title">{category.name}</h3>
        <p className="category-description">
          {category.description || 'Описание отсутствует'}
        </p>
      </div>
    </div>
  );
};

ServiceCategory.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image_url: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func
};

ServiceCategory.defaultProps = {
  onClick: () => {}
};

export default ServiceCategory;