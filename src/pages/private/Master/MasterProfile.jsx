import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import '../../../style/Profile.css';
import photo from '../../../assets/photo.png';
import Header from "../../../components/UI/Header";
import { ServiceManagement } from "../../../components/catalog";
import ReviewsList from "../../../components/reviews/ReviewsList";

const MasterProfile = ({ handleLogout }) => {
  const { user, profile, updateProfile: updateProfileInternal } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('schedule');
  const [settings, setSettings] = useState({ notifications: true, privacy: 'public' });

  // Загрузка настроек при активации секции
  useEffect(() => {
    if (activeSection === 'settings') {
      loadSettings();
    }
  }, [activeSection]);


  const loadSettings = async () => {
    // В реальном приложении здесь будет загрузка настроек с сервера
    // Пока что просто устанавливаем значения по умолчанию
    setSettings({
      notifications: true,
      privacy: 'public',
      profileVisibility: 'all',
      emailNotifications: true,
      smsNotifications: false
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'schedule':
        return (
          <section className="section">
            <h2 className="section-title">МОЁ РАСПИСАНИЕ</h2>
            <div className="orders-list">
                <p>В разработке</p>
            </div>
            <button className="btn-primary full-width">Управлять расписанием</button>
          </section>
        );

      case 'services':
        return (
          <section className="section">
            <h2 className="section-title">МОИ УСЛУГИ</h2>
            <ServiceManagement />
          </section>
        );

      case 'reviews':
        return (
          <section className="section">
            <h2 className="section-title">ОТЗЫВЫ КЛИЕНТОВ</h2>
            <ReviewsList
              masterId={profile?.id}
              showForm={false}
            />
          </section>
        );
      
      case 'stats':
        return (
          <section className="section">
            <h2 className="section-title">СТАТИСТИКА</h2>
            <div className="stats-grid">
              <p>В разработке</p>
            </div>
          </section>
        );

      case 'settings':
        return (
          <section className="section">
            <h2 className="section-title">НАСТРОЙКИ ПРОФИЛЯ</h2>
            <div className="settings-list">
              <div className="setting-item">
                <span>Уведомления</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications} 
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <span>Конфиденциальность профиля</span>
                <select 
                  value={settings.profileVisibility} 
                  onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
                  className="select-input"
                >
                  <option value="all">Видно всем</option>
                  <option value="clients">Только клиентам</option>
                  <option value="none">Скрыто</option>
                </select>
              </div>
              
              <div className="setting-item">
                <span>Уведомления по Email</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications} 
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <span>Уведомления по SMS</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={settings.smsNotifications} 
                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  />
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

            <button className="btn-primary full-width">Сохранить изменения</button>
          </section>
        );
      
      default:
        return (
          <section className="section">
            <h2 className="section-title">РАСПИСАНИЕ</h2>
            <p>Выберите раздел для управления вашим профилем</p>
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
                <span className="role-label">Личный кабинет мастера</span>
              </div>
              <div className="avatar-wrapper">
                <div className="avatar-edit-wrapper">
                  <label htmlFor="avatar-upload-master" className="avatar-clickable-area">
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
                  id="avatar-upload-master"
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

              {profile?.specialization && (
                <div className="info-item">
                  <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>work_outline</span>
                  <span>Специализация: {profile?.specialization}</span>
                </div>
              )}

              

              {profile?.experience !== undefined && profile?.experience !== null && (
                <div className="info-item">
                  <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>work_outline</span>
                  <span>Опыт работы: {profile.experience} лет</span>
                </div>
              )}
              <div className="info-item">
                <span className="material-symbols-outlined" style={{ color: '#666', fontSize: '1rem' }}>star_border</span>
                <span>Рейтинг: {profile?.rating || '4.9'} ★</span>
              </div>
            </div>

            <button
              className={`sidebar-btn ${activeSection === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveSection('schedule')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>schedule</span>
              Расписание
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'services' ? 'active' : ''}`}
              onClick={() => setActiveSection('services')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>work_outline</span>
              Мои услуги
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>star_border</span>
              Отзывы
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveSection('stats')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>bar_chart</span>
              Статистика
            </button>

            <button
              className={`sidebar-btn ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>settings</span>
              Настройки
            </button>

            <button
              className="sidebar-btn"
              onClick={() => navigate('/chat')}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>chat_bubble_outline</span>
              Сообщения
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

export default MasterProfile;