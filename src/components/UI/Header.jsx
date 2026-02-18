import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../style/Header.css';
import logo from '../../assets/logo.svg';

const CITIES = ['Казань', 'Альметьевск', 'Уфа', 'Ижевск', 'Набережные Челны'];

const Header = () => {
  const { user, profile, getCurrentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCitiesOpen, setIsCitiesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Казань');

  const citiesRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (citiesRef.current && !citiesRef.current.contains(event.target)) {
        setIsCitiesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHome = () => {
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCitiesOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Проверка авторизации через auth сервис
  const isAuthenticated = getCurrentUser() !== null;

  // Действия для НЕ авторизованного пользователя
  const handleRegistration = () => {
    navigate('/auth?tab=register&type=user'); // Явно указываем параметры
    setIsProfileOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth?tab=login'); // Явно указываем параметры
    setIsProfileOpen(false);
  };

  // Действия для авторизованного пользователя
  const handleProfile = () => {
    // Админов перенаправляем в админ-панель
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/profile');
    }
    setIsProfileOpen(false);
  };

  const handleServices = () => {
    navigate('/catalog');
  };

  const handleChat = () => {
    navigate('/chat');
    setIsProfileOpen(false);
  };

  const handleSettings = () => {
    navigate('/profile#settings');
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    // Используем logout из контекста
    logout();
    setIsProfileOpen(false);
  };

  // Форматирование имени пользователя
  const getUserName = () => {
    if (!user) return "Профиль";

    switch(user.role) {
      case 'client':
        return `${profile?.firstName || user.firstName || 'Клиент'}`;
      case 'master':
        return `${profile?.firstName || user.firstName || 'Мастер'}`;
      case 'salon':
        return `${profile?.name?.split(' ')[0] || user.firstName || 'Салон'}`;
      case 'admin':
      case 'superadmin':
        return `${profile?.firstName || user.firstName || 'Администратор'}`;
      default:
        return user.email?.split('@')[0] || 'Профиль';
    }
  };

  // Получаем URL аватара
  const getUserAvatar = () => {
    if (!user) return null;
    
    // Проверяем сначала профиль, затем пользователя
    return profile?.image_url || user.avatar || null;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button
            className={`header-menu-toggle ${isMenuOpen ? 'header-menu-toggle--open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="header-logo" onClick={handleHome}>
            <img src={logo} alt="logo" className="logo" />
          </div>

          <nav className={`header-nav ${isMenuOpen ? 'header-nav--open' : ''}`}>
            <a onClick={handleServices} className="header-nav-link">
              Услуги
            </a>
            <a href="#pricing" className="header-nav-link">
              Отзывы
            </a>
            <a href="#contacts" className="header-nav-link">
              О нас
            </a>
          </nav>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <span className="material-symbols-outlined search-icon">search</span>
            </button>
          </div>
        </form>

        <div className="header-right">
          <div className="header-location" ref={citiesRef}>
            <button
              className="location-trigger"
              onClick={() => setIsCitiesOpen(!isCitiesOpen)}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>location_on</span>
              <span className="location-text">{selectedCity}</span>
              <span
                className={`material-symbols-outlined expand-icon ${isCitiesOpen ? 'expand-icon--rotated' : ''}`}
                style={{fontSize: '1rem'}}
              >
                expand_more
              </span>
            </button>

            <div className={`cities-dropdown ${isCitiesOpen ? 'cities-dropdown--open' : ''}`}>
              {CITIES.map(city => (
                <button
                  key={city}
                  className={`city-option ${city === selectedCity ? 'selected' : ''}`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="header-profile" ref={profileRef}>
            <button
              className="header-action-btn profile-trigger"
              onClick={toggleProfileDropdown}
            >
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                  alt="Аватар"
                  className="user-avatar-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const previousElement = e.target.previousElementSibling;
                    if (previousElement) {
                      previousElement.style.display = 'block';
                    }
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  <span className="material-symbols-outlined" style={{fontSize: '2rem'}}>account_circle</span>
                </div>
              )}
              {isAuthenticated && user && (
                <span className="user-badge">
                  {getUserName().charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <div className={`profile-dropdown ${isProfileOpen ? 'profile-dropdown--open' : ''}`}>
              {isAuthenticated ? (
                <>
                  <div className="user-info">
                    <div className="user-avatar">
                      {getUserAvatar() ? (
                        <img
                          src={getUserAvatar()}
                          alt="Аватар"
                          className="user-avatar-img-small"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const initialsPlaceholder = e.target.parentElement.querySelector('.initials-placeholder');
                            if (initialsPlaceholder) {
                              initialsPlaceholder.style.display = 'flex';
                            }
                          }}
                        />
                      ) : (
                        <div className="initials-placeholder">
                          <span className="initials-placeholder-text">
                            {getUserName().charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <strong>{getUserName()}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>
                  
                  <hr className="profile-divider" />
                  
                  <button className="profile-option" onClick={handleProfile}>
                    <span className="material-symbols-outlined option-icon" style={{fontSize: '1rem'}}>account_circle</span>
                    Профиль
                  </button>
                  <button className="profile-option" onClick={handleChat}>
                    <span className="material-symbols-outlined option-icon" style={{fontSize: '1rem'}}>chat</span>
                    Чат
                  </button>
                  <button className="profile-option" onClick={handleSettings}>
                    <span className="material-symbols-outlined option-icon" style={{fontSize: '1rem'}}>settings</span>
                    Настройки
                  </button>
                  <hr className="profile-divider" />
                  <button className="profile-option logout" onClick={handleLogout}>
                    <span className="material-symbols-outlined option-icon" style={{fontSize: '1rem'}}>logout</span>
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <button className="profile-option" onClick={handleLogin}>
                    Вход
                  </button>
                  <button className="profile-option" onClick={handleRegistration}>
                    Регистрация
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;