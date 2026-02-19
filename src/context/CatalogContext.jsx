import React, { createContext, useContext, useState, useCallback } from 'react';
import { getCatalogCategories, getServicesByCategory, getCategoryById } from '../api/catalog';
import UserService from '../api/user';

const CatalogContext = createContext();

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};

export const CatalogProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState({
    categories: false,
    services: false,
    category: false
  });
  const [error, setError] = useState(null);
  
  // Состояния для хранения изображений мастеров и салонов
  const [masterImages, setMasterImages] = useState({});
  const [salonImages, setSalonImages] = useState({});

  // Загрузка всех категорий
  const loadCategories = useCallback(async () => {
    setLoading(prev => {
      if (prev.categories) return prev; // Предотвращаем повторную загрузку
      return { ...prev, categories: true };
    });

    setError(null);

    try {
      const response = await getCatalogCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки категорий');
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, []);

  // Загрузка услуг по категории
  const loadServicesByCategory = useCallback(async (categoryId) => {
    setLoading(prev => {
      if (prev.services) return prev; // Предотвращаем повторную загрузку
      return { ...prev, services: true };
    });

    setError(null);

    try {
      const response = await getServicesByCategory(categoryId);
      setServices(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки услуг');
      console.error('Ошибка загрузки услуг:', err);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, []);

  // Загрузка конкретной категории
  const loadCategoryById = useCallback(async (categoryId) => {
    setLoading(prev => {
      if (prev.category) return prev; // Предотвращаем повторную загрузку
      return { ...prev, category: true };
    });

    setError(null);

    try {
      const response = await getCategoryById(categoryId);
      setSelectedCategory(response.data.data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки категории');
      console.error('Ошибка загрузки категории:', err);
    } finally {
      setLoading(prev => ({ ...prev, category: false }));
    }
  }, []);

  // Функция для получения изображения мастера по ID
  const getMasterImage = useCallback(async (masterId) => {
    if (masterImages[masterId]) {
      return masterImages[masterId];
    }

    try {
      const response = await UserService.getMasterById(masterId);
      const imageUrl = response.data?.image_url;
      
      setMasterImages(prev => ({
        ...prev,
        [masterId]: imageUrl
      }));

      return imageUrl;
    } catch (error) {
      console.error(`Ошибка при получении данных мастера ${masterId}:`, error);
      return null;
    }
  }, [masterImages]);

  // Функция для получения изображения салона по ID
  const getSalonImage = useCallback(async (salonId) => {
    if (salonImages[salonId]) {
      return salonImages[salonId];
    }

    try {
      const response = await UserService.getSalonById(salonId);
      const imageUrl = response.data?.image_url;
      
      setSalonImages(prev => ({
        ...prev,
        [salonId]: imageUrl
      }));

      return imageUrl;
    } catch (error) {
      console.error(`Ошибка при получении данных салона ${salonId}:`, error);
      return null;
    }
  }, [salonImages]);

  // Очистка услуг
  const clearServices = useCallback(() => {
    setServices([]);
  }, []); // Empty dependency array

  // Очистка выбранной категории
  const clearSelectedCategory = useCallback(() => {
    setSelectedCategory(null);
  }, []); // Empty dependency array

  const value = React.useMemo(() => ({
    categories,
    services,
    selectedCategory,
    loading,
    error,
    loadCategories,
    loadServicesByCategory,
    loadCategoryById,
    getMasterImage,
    getSalonImage,
    clearServices,
    clearSelectedCategory
  }), [
    categories,
    services,
    selectedCategory,
    loading,
    error,
    loadCategories,
    loadServicesByCategory,
    loadCategoryById,
    getMasterImage,
    getSalonImage,
    clearServices,
    clearSelectedCategory
  ]);

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
};

export default CatalogProvider;