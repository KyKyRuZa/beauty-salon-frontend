/**
 * Reverse Geocoding через Яндекс.Карты API
 * Преобразует координаты (lat, lng) в название города
 */

import { logger } from '../utils/logger';

const YANDEX_GEOCODER_URL = 'https://geocode-maps.yandex.ru/1.x/';

// Координаты городов для определения по геолокации (fallback)
const CITY_COORDINATES = {
  'Казань': { lat: 55.7887, lng: 49.1221 },
  'Альметьевск': { lat: 55.0167, lng: 52.3200 },
  'Уфа': { lat: 54.7388, lng: 55.9721 },
  'Ижевск': { lat: 56.8527, lng: 53.2115 },
  'Набережные Челны': { lat: 55.7256, lng: 52.4069 }
};

/**
 * Определить город по координатам
 * @param {number} lat - Широта
 * @param {number} lng - Долгота
 * @returns {Promise<{city: string, fullAddress: string}>}
 */
export const getCityByCoordinates = async (lat, lng) => {
  try {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
    
    if (!apiKey) {
      logger.warn('API ключ Яндекс.Карт не указан, используем локальное определение города');
      const city = findNearestCity(lat, lng);
      if (city) {
        return { city, fullAddress: city, coordinates: { lat, lng } };
      }
      throw new Error('Город не найден');
    }
    
    const url = `${YANDEX_GEOCODER_URL}?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=ru_RU`;

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        logger.warn('Yandex Geocoding API вернул 403, используем локальное определение города');
        const city = findNearestCity(lat, lng);
        if (city) {
          return { city, fullAddress: city, coordinates: { lat, lng } };
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.response && data.response.GeoObjectCollection && data.response.GeoObjectCollection.featureMember.length > 0) {
      const featureMember = data.response.GeoObjectCollection.featureMember;

      // Ищем город среди результатов
      for (const member of featureMember) {
        const geoObject = member.GeoObject;
        const metaData = geoObject.metaDataProperty;

        if (metaData.GeocoderMetaData && metaData.GeocoderMetaData.kind === 'locality') {
          return {
            city: geoObject.name,
            fullAddress: metaData.GeocoderMetaData.text,
            coordinates: { lat, lng }
          };
        }
      }

      // Если город не найден, берем первый результат
      const firstResult = featureMember[0].GeoObject;
      return {
        city: firstResult.name,
        fullAddress: firstResult.metaDataProperty.GeocoderMetaData?.text || '',
        coordinates: { lat, lng }
      };
    }

    throw new Error('Город не найден');
  } catch (error) {
    logger.error('Ошибка reverse geocoding:', error);
    // Fallback: определяем город по расстоянию
    const city = findNearestCity(lat, lng);
    if (city) {
      return { city, fullAddress: city, coordinates: { lat, lng } };
    }
    throw error;
  }
};

/**
 * Найти ближайший город из списка доступных по координатам
 * @param {number} lat - Широта пользователя
 * @param {number} lng - Долгота пользователя
 * @returns {string|null}
 */
const findNearestCity = (lat, lng) => {
  let nearestCity = null;
  let minDistance = Infinity;
  
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  // Если ближайший город дальше 100км, возвращаем null
  if (minDistance > 100) {
    logger.warn(`Ближайший город ${nearestCity} слишком далеко (${minDistance.toFixed(1)} км)`);
    return null;
  }
  
  logger.info(`Определён город: ${nearestCity} (${minDistance.toFixed(1)} км от пользователя)`);
  return nearestCity;
};

/**
 * Рассчитать расстояние между двумя точками (формула Haversine)
 * @param {number} lat1 - Широта первой точки
 * @param {number} lng1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lng2 - Долгота второй точки
 * @returns {number} - Расстояние в километрах
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Проверить, есть ли город в списке доступных
 * @param {string} city - Название города
 * @param {string[]} availableCities - Список доступных городов
 * @returns {boolean}
 */
export const isCityAvailable = (city, availableCities) => {
  const normalizedCity = city.toLowerCase().replace('г.', '').replace('город', '').trim();
  return availableCities.some(availableCity => 
    availableCity.toLowerCase().includes(normalizedCity) || normalizedCity.includes(availableCity.toLowerCase())
  );
};

/**
 * Найти ближайший доступный город
 * @param {string} detectedCity - Определённый город
 * @param {string[]} availableCities - Список доступных городов
 * @returns {string|null}
 */
export const findNearestAvailableCity = (detectedCity, availableCities) => {
  // Словарь соответствий для городов
  const cityAliases = {
    'набережные челны': ['набережные челны', 'челны'],
    'казань': ['казань'],
    'альметьевск': ['альметьевск'],
    'уфа': ['уфа'],
    'ижевск': ['ижевск']
  };
  
  const normalizedDetected = detectedCity.toLowerCase().replace('г.', '').replace('город', '').trim();
  
  // Проверяем точное совпадение
  for (const [alias, cities] of Object.entries(cityAliases)) {
    if (cities.some(c => normalizedDetected.includes(c))) {
      const matchedCity = availableCities.find(c => c.toLowerCase().includes(alias));
      if (matchedCity) return matchedCity;
    }
  }
  
  // Проверяем частичное совпадение
  for (const availableCity of availableCities) {
    if (normalizedDetected.includes(availableCity.toLowerCase()) || 
        availableCity.toLowerCase().includes(normalizedDetected)) {
      return availableCity;
    }
  }
  
  return null;
};

export default {
  getCityByCoordinates,
  isCityAvailable,
  findNearestAvailableCity
};
