import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import '../../../styles/Profile.css';
import photo from '../../../assets/photo.png';
import Header from "../../../components/ui/Header";
import { getCatalogServices as CatalogService } from "../../../api/catalog";
import BookingHistory from "../../../components/booking/BookingHistory";
import { getFavorites } from "../../../api/favorites";

const ClientProfile = ({ handleLogout }) => {
  const { user, profile, updateProfile: updateProfileInternal } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('recommendations');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);


  // Загрузка рекомендаций при активации секции
  useEffect(() => {
    if (activeSection === 'recommendations') {
      loadRecommendations();
    } else if (activeSection === 'favorites') {
      loadFavorites();
    }
  }, [activeSection]);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await CatalogService();
      const services = response.data.data || [];
      setRecommendations(services.slice(0, 3));
    } catch (error) {
      console.error('Ошибка при загрузке рекомендаций:', error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const response = await getFavorites();
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки избранных:', error);
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  };


  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <section className="section">
            <BookingHistory />
          </section>
        );

      case 'settings':
        return (
          <section className="section">
            <h2 className="section-title">НАСТРОЙКИ</h2>
            <div className="settings-list">
              <div className="setting-item">
                <span>Уведомления</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <span>Редактировать профиль</span>
                <button
                  className="link-btn"
                  onClick={() => navigate('/profile/edit')}
                >
                  Изменить данные
                </button>
              </div>
            </div>
          </section>
        );

      case 'feedback':
        return (
          <section className="section">
            <h2 className="section-title">МОИ ОТЗЫВЫ</h2>
            <div className="orders-list">
                <p>В разработке</p>
            </div>
            <button className="btn-primary full-width">Показать все отзывы</button>
          </section>
        );

      case 'favorites':
        return (
          <section className="section">
            <h2 className="section-title">ИЗБРАННЫЕ МАСТЕРА</h2>
            {loadingFavorites ? (
              <p>Загрузка...</p>
            ) : favorites.length > 0 ? (
              <div className="favorites-grid">
                {favorites.map(master => (
                  <div key={master.id} className="favorite-card">
                    <img 
                      src={master.image_url || photo} 
                      alt={`${master.first_name} ${master.last_name}`}
                      className="favorite-avatar"
                    />
                    <h3>{master.first_name} {master.last_name}</h3>
                    <p className="favorite-specialty">{master.specialization || 'Специализация не указана'}</p>
                    <div className="favorite-info">
                      <span className="material-symbols-outlined icon">star</span>
                      <span>{master.rating || 'N/A'}</span>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate(`/provider/${master.id}?type=master`)}
                    >
                      Перейти в профиль
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-favorites">
                <p>У вас пока нет избранных мастеров</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/catalog')}
                >
                  Найти мастеров
                </button>
              </div>
            )}
          </section>
        );

      case 'recommendations':
      default:
        return (
          <section className="section">
            <h2 className="section-title">РЕКОМЕНДАЦИИ ДЛЯ ВАС</h2>
            <div className="recommendations-grid">
              {loadingRecommendations ? (
                <p>Загрузка рекомендаций...</p>
              ) : recommendations.length > 0 ? (
                recommendations.map((service, index) => (
                  <div key={service.id || index} className="recommendation-card">
                    <img src={photo} alt={service.name || "Рекомендация"} />
                    <h3>{service.name || 'Услуга'}</h3>
                    <p>От {service.minPrice || 'цена не указана'} ₽</p>
                    <button className="btn-sm">Записаться</button>
                  </div>
                ))
              ) : (
                <p>У вас пока нет рекомендаций</p>
              )}
            </div>
          </section>
        );
    }
  };

  // Получаем имя и фамилию из профиля, если они существуют, иначе из основного объекта пользователя
  const firstName = profile?.firstName || user?.firstName || '';
  const lastName = profile?.lastName || user?.lastName || '';

  // Определяем URL аватара: сначала проверяем профиль, затем пользователя
  const avatarUrl = profile?.image_url || user?.avatar || photo;

  return (
    <div className="profile-page">
      <Header />
      <div className="container">
        <div className="profile-layout">
          <aside className="sidebar">
            <div className="master-card">
              <div className="role-selector-wrapper">
                <span className="role-label">Личный кабинет клиента</span>
              </div>
              <div className="avatar-wrapper">
                <div className="avatar-edit-wrapper">
                  <label htmlFor="avatar-upload" className="avatar-clickable-area">
                    <div className="avatar-content">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Аватар" className="avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          <span className="material-symbols-outlined" style={{fontSize: '2rem'}}>account_circle</span>
                          <span className="avatar-initials-text">
                            {firstName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="avatar-overlay">
                        <div className="avatar-actions">
                          <span className="avatar-change-btn">
                            +
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('avatar', file);

                      // Вызываем обновление профиля
                      updateProfileInternal(formData);
                    }
                  }}
                />
              </div>
              <h2 className="master-name">
                {firstName} {lastName}
              </h2>
              <div className="info-item email-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>alternate_email</span>
                <span>{user?.email || 'Email не указан'}</span>
              </div>

              <div className="info-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>phone</span>
                <span>Телефон: {user?.phone || 'Не указан'}</span>
              </div>
            </div>

            <button
              className={`sidebar-btn ${activeSection === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveSection('recommendations')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>recommend</span>
              Рекомендации
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>shopping_bag</span>
              Мои заказы
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveSection('favorites')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>favorite</span>
              Избранное
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveSection('feedback')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>rate_review</span>
              Мои отзывы
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>settings</span>
              Настройки
            </button>

            <button className="sidebar-btn logout" onClick={handleLogout}>
              Выйти
            </button>
          </aside>

          <section className="content">
            {renderContent()}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
