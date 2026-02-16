import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCatalogServiceById } from '../../api/catalog';
import ServiceCatalogCard from '../../components/catalog/ServiceCatalogCard';
import Header from '../../components/UI/Header';
import Footer from '../../components/UI/Footer';
import '../../style/catalog/ServiceMastersPage.css';

const ServiceMastersPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      
      // Получаем информацию об услуге
      const serviceResponse = await getCatalogServiceById(serviceId);
      setService(serviceResponse.data.data);
      
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки информации об услуге');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCatalog = () => {
    navigate('/catalog');
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <>
      <Header />
      <div className="service-masters-page">
        <div className="service-masters-header">
          <button className="back-button" onClick={handleBackToCatalog}>
            ← Назад к каталогу
          </button>
          <h1>Информация об услуге</h1>
          {service && (
            <div className="selected-service-preview">
              <ServiceCatalogCard service={service} onClick={() => {}} />
            </div>
          )}
        </div>

        <div className="service-details-section">
          <h2>Детали услуги</h2>
          <div className="service-details-content">
            <p><strong>Название:</strong> {service?.name}</p>
            <p><strong>Описание:</strong> {service?.description}</p>
            <p><strong>Продолжительность:</strong> {service?.duration} минут</p>
            <p><strong>Цена:</strong> {service?.price} ₽</p>
            {service?.rating && <p><strong>Рейтинг:</strong> {service.rating} ⭐</p>}
          </div>
          
          <div className="service-actions">
            <button 
              className="book-now-button"
              onClick={() => navigate(`/booking?service=${serviceId}`)}
            >
              Забронировать эту услугу
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServiceMastersPage;