import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger';
import { getNearbySalons, getSalonLocationsByCity } from '../api/salonLocations';
import {
  requestGeolocation,
  checkGeolocationPermission,
  saveGeoDataToSession,
  getGeoDataFromSession,
  clearGeoDataFromSession,
  getAvailableCities
} from '../utils/geolocation';
import { getCityByCoordinates, findNearestAvailableCity } from '../api/geocoding';

const SalonMapContext = createContext();

// Координаты городов по умолчанию
const CITY_COORDINATES = {
  'Казань': { lat: 55.796127, lng: 49.106414 },
  'Альметьевск': { lat: 54.901171, lng: 52.297230 },
  'Набережные Челны': { lat: 55.741272, lng: 52.403662 },
  'Уфа': { lat: 54.735152, lng: 55.958736 },
  'Ижевск': { lat: 56.852834, lng: 53.206852 }
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSalonMap = () => {
  const context = useContext(SalonMapContext);
  if (!context) {
    throw new Error('useSalonMap must be used within a SalonMapProvider');
  }
  return context;
};

const AVAILABLE_CITIES = getAvailableCities();

const initialState = {
  selectedCity: null,
  userCoordinates: null,
  salons: [],
  selectedSalon: null,
  filters: {
    services: [],
    minRating: 0,
    searchRadius: 5
  },
  loading: false,
  loadingGeo: true,
  error: null,
  geoPermission: 'prompt',
  searchRadius: 5,
  mapCenter: null
};

function salonMapReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_LOADING_GEO':
      return { ...state, loadingGeo: action.value };
    case 'SET_SELECTED_CITY':
      return { ...state, selectedCity: action.value };
    case 'SET_USER_COORDINATES':
      return { ...state, userCoordinates: action.value };
    case 'SET_SALONS':
      return { ...state, salons: action.value };
    case 'SET_SELECTED_SALON':
      return { ...state, selectedSalon: action.value };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.value } };
    case 'SET_SEARCH_RADIUS':
      return { ...state, searchRadius: action.value, filters: { ...state.filters, searchRadius: action.value } };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_GEO_PERMISSION':
      return { ...state, geoPermission: action.value };
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.value };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export const SalonMapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(salonMapReducer, initialState);

  // Инициализация при монтировании
  useEffect(() => {
    initializeGeoLocation();
  }, []);

  const initializeGeoLocation = async () => {
    dispatch({ type: 'SET_LOADING_GEO', value: true });

    try {
      // Проверяем sessionStorage
      const sessionData = getGeoDataFromSession();
      
      if (sessionData?.city) {
        dispatch({ type: 'SET_SELECTED_CITY', value: sessionData.city });
        if (sessionData.coordinates) {
          dispatch({ type: 'SET_USER_COORDINATES', value: sessionData.coordinates });
          await loadSalonsByCoordinates(sessionData.coordinates.lat, sessionData.coordinates.lng, sessionData.city);
        } else {
          await loadSalonsByCity(sessionData.city);
        }
        dispatch({ type: 'SET_GEO_PERMISSION', value: sessionData.geoPermission || 'prompt' });
        dispatch({ type: 'SET_LOADING_GEO', value: false });
        return;
      }

      // Проверяем разрешение
      const permission = await checkGeolocationPermission();
      dispatch({ type: 'SET_GEO_PERMISSION', value: permission });

      if (permission === 'granted') {
        await requestUserGeolocation();
      } else {
        // Устанавливаем город по умолчанию
        dispatch({ type: 'SET_SELECTED_CITY', value: AVAILABLE_CITIES[0] });
        await loadSalonsByCity(AVAILABLE_CITIES[0]);
      }
    } catch (error) {
      logger.error('Ошибка инициализации геолокации:', error);
      dispatch({ type: 'SET_SELECTED_CITY', value: AVAILABLE_CITIES[0] });
      await loadSalonsByCity(AVAILABLE_CITIES[0]);
    } finally {
      dispatch({ type: 'SET_LOADING_GEO', value: false });
    }
  };

  const requestUserGeolocation = async () => {
    try {
      const coordinates = await requestGeolocation();
      dispatch({ type: 'SET_USER_COORDINATES', value: coordinates });
      dispatch({ type: 'SET_GEO_PERMISSION', value: 'granted' });

      // Определяем город по координатам
      try {
        const geoData = await getCityByCoordinates(coordinates.lat, coordinates.lng);
        const matchedCity = findNearestAvailableCity(geoData.city, AVAILABLE_CITIES);

        if (matchedCity) {
          dispatch({ type: 'SET_SELECTED_CITY', value: matchedCity });
          saveGeoDataToSession({
            city: matchedCity,
            coordinates,
            geoPermission: 'granted'
          });
          await loadSalonsByCoordinates(coordinates.lat, coordinates.lng, matchedCity);
        } else {
          // Город не найден в списке, используем первый доступный
          dispatch({ type: 'SET_SELECTED_CITY', value: AVAILABLE_CITIES[0] });
          await loadSalonsByCity(AVAILABLE_CITIES[0]);
        }
      } catch (error) {
        logger.error('Ошибка определения города:', error);
        dispatch({ type: 'SET_SELECTED_CITY', value: AVAILABLE_CITIES[0] });
        await loadSalonsByCity(AVAILABLE_CITIES[0]);
      }
    } catch (error) {
      logger.error('Ошибка получения геолокации:', error);
      dispatch({ type: 'SET_GEO_PERMISSION', value: 'denied' });
      dispatch({ type: 'SET_SELECTED_CITY', value: AVAILABLE_CITIES[0] });
      await loadSalonsByCity(AVAILABLE_CITIES[0]);
    }
  };

  const loadSalonsByCity = useCallback(async (city) => {
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', value: null });

    try {
      const response = await getSalonLocationsByCity(city);
      logger.debug('Загрузка салонов по городу:', city, response);
      
      if (response.success) {
        dispatch({ type: 'SET_SALONS', value: response.data || [] });
        logger.debug('Салоны загружены:', response.data?.length);

        // Устанавливаем центр карты на первый салон или координаты города
        if (response.data && response.data.length > 0) {
          const firstSalon = response.data[0];
          logger.debug('Первый салон:', firstSalon);
          logger.debug('Координаты первого салона:', firstSalon.coordinates);
          
          if (firstSalon.coordinates) {
            const center = {
              lat: firstSalon.coordinates.lat || firstSalon.coordinates[0],
              lng: firstSalon.coordinates.lng || firstSalon.coordinates[1]
            };
            logger.debug('Центр карты:', center);
            dispatch({ type: 'SET_MAP_CENTER', value: center });
          }
        } else {
          // Если салонов нет, используем координаты города по умолчанию
          const cityCoords = CITY_COORDINATES[city];
          if (cityCoords) {
            logger.debug('Салонов нет, используем координаты города:', cityCoords);
            dispatch({ type: 'SET_MAP_CENTER', value: cityCoords });
          }
        }
      }
    } catch (error) {
      logger.error('Ошибка загрузки салонов:', error);
      dispatch({ type: 'SET_ERROR', value: error.message || 'Ошибка загрузки салонов' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, []);

  const loadSalonsByCoordinates = useCallback(async (lat, lng, city = null) => {
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', value: null });

    try {
      const response = await getNearbySalons(lat, lng, city);
      if (response.success) {
        dispatch({ type: 'SET_SALONS', value: response.data.salons || [] });
        dispatch({ type: 'SET_SEARCH_RADIUS', value: response.data.searchRadius || 5 });

        // Устанавливаем центр карты на координаты пользователя
        dispatch({ type: 'SET_MAP_CENTER', value: { lat, lng } });
      }
    } catch (error) {
      logger.error('Ошибка загрузки ближайших салонов:', error);
      dispatch({ type: 'SET_ERROR', value: error.message || 'Ошибка загрузки салонов' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, []);

  const selectCity = useCallback(async (city) => {
    dispatch({ type: 'SET_SELECTED_CITY', value: city });
    dispatch({ type: 'SET_USER_COORDINATES', value: null }); // Очищаем координаты при ручном выборе
    clearGeoDataFromSession(); // Очищаем sessionStorage
    saveGeoDataToSession({ city, geoPermission: state.geoPermission });
    await loadSalonsByCity(city);
  }, [state.geoPermission, loadSalonsByCity]);

  const selectSalon = useCallback((salon) => {
    dispatch({ type: 'SET_SELECTED_SALON', value: salon });
  }, []);

  const updateFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', value: filters });
  }, []);

  const retryGeolocation = useCallback(async () => {
    await requestUserGeolocation();
  }, []);

  const value = {
    ...state,
    selectCity,
    selectSalon,
    updateFilters,
    retryGeolocation,
    loadSalonsByCity,
    loadSalonsByCoordinates,
    AVAILABLE_CITIES
  };

  return (
    <SalonMapContext.Provider value={value}>
      {children}
    </SalonMapContext.Provider>
  );
};

export default SalonMapContext;
