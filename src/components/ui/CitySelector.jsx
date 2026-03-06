import React, { useRef } from 'react';
import '../../styles/CitySelector.css';

const CITIES = ['Казань', 'Альметьевск', 'Уфа', 'Ижевск', 'Набережные Челны'];

const CitySelector = ({ selectedCity, isOpen, onToggle, onSelect }) => {
  const citiesRef = useRef(null);

  return (
    <div className="header-location" ref={citiesRef}>
      <button
        className="location-trigger"
        onClick={onToggle}
        aria-label={`Выбрать город, текущий: ${selectedCity}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>location_on</span>
        <span className="location-text">{selectedCity}</span>
        <span
          className={`material-symbols-outlined expand-icon ${isOpen ? 'expand-icon--rotated' : ''}`}
          style={{ fontSize: '1rem' }}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      <div
        className={`cities-dropdown ${isOpen ? 'cities-dropdown--open' : ''}`}
        role="listbox"
        aria-label="Выбор города"
      >
        {CITIES.map(city => (
          <button
            key={city}
            className={`city-option ${city === selectedCity ? 'selected' : ''}`}
            onClick={() => onSelect(city)}
            role="option"
            aria-selected={city === selectedCity}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitySelector;
export { CITIES };
