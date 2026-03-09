import React from 'react';
import { useSalonMap } from '../../context/SalonMapContext';
import '../../styles/MapFilters.css';

const MapFilters = () => {
  const { filters, updateFilters, searchRadius, AVAILABLE_CITIES, selectedCity, selectCity } = useSalonMap();

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

      {/* Радиус поиска определяется автоматически на основе геолокации */}
      {searchRadius && (
        <div className="filter-group">
          <label className="filter-label">
            <span className="material-symbols-outlined">radar</span>
            Радиус поиска: {searchRadius} км (авто)
          </label>
        </div>
      )}

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
