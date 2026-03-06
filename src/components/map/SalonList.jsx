import React from 'react';
import SalonCard from './SalonCard';
import { useSalonMap } from '../../context/SalonMapContext';
import { logger } from '../../utils/logger';
import '../../styles/SalonList.css';

const SalonList = () => {
  const { salons, selectedSalon, selectSalon, loading, error, selectedCity } = useSalonMap();

  const handleBookSalon = (salon) => {
    logger.debug('Запись в салон:', salon);
    // Здесь будет логика записи
  };

  const handleFavoriteSalon = (salon) => {
    logger.debug('Добавить в избранное:', salon);
    // Здесь будет логика избранного
  };

  if (loading) {
    return (
      <div className="salon-list-loading">
        <div className="spinner"></div>
        <p>Загрузка салонов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="salon-list-error">
        <span className="material-symbols-outlined">error_outline</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!salons || salons.length === 0) {
    return (
      <div className="salon-list-empty">
        <span className="material-symbols-outlined">business_center</span>
        <h3>Нет салонов</h3>
        <p>
          {selectedCity
            ? `В городе ${selectedCity} пока нет салонов`
            : 'Выберите город для поиска салонов'}
        </p>
      </div>
    );
  }

  return (
    <div className="salon-list">
      <div className="salon-list-header">
        <h2>Салоны ({salons.length})</h2>
        {selectedCity && (
          <p className="salon-list-city">{selectedCity}</p>
        )}
      </div>

      <div className="salon-list-content">
        {salons.map((salon) => (
          <SalonCard
            key={salon.id}
            salon={salon}
            isSelected={selectedSalon?.id === salon.id}
            onClick={() => selectSalon(salon)}
            onBook={handleBookSalon}
            onFavorite={handleFavoriteSalon}
          />
        ))}
      </div>
    </div>
  );
};

export default SalonList;
