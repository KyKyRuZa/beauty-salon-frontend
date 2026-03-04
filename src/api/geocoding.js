/**
 * Reverse Geocoding через Яндекс.Карты API
 * Преобразует координаты (lat, lng) в название города
 */

const YANDEX_GEOCODER_URL = 'https://geocode-maps.yandex.ru/1.x/';

/**
 * Определить город по координатам
 * @param {number} lat - Широта
 * @param {number} lng - Долгота
 * @returns {Promise<{city: string, fullAddress: string}>}
 */
export const getCityByCoordinates = async (lat, lng) => {
  try {
    const url = `${YANDEX_GEOCODER_URL}?apikey=${import.meta.env.VITE_YANDEX_MAPS_API_KEY || ''}&geocode=${lng},${lat}&format=json&lang=ru_RU`;
    
    const response = await fetch(url);
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
    console.error('Ошибка reverse geocoding:', error);
    throw error;
  }
};

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
