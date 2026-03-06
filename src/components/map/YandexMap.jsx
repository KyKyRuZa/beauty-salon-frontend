import React, { useEffect, useRef, useState } from 'react';
import { useSalonMap } from '../../context/SalonMapContext';
import { logger } from '../../utils/logger';
import '../../styles/YandexMap.css';

const YandexMap = () => {
  const { salons, selectedSalon, selectSalon, userCoordinates, mapCenter, loading } = useSalonMap();
  const mapRef = useRef(null);
  const [ymaps, setYmaps] = useState(null);
  const mapInitialized = useRef(false);

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY || '';
  logger.debug('Ключ API:', apiKey ? 'есть' : 'нет');
  // Загрузка Яндекс.Карт
  useEffect(() => {
    if (mapInitialized.current) return;

    if (window.ymaps) {
      setYmaps(window.ymaps);
      mapInitialized.current = true;
    } else {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          setYmaps(window.ymaps);
          mapInitialized.current = true;
        });
      };
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current?.ymaps) {
        mapRef.current.ymaps.destroy();
        mapRef.current.ymaps = null;
      }
    };
  }, []);

  // Инициализация карты при загрузке API
  useEffect(() => {
    if (!ymaps || !mapRef.current || mapRef.current.ymaps) return;

    const defaultCenter = mapCenter || { lat: 55.7887, lng: 49.1221 }; // Казань по умолчанию

    const map = new ymaps.Map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: 12,
      controls: ['zoomControl', 'geolocationControl']
    });

    mapRef.current.ymaps = map;
    mapRef.current.objectManager = new ymaps.ObjectManager({
      clusterize: true,
      gridSize: 32,
      clusterDisableClickZoom: false
    });

    map.geoObjects.add(mapRef.current.objectManager);

    // Обработчик клика по метке
    mapRef.current.objectManager.events.add('click', (e) => {
      const objectId = e.get('objectId');
      const object = mapRef.current.objectManager.getObjectById(objectId);
      if (object && object.properties.balloonContent) {
        selectSalon(object.properties.salonData);
      }
    });
  }, [ymaps]);

  // Обновление меток и центра карты при изменении данных
  useEffect(() => {
    if (!ymaps || !mapRef.current?.objectManager) return;

    // Функция для экранирования HTML-сущностей (защита от XSS)
    const escapeHtml = (str) => {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    const features = salons.map((salon, index) => {
      const coords = salon.coordinates
        ? [salon.coordinates.lat, salon.coordinates.lng]
        : [55.7887 + index * 0.01, 49.1221 + index * 0.01];

      return {
        type: 'Feature',
        id: salon.id || index,
        geometry: {
          type: 'Point',
          coordinates: coords
        },
        properties: {
          balloonContentHeader: escapeHtml(salon.name),
          balloonContentBody: `
            <div class="salon-balloon">
              ${salon.image_url ? `<img src="${escapeHtml(salon.image_url)}" alt="${escapeHtml(salon.name)}" class="salon-balloon-image" />` : ''}
              <p class="salon-balloon-rating">⭐ ${escapeHtml(salon.rating || 'N/A')}</p>
              <p class="salon-balloon-address">${escapeHtml(salon.address || 'Адрес не указан')}</p>
              ${salon.distance_km ? `<p class="salon-balloon-distance">${escapeHtml(salon.distance_km)} км от вас</p>` : ''}
            </div>
          `,
          balloonContentFooter: escapeHtml(salon.city),
          hintContent: escapeHtml(salon.name),
          salonData: salon
        },
        options: {
          preset: salon.is_verified ? 'islands#pinkBeautyIcon' : 'islands#grayBeautyIcon'
        }
      };
    });

    mapRef.current.objectManager.removeAll();
    mapRef.current.objectManager.add({
      type: 'FeatureCollection',
      features: features
    });

    // Центрируем карту на первом салоне при смене города
    if (salons.length > 0 && salons[0].coordinates) {
      mapRef.current.ymaps.setCenter(
        [salons[0].coordinates.lat, salons[0].coordinates.lng],
        12,
        { duration: 300 }
      );
    }

    // Центрируем карту на выбранном салоне
    if (selectedSalon && selectedSalon.coordinates) {
      mapRef.current.ymaps.setCenter(
        [selectedSalon.coordinates.lat, selectedSalon.coordinates.lng],
        15,
        { duration: 300 }
      );
    }
  }, [salons, selectedSalon, ymaps]);

  // Кнопка "Моё местоположение"
  const handleGoToMyLocation = () => {
    if (userCoordinates && mapRef.current?.ymaps) {
      mapRef.current.ymaps.setCenter(
        [userCoordinates.lat, userCoordinates.lng],
        15,
        { duration: 300 }
      );
    }
  };

  return (
    <div className="yandex-map-container">
      <div ref={mapRef} className="yandex-map" />
      {loading && (
        <div className="map-loading-overlay">
          <div className="spinner"></div>
          <p>Загрузка салонов...</p>
        </div>
      )}
      {userCoordinates && (
        <button
          className="my-location-btn"
          onClick={handleGoToMyLocation}
          title="Моё местоположение"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
      )}
    </div>
  );
};

export default YandexMap;
