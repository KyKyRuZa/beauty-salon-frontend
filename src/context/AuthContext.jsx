import { createContext, useContext, useEffect, useReducer, useState } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 секунда
  const REQUEST_TIMEOUT = 5000; // 5 секунд

  // Функция загрузки профиля с retry и timeout
  const loadProfileWithRetry = async (attempt = 1) => {
    try {
      // Создаём promise с timeout
      const profilePromise = auth.getProfile();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: профиль не загрузился')), REQUEST_TIMEOUT)
      );

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (result.success) {
        logger.info(`Профиль загружен с попытки ${attempt}`);
        dispatch({
          type: 'SET_AUTH_DATA',
          user: result.data?.user,
          profile: result.data?.profile
        });
        setRetryCount(0); // Сброс счётчика при успехе
        return true;
      } else {
        logger.warn(`Попытка ${attempt}: Не удалось загрузить профиль - ${result.error}`);
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          return loadProfileWithRetry(attempt + 1);
        }
        logger.error('Превышено количество попыток загрузки профиля');
        return false;
      }
    } catch (error) {
      logger.error(`Попытка ${attempt}: Ошибка загрузки профиля:`, error.message);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return loadProfileWithRetry(attempt + 1);
      }
      logger.error('Превышено количество попыток загрузки профиля после ошибок');
      return false;
    }
  };

  // Загружаем данные пользователя и профиля при монтировании
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;

      if (auth.isAuthenticated()) {
        logger.info('Инициализация аутентификации...');
        await loadProfileWithRetry();
      }
      
      if (isMounted) {
        dispatch({ type: 'SET_LOADED' });
      }
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
      isMounted = false;
      window.removeEventListener('authChange', handleAuthChange);
      logger.info('Auth context cleanup');
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