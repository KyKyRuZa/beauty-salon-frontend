import { createContext, useContext, useEffect, useReducer } from 'react';
import { logger } from '../utils/logger';
import auth from '../api/auth';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const initialState = {
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.value };
    case 'SET_PROFILE':
      return { ...state, profile: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.value };
    case 'SET_AUTH_DATA':
      return {
        ...state,
        user: action.user || null,
        profile: action.profile || null,
        isAuthenticated: !!action.user
      };
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        profile: null,
        isAuthenticated: false
      };
    case 'SET_LOADED':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Загружаем данные пользователя и профиля при монтировании
  useEffect(() => {
    const initializeAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const result = await auth.getProfile();
          if (result.success) {
            dispatch({
              type: 'SET_AUTH_DATA',
              user: result.data?.user,
              profile: result.data?.profile
            });
          } else {
            logger.error('Не удалось загрузить профиль:', result.error);
          }
        } catch (error) {
          logger.error('Ошибка при инициализации аутентификации:', error);
        }
      }
      dispatch({ type: 'SET_LOADED' });
    };

    initializeAuth();

    // Подписываемся на события изменения аутентификации
    const handleAuthChange = () => {
      if (auth.isAuthenticated()) {
        dispatch({ type: 'SET_AUTHENTICATED', value: true });

        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          try {
            const userData = JSON.parse(storedUser);
            dispatch({ type: 'SET_USER', value: userData });
          } catch (e) {
            logger.error('Ошибка при парсинге данных пользователя:', e);
            dispatch({ type: 'SET_USER', value: null });
          }
        } else if (storedUser === 'undefined') {
          localStorage.removeItem('user');
          dispatch({ type: 'SET_USER', value: null });
        }

        const fullProfile = auth.getFullProfile();
        if (fullProfile) {
          dispatch({ type: 'SET_PROFILE', value: fullProfile.profile || null });
        } else {
          const refreshProfile = async () => {
            try {
              const result = await auth.getProfile();
              if (result.success) {
                dispatch({ type: 'SET_PROFILE', value: result.data?.profile || null });
              }
            } catch (error) {
              logger.error('Ошибка при обновлении профиля через authChange:', error);
              dispatch({ type: 'SET_PROFILE', value: null });
            }
          };

          refreshProfile();
        }
      } else {
        dispatch({ type: 'CLEAR_AUTH' });
      }
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Функция для обновления профиля
  const updateProfileInternal = async (profileData) => {
    const result = await auth.updateProfile(profileData);
    if (result.success) {
      dispatch({
        type: 'SET_AUTH_DATA',
        user: result.data?.user,
        profile: result.data?.profile
      });
    }
    return result;
  };

  const updateProfile = async (profileData) => {
    return await updateProfileInternal(profileData);
  };

  // Функция для получения полного профиля
  const getFullProfile = () => {
    return { user: state.user, profile: state.profile };
  };

  const value = {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    setIsAuthenticated: (value) => dispatch({ type: 'SET_AUTHENTICATED', value }),
    setUser: (value) => dispatch({ type: 'SET_USER', value }),
    setProfile: (value) => dispatch({ type: 'SET_PROFILE', value }),
    updateProfile,
    getFullProfile,
    // Проксируем методы из оригинального auth
    login: (...args) => auth.login(...args),
    register: (...args) => auth.register(...args),
    logout: () => auth.logout(),
    getCurrentUser: () => auth.getCurrentUser(),
    getProfile: (...args) => auth.getProfile(...args)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};