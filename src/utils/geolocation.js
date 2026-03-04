/**
 * Утилиты для работы с геолокацией
 */

const CITIES = ['Казань', 'Альметьевск', 'Уфа', 'Ижевск', 'Набережные Челны'];

/**
 * Запросить геолокацию у пользователя
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const requestGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается вашим браузером'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Пользователь отказал в доступе к геолокации'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Информация о местоположении недоступна'));
            break;
          case error.TIMEOUT:
            reject(new Error('Превышено время ожидания геолокации'));
            break;
          default:
            reject(new Error('Произошла неизвестная ошибка при определении геолокации'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 минут
      }
    );
  });
};

/**
 * Проверить, есть ли разрешение на геолокацию
 * @returns {Promise<'granted'|'denied'|'prompt'>}
 */
export const checkGeolocationPermission = async () => {
  if (!navigator.permissions) {
    return 'prompt'; // Браузер не поддерживает API разрешений
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch (error) {
    return 'prompt';
  }
};

/**
 * Сохранить данные геолокации в sessionStorage
 * @param {Object} data - Данные для сохранения
 */
export const saveGeoDataToSession = (data) => {
  try {
    sessionStorage.setItem('selectedCity', data.city);
    if (data.coordinates) {
      sessionStorage.setItem('userCoordinates', JSON.stringify(data.coordinates));
    }
    if (data.geoPermission) {
      sessionStorage.setItem('geoPermission', data.geoPermission);
    }
    if (data.searchRadius) {
      sessionStorage.setItem('searchRadius', data.searchRadius.toString());
    }
  } catch (error) {
    console.error('Ошибка сохранения данных геолокации:', error);
  }
};

/**
 * Получить данные геолокации из sessionStorage
 * @returns {Object|null}
 */
export const getGeoDataFromSession = () => {
  try {
    const city = sessionStorage.getItem('selectedCity');
    const coordinatesStr = sessionStorage.getItem('userCoordinates');
    const geoPermission = sessionStorage.getItem('geoPermission');
    const searchRadius = sessionStorage.getItem('searchRadius');

    if (!city) return null;

    return {
      city,
      coordinates: coordinatesStr ? JSON.parse(coordinatesStr) : null,
      geoPermission: geoPermission || 'prompt',
      searchRadius: searchRadius ? parseInt(searchRadius) : 5
    };
  } catch (error) {
    console.error('Ошибка получения данных геолокации:', error);
    return null;
  }
};

/**
 * Очистить данные геолокации из sessionStorage
 */
export const clearGeoDataFromSession = () => {
  sessionStorage.removeItem('selectedCity');
  sessionStorage.removeItem('userCoordinates');
  sessionStorage.removeItem('geoPermission');
  sessionStorage.removeItem('searchRadius');
};

/**
 * Получить расстояние между двумя точками (формула Haversine)
 * @param {number} lat1 - Широта первой точки
 * @param {number} lng1 - Долгота первой точки
 * @param {number} lat2 - Широта второй точки
 * @param {number} lng2 - Долгота второй точки
 * @returns {number} - Расстояние в километрах
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
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
 * Получить доступные города
 * @returns {string[]}
 */
export const getAvailableCities = () => CITIES;

export default {
  requestGeolocation,
  checkGeolocationPermission,
  saveGeoDataToSession,
  getGeoDataFromSession,
  clearGeoDataFromSession,
  calculateDistance,
  getAvailableCities
};
