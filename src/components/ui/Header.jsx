import React, { useReducer, useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchForm from './SearchForm';
import ProfileDropdown from './ProfileDropdown';
import '../../styles/ui.css';
import '../../styles/ProfileDropdown.css';
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  const citiesRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Обновление аватарки при изменении profile
  useEffect(() => {
    if (profile?.image_url) {
      setAvatarUrl(profile.image_url);
    } else if (user?.avatar) {
      setAvatarUrl(user.avatar);
    } else {
      setAvatarUrl(null);
    }
  }, [profile?.image_url, user?.avatar]);

  // Debounce для поиска (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(state.searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [state.searchQuery]);

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
    if (debouncedSearchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(debouncedSearchQuery)}`);
    }
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

  // Форматирование имени пользователя (мемоизируем)
  const userName = useMemo(() => {
    if (!user) return "Профиль";

    switch(user.role) {
      case 'client':
        return `${profile?.firstName || user.firstName || 'Клиент'}`;
      case 'master':
        return `${profile?.firstName || user.firstName || 'Мастер'}`;
      case 'salon':
        return `${profile?.name?.split(' ')[0] || user.name || 'Салон'}`;
      case 'admin':
      case 'superadmin':
        return `${profile?.firstName || user.firstName || 'Администратор'}`;
      default:
        return user.email?.split('@')[0] || 'Профиль';
    }
  }, [user?.role, user?.firstName, user?.email, user?.name, profile?.firstName, profile?.name]);

  // Получаем URL аватара (теперь используется avatarUrl из state)
  const getUserAvatar = () => {
    if (!user) return null;
    return avatarUrl;
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

          <a
            href="/"
            className="header-logo"
            onClick={(e) => {
              e.preventDefault();
              handleHome();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleHome()}
            role="button"
            tabIndex={0}
            aria-label="На главную страницу"
          >
            <img src={logo} alt="Бьюти Окна логотип" className="logo" width="120" height="40" />
          </a>

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

        <SearchForm
          searchQuery={state.searchQuery}
          onSearchChange={(value) => dispatch({ type: 'SET_SEARCH_QUERY', value })}
          onSubmit={handleSearch}
        />

        <div className="header-right">
          <Link to="/salons-map" className="map-link" title="Салоны на карте">
            <span className="material-symbols-outlined">map</span>
            <span className="map-link-text">Салоны</span>
          </Link>

          <div className="header-profile" ref={profileRef}>
            <button
              className="header-action-btn profile-trigger"
              onClick={() => dispatch({ type: 'TOGGLE_PROFILE' })}
              aria-label={isAuthenticated ? `Профиль пользователя ${userName}` : 'Войти в систему'}
              aria-expanded={state.isProfileOpen}
              aria-haspopup="menu"
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
                  <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>account_circle</span>
                </div>
              )}
              {isAuthenticated && user && (
                <span className="user-badge">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <ProfileDropdown
              isOpen={state.isProfileOpen}
              user={user}
              isAuthenticated={isAuthenticated}
              avatarUrl={getUserAvatar()}
              userName={userName}
              onProfile={handleProfile}
              onChat={handleChat}
              onSettings={handleSettings}
              onLogout={handleLogout}
              onLogin={handleLogin}
              onRegister={handleRegistration}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);