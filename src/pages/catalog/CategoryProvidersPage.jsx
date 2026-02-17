import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite } from '../../api/favorites';
import Header from '../../components/UI/Header';
import Footer from '../../components/UI/Footer';
import '../../style/catalog/CategoryProvidersPage.css';

const CategoryProvidersPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasLoaded = useRef(false); // Для отслеживания, были ли данные уже загружены

  const [favorites, setFavorites] = useState({}); // { [providerId]: boolean }
  const [loadingFavorites, setLoadingFavorites] = useState({}); // { [providerId]: boolean }
  
  const {
    selectedCategory,
    services,
    loading,
    error,
    loadCategoryById,
    loadServicesByCategory,
    getMasterImage,
    getSalonImage,
    clearServices
  } = useCatalog();
  
  // Состояние для хранения изображений
  const [providerImages, setProviderImages] = useState({});

  useEffect(() => {
    // Загружаем данные категории и услуг при монтировании компонента
    const fetchData = async () => {
      // Проверяем, не загружались ли уже данные
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        await Promise.all([
          loadCategoryById(categoryId),
          loadServicesByCategory(categoryId)
        ]);
      }
    };

    fetchData();

    // Очищаем услуги при размонтировании компонента
    return () => {
      clearServices();
      hasLoaded.current = false; // Сбрасываем флаг при размонтировании
    };
  }, [categoryId, loadCategoryById, loadServicesByCategory, clearServices]);

  // Загружаем изображения для мастеров и салонов
  useEffect(() => {
    const loadProviderImages = async () => {
      const newImages = { ...providerImages };

      for (const service of services) {
        // Загружаем изображение для мастера, если оно не существует
        if (service.master && service.master_id) {
          const masterId = service.master_id;
          if (!newImages[`master_${masterId}`]) {
            const imageUrl = await getMasterImage(masterId);
            if (imageUrl) {
              newImages[`master_${masterId}`] = imageUrl;
            }
          }
        }

        // Загружаем изображение для салона, если оно не существует
        if (service.salon && service.salon_id) {
          const salonId = service.salon_id;
          if (!newImages[`salon_${salonId}`]) {
            const imageUrl = await getSalonImage(salonId);
            if (imageUrl) {
              newImages[`salon_${salonId}`] = imageUrl;
            }
          }
        }
      }

      if (Object.keys(newImages).length > Object.keys(providerImages).length) {
        setProviderImages(newImages);
      }
    };

    if (services.length > 0) {
      loadProviderImages();
    }
  }, [services, getMasterImage, getSalonImage, providerImages]);

  const handleBook = useCallback((service) => {
    navigate(`/catalog/provider/${service.provider.id}/service/${service.id}/timeslots?type=${service.provider.type}`);
  }, [navigate]);

  const handleProfile = useCallback((providerId, type) => {
    navigate(`/provider/${providerId}?type=${type}`);
  }, [navigate]);

  const handleToggleFavorite = useCallback(async (e, providerId, providerType) => {
    e.stopPropagation();

    if (!user) {
      alert('Для добавления в избранное необходимо войти в систему');
      return;
    }

    // Оптимистичное обновление UI
    setFavorites(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));

    try {
      setLoadingFavorites(prev => ({ ...prev, [providerId]: true }));
      await toggleFavorite(providerId);
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      alert(error.response?.data?.message || 'Ошибка при изменении избранного');
      // Откат изменения при ошибке
      setFavorites(prev => ({
        ...prev,
        [providerId]: !prev[providerId]
      }));
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [providerId]: false }));
    }
  }, [user]);

  // Трансформация данных для отображения - мемоизируем результат
  const transformedServices = useMemo(() => {
    return services.flatMap(service => {
      const serviceItems = [];

      if (service.master) {
        // Проверяем различные возможные поля для изображения мастера
        // Если изображение не найдено в основном ответе, используем изображение из providerImages
        const masterImage = service.master.avatar_url || 
                           service.master.image_url || 
                           service.master.photo_url || 
                           service.master.avatar || 
                           service.master.image || 
                           providerImages[`master_${service.master_id}`] ||
                           'https://via.placeholder.com/100';
                           
        serviceItems.push({
          ...service,
          provider: {
            id: service.master_id,
            type: 'master',
            typeName: 'Бьюти-мастер',
            name: `${service.master.first_name} ${service.master.last_name}`,
            image: masterImage, // Используем найденное изображение
            rating: service.master.rating || 4.8,
            address: service.master.address || 'Адрес не указан',
            hasTraining: false, // Mock data based on image logic
          }
        });
      }

      if (service.salon) {
        // Проверяем различные возможные поля для изображения салона
        // Если изображение не найдено в основном ответе, используем изображение из providerImages
        const salonImage = service.salon.logo_url || 
                          service.salon.image_url || 
                          service.salon.photo_url || 
                          service.salon.logo || 
                          service.salon.image || 
                          providerImages[`salon_${service.salon_id}`] ||
                          'https://via.placeholder.com/100';
                          
        serviceItems.push({
          ...service,
          provider: {
            id: service.salon_id,
            type: 'salon',
            typeName: 'Салон красоты',
            name: service.salon.name,
            image: salonImage, // Используем найденное изображение
            rating: service.salon.rating || 4.8,
            address: service.salon.address || 'Адрес не указан',
            hasTraining: true, // Mock data based on image logic
          }
        });
      }

      return serviceItems;
    });
  }, [services, providerImages]);

  if (loading.category || loading.services) return <div className="loading-container">Загрузка...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <>
      <Header />
      <div className="category-providers-page">

        {/* Header Section */}
        <div className="page-header">
          <div className="header-top">
            <span className="category-breadcrumb">{selectedCategory?.name || 'Категория'}</span>
            <button className="map-toggle">Показать на карте</button>
          </div>
          <h1 className="page-title">ВЫБЕРИТЕ САЛОН / МАСТЕРА</h1>

          {/* Filters Bar (Visual only for this update) */}
          <div className="filters-bar">
            <select className="filter-select"><option>Все</option></select>
            <select className="filter-select"><option>По популярности</option></select>
            <label className="checkbox-label">
              <input type="checkbox" /> Сначала избранные
            </label>
            <div className="price-filter">
              <span>Цена, ₽</span>
              <input type="number" placeholder="400" />
              <span>до</span>
              <input type="number" placeholder="10 000" />
            </div>
          </div>
        </div>

        <div className="services-section">
          <div className="services-grid">
            {transformedServices.map((item) => (
              <div key={`${item.id}-${item.provider.id}-${item.provider.type}`} className="provider-card">

                <div className={`card-badge ${item.provider.hasTraining ? 'badge-green' : 'badge-gray'}`}>
                  {item.provider.hasTraining ? 'есть обучение' : 'нет обучения'}
                </div>

                <div className="card-header-content">
                  <img 
                    src={item.provider.image} 
                    alt={item.provider.name} 
                    className="provider-avatar"
                  />

                  <div className="provider-text-info">
                    <div className="provider-type-row">
                      <span className="type-label">{item.provider.typeName}</span>
                      <div className="rating-badge">
                        {item.provider.rating} <span className="star">★</span>
                      </div>
                    </div>
                    <h3 className="provider-name">{item.provider.name}</h3>
                  </div>
                </div>

                {/* Card Body: Details */}
                <div className="card-body">
                  <div className="info-row">
                    <span className="icon">
                      <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>location_on</span>
                    </span>
                    <span className="text">{item.provider.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="icon">✂️</span>
                    <span className="text">{item.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="icon">🕒</span>
                    <span className="text">09:00 - 19:00</span> {/* Mock hours or dynamic if available */}
                  </div>
                </div>

                <div className="card-footer">
                  <div className='card-row'>
                    <button
                      className="btn-book"
                      onClick={(e) => { e.stopPropagation(); handleBook(item); }}
                    >
                      ЗАПИСАТЬСЯ
                    </button>
                    <button 
                      className={`btn-favorite ${favorites[item.provider.id] ? 'active' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, item.provider.id, item.provider.type)}
                      disabled={loadingFavorites[item.provider.id]}
                    >
                      <span className="material-symbols-outlined">
                        {favorites[item.provider.id] ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>

                  <button
                    className="btn-profile"
                    onClick={(e) => { e.stopPropagation(); handleProfile(item.provider.id, item.provider.type); }}
                  >
                    ПОСМОТРЕТЬ ПРОФИЛЬ {item.provider.type === 'master' ? 'МАСТЕРА' : 'САЛОНА'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Экспортируем компонент с memo для предотвращения лишних перерендеров
export default React.memo(CategoryProvidersPage);