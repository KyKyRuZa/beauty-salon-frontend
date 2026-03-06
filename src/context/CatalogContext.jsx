import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { logger } from '../utils/logger';
import { getCatalogCategories, getServicesByCategory, getCategoryById } from '../api/catalog';
import UserService from '../api/user';

const CatalogContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};

const initialState = {
  categories: [],
  services: [],
  selectedCategory: null,
  loading: {
    categories: false,
    services: false,
    category: false
  },
  error: null,
  masterImages: {},
  salonImages: {}
};

function catalogReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: action.value
        }
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.data };
    case 'SET_SERVICES':
      return { ...state, services: action.data };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.data };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_MASTER_IMAGE':
      return {
        ...state,
        masterImages: {
          ...state.masterImages,
          [action.masterId]: action.imageUrl
        }
      };
    case 'SET_SALON_IMAGE':
      return {
        ...state,
        salonImages: {
          ...state.salonImages,
          [action.salonId]: action.imageUrl
        }
      };
    case 'CLEAR_SERVICES':
      return { ...state, services: [] };
    case 'CLEAR_SELECTED_CATEGORY':
      return { ...state, selectedCategory: null };
    default:
      return state;
  }
}

export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  // Загрузка всех категорий
  const loadCategories = useCallback(async () => {
    if (state.loading.categories) return;

    dispatch({ type: 'SET_ERROR', error: null });
    dispatch({ type: 'SET_LOADING', key: 'categories', value: true });

    try {
      const response = await getCatalogCategories();
      dispatch({ type: 'SET_CATEGORIES', data: response.data.data || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'Ошибка загрузки категорий' });
      logger.error('Ошибка загрузки категорий:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'categories', value: false });
    }
  }, [state.loading.categories]);

  // Загрузка услуг по категории
  const loadServicesByCategory = useCallback(async (categoryId) => {
    dispatch({ type: 'SET_ERROR', error: null });
    dispatch({ type: 'SET_LOADING', key: 'services', value: true });

    try {
      const response = await getServicesByCategory(categoryId);
      dispatch({ type: 'SET_SERVICES', data: response.data.data || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'Ошибка загрузки услуг' });
      logger.error('Ошибка загрузки услуг:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'services', value: false });
    }
  }, []);

  // Загрузка конкретной категории
  const loadCategoryById = useCallback(async (categoryId) => {
    dispatch({ type: 'SET_ERROR', error: null });
    dispatch({ type: 'SET_LOADING', key: 'category', value: true });

    try {
      const response = await getCategoryById(categoryId);
      dispatch({ type: 'SET_SELECTED_CATEGORY', data: response.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'Ошибка загрузки категории' });
      logger.error('Ошибка загрузки категории:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', key: 'category', value: false });
    }
  }, []);

  // Функция для получения изображения мастера по ID
  const getMasterImage = useCallback(async (masterId) => {
    try {
      const response = await UserService.getMasterById(masterId);
      const imageUrl = response.data?.image_url;

      dispatch({ type: 'SET_MASTER_IMAGE', masterId, imageUrl });

      return imageUrl;
    } catch (error) {
      logger.error(`Ошибка при получении данных мастера ${masterId}:`, error);
      return null;
    }
  }, []);

  // Функция для получения изображения салона по ID
  const getSalonImage = useCallback(async (salonId) => {
    try {
      const response = await UserService.getSalonById(salonId);
      const imageUrl = response.data?.image_url;

      dispatch({ type: 'SET_SALON_IMAGE', salonId, imageUrl });

      return imageUrl;
    } catch (error) {
      logger.error(`Ошибка при получении данных салона ${salonId}:`, error);
      return null;
    }
  }, []);

  // Очистка услуг
  const clearServices = useCallback(() => {
    dispatch({ type: 'CLEAR_SERVICES' });
  }, []);

  // Очистка выбранной категории
  const clearSelectedCategory = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_CATEGORY' });
  }, []);

  const value = React.useMemo(() => ({
    categories: state.categories,
    services: state.services,
    selectedCategory: state.selectedCategory,
    loading: state.loading,
    error: state.error,
    masterImages: state.masterImages,
    salonImages: state.salonImages,
    loadCategories,
    loadServicesByCategory,
    loadCategoryById,
    getMasterImage,
    getSalonImage,
    clearServices,
    clearSelectedCategory
  }), [
    state.categories,
    state.services,
    state.selectedCategory,
    state.loading,
    state.error,
    state.masterImages,
    state.salonImages,
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

