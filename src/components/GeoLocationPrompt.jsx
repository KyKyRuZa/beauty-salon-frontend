import React, { useState } from 'react';
import { useSalonMap } from '../context/SalonMapContext';
import '../styles/GeoLocationPrompt.css';

const GeoLocationPrompt = ({ isOpen, onClose }) => {
  const { selectedCity, retryGeolocation, selectCity, AVAILABLE_CITIES } = useSalonMap();
  const [showCityList, setShowCityList] = useState(false);

  if (!isOpen) return null;

  const handleUseDetected = () => {
    onClose();
  };

  const handleChooseAnother = () => {
    setShowCityList(true);
  };

  const handleSelectCity = (city) => {
    selectCity(city);
    onClose();
  };

  return (
    <div className="geo-prompt-overlay" onClick={onClose}>
      <div className="geo-prompt-modal" onClick={(e) => e.stopPropagation()}>
        {!showCityList ? (
          <>
            <div className="geo-prompt-header">
              <span className="material-symbols-outlined geo-icon">location_on</span>
              <h2>Ваш город: {selectedCity}?</h2>
            </div>

            <div className="geo-prompt-body">
              <p>
                Мы определили город по вашему местоположению.
                Использовать этот город для поиска ближайших салонов?
              </p>
            </div>

            <div className="geo-prompt-actions">
              <button
                className="btn btn-secondary"
                onClick={handleChooseAnother}
              >
                Выбрать другой
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUseDetected}
              >
                Да, использовать
              </button>
            </div>

            <div className="geo-prompt-retry">
              <button
                className="btn btn-text"
                onClick={retryGeolocation}
              >
                <span className="material-symbols-outlined">my_location</span>
                Определить заново
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="geo-prompt-header">
              <span className="material-symbols-outlined geo-icon">map</span>
              <h2>Выберите город</h2>
            </div>

            <div className="geo-prompt-body">
              <div className="city-list">
                {AVAILABLE_CITIES.map((city) => (
                  <button
                    key={city}
                    className={`city-item ${selectedCity === city ? 'selected' : ''}`}
                    onClick={() => handleSelectCity(city)}
                  >
                    <span className="material-symbols-outlined">location_city</span>
                    {city}
                    {selectedCity === city && (
                      <span className="material-symbols-outlined check-icon">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="geo-prompt-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCityList(false)}
              >
                Назад
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeoLocationPrompt;
