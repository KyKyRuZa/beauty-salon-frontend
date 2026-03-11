import React, { useState, useEffect, Suspense, lazy } from 'react';
import { SalonMapProvider, useSalonMap } from '../../context/SalonMapContext';
import GeoLocationPrompt from '../../components/GeoLocationPrompt';
import SalonList from '../../components/map/SalonList';
import MapFilters from '../../components/map/MapFilters';
import Header from '../../components/ui/Header';
import LoadingFallback from '../../components/LoadingFallback';
import '../../styles/SalonsMapPage.css';

// Lazy load для тяжёлого компонента карты
const YandexMap = lazy(() => import('../../components/map/YandexMap'));

const SalonsMapContent = () => {
  const { loadingGeo } = useSalonMap();
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loadingGeo) {
      // Показываем модалку если геолокация была запрошена но пользователь выбрал город вручную
      const sessionData = sessionStorage.getItem('geoPermission');
      if (sessionData === 'prompt' || !sessionData) {
        setShowGeoPrompt(true);
      }
    }
  }, [loadingGeo]);

  if (loadingGeo) {
    return (
      <div className="salons-map-page">
        <Header />
        <div className="salons-map-loading">
          <div className="spinner"></div>
          <p>Определяем ваше местоположение...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="salons-map-page">
      <Header />
      
      <div className="salons-map-container">
        {/* Сайдбар со списком салонов */}
        <aside className={`salons-map-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h1>Салоны на карте</h1>
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Скрыть' : 'Показать'}
            >
              <span className="material-symbols-outlined">
                {sidebarOpen ? 'chevron_left' : 'chevron_right'}
              </span>
            </button>
          </div>
          
          <MapFilters />
          <SalonList />
        </aside>

        {/* Карта */}
        <main className="salons-map-main">
          {!sidebarOpen && (
            <button
              className="show-sidebar-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">list</span>
              Салоны
            </button>
          )}
          <Suspense fallback={<LoadingFallback />}>
            <YandexMap />
          </Suspense>
        </main>
      </div>

      {/* Модалка подтверждения геолокации */}
      <GeoLocationPrompt
        isOpen={showGeoPrompt}
        onClose={() => setShowGeoPrompt(false)}
      />
    </div>
  );
};

const SalonsMapPage = () => {
  return (
    <SalonMapProvider>
      <SalonsMapContent />
    </SalonMapProvider>
  );
};

export default SalonsMapPage;
