import { createContext, useContext, useEffect, useState } from 'react';
import auth from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Загружаем данные пользователя и профиля при монтировании
  useEffect(() => {
    const initializeAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const result = await auth.getProfile();
          if (result.success) {
            setUser(result.data?.user || null);
            setProfile(result.data?.profile || null);
            setIsAuthenticated(true);
          } else {
            // Если не удалось загрузить профиль, но токен есть, возможно, нужно обновить данные
            console.error('Не удалось загрузить профиль:', result.error);
          }
        } catch (error) {
          console.error('Ошибка при инициализации аутентификации:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Подписываемся на события изменения аутентификации
    const handleAuthChange = () => {
      if (auth.isAuthenticated()) {
        setIsAuthenticated(true);
        // Обновляем данные пользователя
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
          try {
            setUser(JSON.parse(storedUser) || null);
          } catch (e) {
            console.error('Ошибка при парсинге данных пользователя:', e);
            setUser(null);
          }
        } else if (storedUser === 'undefined') {
          // Если в localStorage хранится строка 'undefined', очищаем её
          localStorage.removeItem('user');
          setUser(null);
        }
        
        // Обновляем также профиль, так как он мог измениться
        const fullProfile = auth.getFullProfile();
        if (fullProfile) {
          setProfile(fullProfile.profile || null);
        } else {
          // Если полный профиль недоступен, получаем его с сервера
          const refreshProfile = async () => {
            try {
              const result = await auth.getProfile();
              if (result.success) {
                setProfile(result.data?.profile || null);
              }
            } catch (error) {
              console.error('Ошибка при обновлении профиля через authChange:', error);
              setProfile(null);
            }
          };
          
          refreshProfile();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);

    // Очищаем подписку при размонтировании
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Функция для обновления профиля
  const updateProfileInternal = async (profileData) => {
    const result = await auth.updateProfile(profileData);
    if (result.success) {
      // Обновляем состояние с новыми данные
      setUser(result.data?.user || null);
      setProfile(result.data?.profile || null);
    }
    return result;
  };
  
  const updateProfile = async (profileData) => {
    return await updateProfileInternal(profileData);
  };

  // Функция для получения полного профиля
  const getFullProfile = () => {
    return { user, profile };
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    setUser,
    setProfile,
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