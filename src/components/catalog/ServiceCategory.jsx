import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/catalog/ServiceCategory.css';

const ServiceCategory = ({ category, onClick }) => {
  const handleButtonClick = (e) => {
    e.stopPropagation();
    onClick(category);
  };

  return (
    <div className="service-category">
      {category.image_url && (
        <div
          className="category-image"
          style={{ backgroundImage: `url(${category.image_url})` }}
        />
      )}
      <div className="category-content">
        <div className="category-header">
          <h3 className="category-title">{category.name}</h3>
        </div>
        <p className="category-description">
          {category.description || 'Описание отсутствует'}
        </p>
        <button className="btn-select" onClick={handleButtonClick}>
          ВЫБРАТЬ САЛОН / МАСТЕРА
        </button>
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