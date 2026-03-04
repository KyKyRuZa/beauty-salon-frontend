import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/SalonCard.css';

const SalonCard = ({ salon, isSelected, onClick, onBook, onFavorite }) => {
  const {
    id,
    name,
    rating,
    image_url,
    address,
    city,
    coordinates,
    working_hours,
    distance_km,
    is_verified
  } = salon;

  // Проверка, открыт ли салон сейчас
  const isOpenNow = () => {
    if (!working_hours) return false;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 60 + currentMinutes;
    
    const daySchedule = working_hours[currentDay];
    if (!daySchedule || !daySchedule.is_open) return false;
    
    const [openHours, openMinutes] = daySchedule.open.split(':').map(Number);
    const [closeHours, closeMinutes] = daySchedule.close.split(':').map(Number);
    
    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const open = isOpenNow();

  return (
    <div
      className={`salon-card ${isSelected ? 'selected' : ''} ${!is_verified ? 'unverified' : ''}`}
      onClick={onClick}
    >
      <div className="salon-card-image-wrapper">
        {image_url ? (
          <img src={image_url} alt={name} className="salon-card-image" />
        ) : (
          <div className="salon-card-image-placeholder">
            <span className="material-symbols-outlined">business</span>
          </div>
        )}
        {is_verified && (
          <div className="verified-badge" title="Проверенный салон">
            <span className="material-symbols-outlined">verified</span>
          </div>
        )}
      </div>

      <div className="salon-card-content">
        <div className="salon-card-header">
          <h3 className="salon-card-name">{name}</h3>
          <div className="salon-card-rating">
            <span className="material-symbols-outlined star-icon">star</span>
            <span className="rating-value">{rating || 'N/A'}</span>
          </div>
        </div>

        <div className="salon-card-info">
          <div className="info-row">
            <span className="material-symbols-outlined info-icon">location_on</span>
            <span className="info-text">{address || 'Адрес не указан'}</span>
          </div>

          {city && (
            <div className="info-row">
              <span className="material-symbols-outlined info-icon">map</span>
              <span className="info-text">{city}</span>
            </div>
          )}

          {distance_km && (
            <div className="info-row distance">
              <span className="material-symbols-outlined info-icon">directions_walk</span>
              <span className="info-text">{distance_km} км от вас</span>
            </div>
          )}

          <div className="info-row">
            <span className="material-symbols-outlined info-icon">schedule</span>
            <span className={`info-text ${open ? 'open' : 'closed'}`}>
              {open ? 'Открыто сейчас' : 'Закрыто'}
            </span>
          </div>
        </div>

        <div className="salon-card-actions">
          <Link
            to={`/providers/salon/${id}`}
            className="btn btn-outline"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined">info</span>
            Профиль
          </Link>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onBook?.(salon);
            }}
          >
            <span className="material-symbols-outlined">event</span>
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
