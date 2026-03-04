import React from 'react';
import { useSalonMap } from '../../context/SalonMapContext';
import '../../styles/MapFilters.css';

const MapFilters = () => {
  const { filters, updateFilters, searchRadius, AVAILABLE_CITIES, selectedCity, selectCity } = useSalonMap();

  const handleRadiusChange = (value) => {
    updateFilters({ searchRadius: value });
  };

  return (
    <div className="map-filters">
      <div className="filter-group">
        <label className="filter-label">
          <span className="material-symbols-outlined">map</span>
          Город
        </label>
        <select
          className="filter-select"
          value={selectedCity || ''}
          onChange={(e) => selectCity(e.target.value)}
        >
          {AVAILABLE_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">
          <span className="material-symbols-outlined">radar</span>
          Радиус поиска: {searchRadius} км
        </label>
        <input
          type="range"
          className="filter-range"
          min="1"
          max="50"
          value={searchRadius}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
        />
        <div className="range-labels">
          <span>1 км</span>
          <span>25 км</span>
          <span>50 км</span>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">
          <span className="material-symbols-outlined">star</span>
          Минимальный рейтинг
        </label>
        <select
          className="filter-select"
          value={filters.minRating}
          onChange={(e) => updateFilters({ minRating: parseFloat(e.target.value) })}
        >
          <option value="0">Любой</option>
          <option value="3">3+ ⭐</option>
          <option value="4">4+ ⭐</option>
          <option value="4.5">4.5+ ⭐</option>
          <option value="5">5 ⭐</option>
        </select>
      </div>
    </div>
  );
};

export default MapFilters;
