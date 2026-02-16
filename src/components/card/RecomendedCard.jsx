import React from 'react';
import '../../style/RecomendedCard.css';

const RecomendedCard = ({
  education = false, 
  name, 
  specialty, 
  location, 
  workHours, 
  rating, 
  photoUrl,
  isFavorite = false,
  onToggleFavorite,
  onBook,
  onViewProfile,
  role = 'master',
}) => {
  const roleLabel = role === 'salon' ? 'Салон красоты' : 'Бьюти-мастер';

  return (
    <div className={`master-card ${education ? 'has-education' : ''}`}>
      <div className="has-edu">
        {education ? "есть обучение" : "нет обучения"}
      </div>

      <div className="card-header">
        <img 
          src={photoUrl || "https://via.placeholder.com/120"} 
          alt={name} 
          className="master-avatar"
        />
        <div className="master-info">
          <div className="master-title">
            <div className="master-role">{roleLabel}</div>
            <div className="rating">
              <span className="rating-value">{rating}</span>
              <span className="material-symbols-outlined star-icon">star</span>
            </div>
          </div>
          <h3 className="master-name">{name}</h3>
        </div>
      </div>

      <div className="master-details">
        <div className="detail-item">
          <span className="material-symbols-outlined detail-icon">location_on</span>
          <span className="detail-text">{location}</span>
        </div>
        <div className="detail-item">
          <span className="material-symbols-outlined detail-icon">person</span>
          <span className="detail-text">{specialty}</span>
        </div>
        <div className="detail-item">
          <span className="material-symbols-outlined detail-icon">access_time</span>
          <span className="detail-text">{workHours}</span>
        </div>
      </div>

      <div className="card-actions">
        <div className="card-top">
          <button className="book-btn" onClick={onBook}>
            Записаться
          </button>
          <button
            className="favorite-btn"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          >
            <span
              className={isFavorite ? "material-symbols-outlined favorite-icon active" : "material-symbols-outlined favorite-icon"}
            >
              {isFavorite ? "favorite" : "favorite_border"}
            </span>
          </button>
        </div>

        <button className="view-profile-btn" onClick={onViewProfile}>
          Посмотреть профиль мастера
        </button>
      </div>
    </div>
  );
};

export default RecomendedCard;