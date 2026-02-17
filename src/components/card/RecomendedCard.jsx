import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite, checkFavorite } from '../../api/favorites';
import '../../style/RecomendedCard.css';

const RecomendedCard = ({
  education = false,
  name,
  specialty,
  location,
  workHours,
  rating,
  photoUrl,
  masterId,
  isFavorite: parentIsFavorite,
  onToggleFavorite: parentOnToggleFavorite,
  onBook,
  onViewProfile,
  role = 'master',
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(parentIsFavorite || false);
  const roleLabel = role === 'salon' ? 'Салон красоты' : 'Бьюти-мастер';

  // Проверка статуса избранного при загрузке
  useEffect(() => {
    if (user && masterId && parentIsFavorite === undefined) {
      checkFavoriteStatus();
    }
  }, [masterId, user]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await checkFavorite(masterId);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Ошибка проверки статуса избранного:', error);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    if (!user) {
      alert('Для добавления в избранное необходимо войти в систему');
      return;
    }

    try {
      const response = await toggleFavorite(masterId);
      setIsFavorite(response.data.added);

      if (parentOnToggleFavorite) {
        parentOnToggleFavorite(masterId, response.data.added);
      }
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      alert(error.response?.data?.message || 'Ошибка при изменении избранного');
    }
  };

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
            onClick={handleToggleFavorite}
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