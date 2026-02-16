import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCatalogServiceById, getServiceVariations } from '../../api/catalog';
import ServiceVariation from '../../components/catalog/ServiceVariation';
import '../../style/catalog/ServiceDetailPage.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await getCatalogServiceById(id);
      setService(response.data.data);
      
      // Загрузим варианты услуги
      if (response.data.data.catalog_id) {
        const variationsResponse = await getServiceVariations(id);
        setVariations(variationsResponse.data.data);
      }
      
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки деталей услуги');
      console.error('Ошибка загрузки деталей услуги:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = (variation) => {
    // TODO: Реализовать логику выбора варианта услуги
    console.log('Выбран вариант услуги:', variation);
  };

  if (loading) {
    return <div className="loading">Загрузка деталей услуги...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!service) {
    return <div className="error">Услуга не найдена</div>;
  }

  return (
    <div className="service-detail-page">
      <div className="service-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <h1>{service.name}</h1>
      </div>

      <div className="service-content">
        <div className="service-info">
          <div className="service-main-info">
            {service.image_url && (
              <img 
                src={service.image_url} 
                alt={service.name} 
                className="service-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="service-text-info">
              <p className="service-description">
                {service.description || 'Описание отсутствует'}
              </p>
              
              <div className="service-meta">
                <div className="meta-item">
                  <strong>Продолжительность:</strong> {service.duration} мин
                </div>
                <div className="meta-item">
                  <strong>Цена:</strong> {service.price} ₽
                </div>
                <div className="meta-item">
                  <strong>Категория:</strong> {service.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {variations.length > 0 && (
          <div className="service-variations">
            <h2>Варианты услуги</h2>
            <div className="variations-list">
              {variations.map((variation) => (
                <ServiceVariation
                  key={variation.id}
                  variation={variation}
                  onSelect={handleVariationSelect}
                />
              ))}
            </div>
          </div>
        )}

        {variations.length === 0 && (
          <div className="no-variations">
            <p>Для этой услуги пока нет различных вариантов от разных провайдеров.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage;