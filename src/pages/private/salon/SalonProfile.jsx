import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import '../../../styles/Profile.css';
import photo from '../../../assets/photo.png';
import Header from "../../../components/ui/Header";
import { ServiceManagement } from "../../../components/catalog";
import ReviewsList from "../../../components/reviews/ReviewsList";

const SalonProfile = ({ handleLogout }) => {
  const { user, profile, updateProfile: updateProfileInternal } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('masters');
  const renderContent = () => {
    switch (activeSection) {
      case 'masters':
        return (
          <section className="section">
            <h2 className="section-title">МОИ МАСТЕРА</h2>
            <div className="masters-grid">
                <p>В разработке</p>
            </div>
            <button className="btn-primary full-width">Добавить мастера</button>
          </section>
        );

      case 'schedule':
        return (
          <section className="section">
            <h2 className="section-title">РАСПИСАНИЕ САЛОНА</h2>
            <div className="orders-list">
                <p>В разработке</p>
            </div>
            <button className="btn-primary full-width">Управлять расписанием</button>
          </section>
        );
      
      case 'analytics':
        return (
          <section className="section">
            <h2 className="section-title">АНАЛИТИКА</h2>
            <div className="stats-grid">
              <p>В разработке</p>
            </div>
            <div className="analytics-chart">
              <h3>Динамика записей</h3>
              <p>График будет отображаться здесь</p>
            </div>
          </section>
        );

      case 'services':
        return (
          <section className="section">
            <h2 className="section-title">УСЛУГИ САЛОНА</h2>
            <ServiceManagement />
          </section>
        );

      case 'reviews':
        return (
          <section className="section">
            <h2 className="section-title">ОТЗЫВЫ КЛИЕНТОВ</h2>
            <ReviewsList
              salonId={profile?.id}
              showForm={false}
            />
          </section>
        );

      case 'settings':
        return (
          <section className="section">
            <h2 className="section-title">НАСТРОЙКИ САЛОНА</h2>
            <div className="settings-list">
              <div className="setting-item">
                <span>Информация о салоне</span>
                <button
                  className="link-btn"
                  onClick={() => navigate('/profile/edit')}
                >
                  Редактировать
                </button>
              </div>
              <div className="setting-item">
                <span>Услуги и цены</span>
                <button className="link-btn" onClick={() => setActiveSection('services')}>
                  Управлять
                </button>
              </div>
              <div className="setting-item">
                <span>Рабочие часы</span>
                <button className="link-btn">Настроить</button>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="section">
            <h2 className="section-title">УПРАВЛЕНИЕ САЛОНОМ</h2>
            <p>Выберите раздел для управления вашим салоном</p>
          </section>
        );
    }
  };

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
                <span className="role-label">Личный кабинет салона</span>
              </div>
              <div className="avatar-wrapper">
                <div className="avatar-edit-wrapper">
                  <label htmlFor="avatar-upload-salon" className="avatar-clickable-area">
                    <div className="avatar-content">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Логотип салона" className="avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          <span className="material-symbols-outlined" style={{fontSize: '2rem'}}>account_circle</span>
                          <span className="avatar-initials-text">
                            {profile?.name?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || 'С'}
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
                  id="avatar-upload-salon"
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
              <h2 className="master-name">{profile?.name || 'Название салона'}</h2>
              <div className="info-item email-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>alternate_email</span>
                <span>{user?.email || 'Email не указан'}</span>
              </div>

              <div className="info-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>phone</span>
                <span>Телефон: {user?.phone || 'Не указан'}</span>
              </div>

              <div className="info-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>location_on</span>
                <span>Адрес: {profile?.address || 'Не указан'}</span>
              </div>

              <div className="info-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>business</span>
                <span>Название: {profile?.name || 'Название салона'}</span>
              </div>
              {profile?.inn && (
                <div className="info-item">
                  <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>calendar_month</span>
                  <span>ИНН: {profile?.inn}</span>
                </div>
              )}
            </div>

            <button
              className={`sidebar-btn ${activeSection === 'masters' ? 'active' : ''}`}
              onClick={() => setActiveSection('masters')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>groups</span>
              Мастера
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveSection('schedule')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>calendar_month</span>
              Расписание
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>bar_chart</span>
              Аналитика
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'services' ? 'active' : ''}`}
              onClick={() => setActiveSection('services')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>work_outline</span>
              Услуги
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>star_border</span>
              Отзывы
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

export default SalonProfile;