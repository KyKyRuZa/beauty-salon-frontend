import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { toggleFavorite } from '../api/favorites';
import { getTopMasters } from '../api/providers';
import { logger } from '../utils/logger';
import '../styles/Recomended.css';
import RecomendedCard from './card/RecomendedCard';

const Recomended = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [masters, setMasters] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка топ мастеров при монтировании
  useEffect(() => {
    const loadTopMasters = async () => {
      try {
        setLoading(true);
        const response = await getTopMasters(4, 4.5);

        if (response.success && response.data) {
          setMasters(response.data);

          // Загружаем избранные для авторизованных
          if (isAuthenticated) {
            // TODO: загрузить список избранных из API
          }
        } else {
          setError(response.message || 'Не удалось загрузить мастеров');
        }
      } catch (err) {
        logger.error('Ошибка загрузки топ мастеров:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    loadTopMasters();
  }, [isAuthenticated]);

  const handleBook = (masterId, specialty) => {
    // Переход на страницу записи
    navigate(`/catalog?specialty=${encodeURIComponent(specialty)}`);
  };

  const handleViewProfile = (masterId, type) => {
    navigate(`/provider/${masterId}?type=${type}`);
  };

  const handleToggleFavorite = async (e, masterId) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Для добавления в избранное необходимо войти в систему');
      return;
    }

    // Оптимистичное обновление UI
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(masterId)) {
        newSet.delete(masterId);
      } else {
        newSet.add(masterId);
      }
      return newSet;
    });

    try {
      await toggleFavorite(masterId);
    } catch (err) {
      logger.error('Ошибка переключения избранного:', err);
      toast.error(err.message || 'Ошибка при изменении избранного');
      // Откат изменения при ошибке
      setFavorites(prev => {
        const newSet = new Set(prev);
        if (newSet.has(masterId)) {
          newSet.delete(masterId);
        } else {
          newSet.add(masterId);
        }
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="recomended-container">
        <h1>РЕКОМЕНДУЕМ МАСТЕРОВ</h1>
        <div className="card-container loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-skeleton">
              <div className="skeleton-photo"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-specialty"></div>
                <div className="skeleton-location"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recomended-container">
        <h1>РЕКОМЕНДУЕМ МАСТЕРОВ</h1>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (masters.length === 0) {
    return (
      <div className="recomended-container">
        <h1>РЕКОМЕНДУЕМ МАСТЕРОВ</h1>
        <div className="no-masters">
          <p>Пока нет мастеров с высоким рейтингом</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recomended-container">
      <h1>РЕКОМЕНДУЕМ МАСТЕРОВ</h1>
      <div className="card-container">
        {masters.map((master) => (
          <RecomendedCard
            key={master.id}
            {...master}
            isFavorite={favorites.has(master.id)}
            onBook={() => handleBook(master.id, master.specialty)}
            onViewProfile={() => handleViewProfile(master.id, master.role)}
            onToggleFavorite={(e) => handleToggleFavorite(e, master.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Recomended;