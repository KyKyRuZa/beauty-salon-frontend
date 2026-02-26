import React, { useEffect, useMemo, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite } from '../../api/favorites';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import BookingModal from '../../components/booking/BookingModal';
import '../../styles/catalog/CategoryProvidersPage.css';

const initialState = {
  favorites: {},
  loadingFavorites: {},
  isBookingModalOpen: false,
  selectedProvider: null,
  providerImages: {}
};

function categoryProvidersReducer(state, action) {
  switch (action.type) {
    case 'SET_FAVORITES':
      return { ...state, favorites: action.value };
    case 'SET_LOADING_FAVORITES':
      return { ...state, loadingFavorites: { ...state.loadingFavorites, [action.providerId]: action.value } };
    case 'TOGGLE_FAVORITE':
      return { ...state, favorites: { ...state.favorites, [action.providerId]: !state.favorites[action.providerId] } };
    case 'SET_BOOKING_MODAL':
      return { ...state, isBookingModalOpen: action.value };
    case 'SET_SELECTED_PROVIDER':
      return { ...state, selectedProvider: action.value };
    case 'SET_PROVIDER_IMAGES':
      return { ...state, providerImages: action.value };
    default:
      return state;
  }
}

const CategoryProvidersPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(categoryProvidersReducer, initialState);
  
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

  useEffect(() => {
    // Загружаем данные категории и услуг при монтировании компонента
    const fetchData = async () => {
      await Promise.all([
        loadCategoryById(categoryId),
        loadServicesByCategory(categoryId)
      ]);
    };

    fetchData();

    // Очищаем услуги при размонтировании компонента
    return () => {
      clearServices();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Загружаем изображения для мастеров и салонов
  useEffect(() => {
    const loadProviderImages = async () => {
      const newImages = { ...state.providerImages };
      let hasChanges = false;

      for (const service of services) {
        if (service.master && service.master_id) {
          const masterId = service.master_id;
          if (!newImages[`master_${masterId}`]) {
            const imageUrl = await getMasterImage(masterId);
            if (imageUrl) {
              newImages[`master_${masterId}`] = imageUrl;
              hasChanges = true;
            }
          }
        }

        if (service.salon && service.salon_id) {
          const salonId = service.salon_id;
          if (!newImages[`salon_${salonId}`]) {
            const imageUrl = await getSalonImage(salonId);
            if (imageUrl) {
              newImages[`salon_${salonId}`] = imageUrl;
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges) {
        dispatch({ type: 'SET_PROVIDER_IMAGES', value: newImages });
      }
    };

    if (services.length > 0) {
      loadProviderImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const handleBook = useCallback((service) => {
    dispatch({ type: 'SET_SELECTED_PROVIDER', value: {
      id: service.provider.id,
      type: service.provider.type,
      serviceId: service.id,
      serviceTitle: service.name
    }});
    dispatch({ type: 'SET_BOOKING_MODAL', value: true });
  }, []);

  const handleProfile = useCallback((providerId, type) => {
    navigate(`/provider/${providerId}?type=${type}`);
  }, [navigate]);

  const handleToggleFavorite = useCallback(async (e, providerId) => {
    e.stopPropagation();

    if (!user) {
      alert('Для добавления в избранное необходимо войти в систему');
      return;
    }

    // Оптимистичное обновление UI
    dispatch({ type: 'TOGGLE_FAVORITE', providerId });

    try {
      dispatch({ type: 'SET_LOADING_FAVORITES', providerId, value: true });
      await toggleFavorite(providerId);
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      alert(error.response?.data?.message || 'Ошибка при изменении избранного');
      // Откат изменения при ошибке
      dispatch({ type: 'TOGGLE_FAVORITE', providerId });
    } finally {
      dispatch({ type: 'SET_LOADING_FAVORITES', providerId, value: false });
    }
  }, [user]);

  // Трансформация данных для отображения - мемоизируем результат
  const transformedServices = useMemo(() => {
    return services.flatMap(service => {
      const serviceItems = [];

      if (service.master) {
        const masterImage = service.master.avatar_url ||
                           service.master.image_url ||
                           service.master.photo_url ||
                           service.master.avatar ||
                           service.master.image ||
                           state.providerImages[`master_${service.master_id}`] ||
                           'https://via.placeholder.com/100';

        serviceItems.push({
          ...service,
          provider: {
            id: service.master_id,
            type: 'master',
            typeName: 'Бьюти-мастер',
            name: `${service.master.first_name} ${service.master.last_name}`,
            image: masterImage,
            rating: service.master.rating || 4.8,
            address: service.master.address || 'Адрес не указан',
            hasTraining: false,
          }
        });
      }

      if (service.salon) {
        const salonImage = service.salon.logo_url ||
                          service.salon.image_url ||
                          service.salon.photo_url ||
                          service.salon.logo ||
                          service.salon.image ||
                          state.providerImages[`salon_${service.salon_id}`] ||
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
  }, [services, state.providerImages]);

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
                      className={`btn-favorite ${state.favorites[item.provider.id] ? 'active' : ''}`}
                      onClick={(e) => handleToggleFavorite(e, item.provider.id, item.provider.type)}
                      disabled={state.loadingFavorites[item.provider.id]}
                    >
                      <span className="material-symbols-outlined">
                        {state.favorites[item.provider.id] ? 'favorite' : 'favorite_border'}
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
      
      {/* Модальное окно записи */}
      <BookingModal
        isOpen={state.isBookingModalOpen}
        onClose={() => dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
        providerId={state.selectedProvider?.id}
        providerType={state.selectedProvider?.type}
        serviceId={state.selectedProvider?.serviceId}
        serviceTitle={state.selectedProvider?.serviceTitle}
      />
    </>
  );
};

export default CategoryProvidersPage;