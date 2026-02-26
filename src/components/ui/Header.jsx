import React, { useReducer, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ui.css';
import logo from '../../assets/logo.svg';

const CITIES = ['Казань', 'Альметьевск', 'Уфа', 'Ижевск', 'Набережные Челны'];

const initialState = {
  isMenuOpen: false,
  searchQuery: '',
  isCitiesOpen: false,
  isProfileOpen: false,
  selectedCity: 'Казань'
};

function headerReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_MENU':
      return { ...state, isMenuOpen: !state.isMenuOpen };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.value };
    case 'TOGGLE_CITIES':
      return { ...state, isCitiesOpen: !state.isCitiesOpen };
    case 'TOGGLE_PROFILE':
      return { ...state, isProfileOpen: !state.isProfileOpen };
    case 'SET_SELECTED_CITY':
      return { ...state, selectedCity: action.value, isCitiesOpen: false };
    case 'CLOSE_CITIES':
      return { ...state, isCitiesOpen: false };
    case 'CLOSE_PROFILE':
      return { ...state, isProfileOpen: false };
    default:
      return state;
  }
}

const Header = () => {
  const { user, profile, getCurrentUser, logout } = useAuth();
  const [state, dispatch] = useReducer(headerReducer, initialState);

  const citiesRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (citiesRef.current && !citiesRef.current.contains(event.target)) {
        dispatch({ type: 'CLOSE_CITIES' });
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        dispatch({ type: 'CLOSE_PROFILE' });
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
    dispatch({ type: 'SET_SELECTED_CITY', value: city });
  };

  const toggleProfileDropdown = () => {
    dispatch({ type: 'TOGGLE_PROFILE' });
  };

  // Проверка авторизации через auth сервис
  const isAuthenticated = getCurrentUser() !== null;

  // Действия для НЕ авторизованного пользователя
  const handleRegistration = () => {
    navigate('/auth?tab=register&type=user');
    dispatch({ type: 'CLOSE_PROFILE' });
  };

  const handleLogin = () => {
    navigate('/auth?tab=login');
    dispatch({ type: 'CLOSE_PROFILE' });
  };

  // Действия для авторизованного пользователя
  const handleProfile = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/profile');
    }
    dispatch({ type: 'CLOSE_PROFILE' });
  };

  const handleChat = () => {
    navigate('/chat');
    dispatch({ type: 'CLOSE_PROFILE' });
  };

  const handleSettings = () => {
    navigate('/profile#settings');
    dispatch({ type: 'CLOSE_PROFILE' });
  };

  const handleLogout = () => {
    logout();
    dispatch({ type: 'CLOSE_PROFILE' });
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
            className={`header-menu-toggle ${state.isMenuOpen ? 'header-menu-toggle--open' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            className="header-logo"
            onClick={handleHome}
            onKeyDown={(e) => e.key === 'Enter' && handleHome()}
            role="button"
            tabIndex={0}
          >
            <img src={logo} alt="logo" className="logo" />
          </div>

          <nav className={`header-nav ${state.isMenuOpen ? 'header-nav--open' : ''}`}>
            <Link to="/catalog" className="header-nav-link">
              Услуги
            </Link>
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
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', value: e.target.value })}
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
              onClick={() => dispatch({ type: 'TOGGLE_CITIES' })}
            >
              <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>location_on</span>
              <span className="location-text">{state.selectedCity}</span>
              <span
                className={`material-symbols-outlined expand-icon ${state.isCitiesOpen ? 'expand-icon--rotated' : ''}`}
                style={{fontSize: '1rem'}}
              >
                expand_more
              </span>
            </button>

            <div className={`cities-dropdown ${state.isCitiesOpen ? 'cities-dropdown--open' : ''}`}>
              {CITIES.map(city => (
                <button
                  key={city}
                  className={`city-option ${city === state.selectedCity ? 'selected' : ''}`}
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

            <div className={`profile-dropdown ${state.isProfileOpen ? 'profile-dropdown--open' : ''}`}>
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