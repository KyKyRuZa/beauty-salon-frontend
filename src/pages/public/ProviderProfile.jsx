import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ReviewsList from '../../components/reviews/ReviewsList';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite, checkFavorite } from '../../api/favorites';
import '../../styles/ProviderProfile.css';

const ProviderProfile = () => {
  const { providerId, type = 'master' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activePortfolioTab, setActivePortfolioTab] = useState('all');
  const [providerType, setProviderType] = useState(type);

  useEffect(() => {
    loadProviderData();
    checkFavoriteStatus();
  }, [providerId]);

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const endpoint = providerType === 'master' ? 'master' : 'salon';
      const response = await fetch(`/api/providers/${endpoint}/${providerId}`);
      if (response.ok) {
        const data = await response.json();
        setProvider({
          ...data.data,
          has_training: true,
          skills: {
            hair: ['Укладка и причёски', 'Ламинирование и ботокс волос', 'Лечение волос и кожи головы'],
            nails: ['Маникюр без покрытия', 'Маникюр с покрытием', 'Педикюр пальчики без покрытия', 'Дизайн ногтей', 'Ремонт одного ногтя', 'SPA-уход для рук и ног']
          },
          specialization: providerType === 'master' ? [
            'стрижки разных уровней сложности',
            'сухой метод стрижки кудрявых волос',
            'коктейльные укладки',
            'простые окрашивания',
            'смена образа'
          ] : ['Парикмахерские услуги', 'Маникюр и педикюр', 'Косметология'],
          education: providerType === 'master' ? [
            'Международная академия Долорес',
            'Участие в программах «Модный приговор»',
            'Постоянно повышает свою квалификацию'
          ] : ['Работаем с 2010 года', 'Все мастера сертифицированы']
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || providerType !== 'master') return;
    try {
      const response = await checkFavorite(providerId);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Ошибка проверки избранного:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Для добавления в избранное необходимо войти в систему');
      return;
    }
    if (providerType !== 'master') {
      alert('В избранное можно добавлять только мастеров');
      return;
    }

    try {
      await toggleFavorite(providerId);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      alert(error.response?.data?.message || 'Ошибка при изменении избранного');
    }
  };

  const handleBook = (serviceId) => {
    const url = `/catalog/provider/${providerId}/timeslots?type=${providerType}${serviceId ? `&service=${serviceId}` : ''}`;
    navigate(url);
  };

  const handleWriteReview = () => {
    navigate(`/reviews/write?provider=${providerId}&type=${providerType}`);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setProviderType(newType);
    navigate(`/provider/${providerId}?type=${newType}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="provider-profile-loading">Загрузка профиля...</div>
        <Footer />
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div className="provider-profile-error">Профиль не найден</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="provider-profile-page">
        <div className="container">
          <div className="profile-layout">
            {/* Левая колонка - карточка мастера */}
            <aside className="profile-sidebar">
              <div className="profile-card">
                <div className="profile-type-selector">
                  <select value={providerType} onChange={handleTypeChange}>
                    <option value="master">Бьюти-мастер</option>
                    <option value="salon">Салон красоты</option>
                  </select>
                </div>

                <img
                  src={provider.image_url || 'https://via.placeholder.com/300'}
                  alt={provider.first_name || provider.name}
                  className="profile-avatar"
                />

                <h1 className="profile-name">
                  {providerType === 'master'
                    ? `${provider.first_name || ''} ${provider.last_name || ''}`.trim()
                    : provider.name || 'Салон'}
                </h1>

                {provider.experience && (
                  <p className="profile-experience">
                    Стаж работы: {provider.experience} лет
                  </p>
                )}

                <div className="profile-location">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{provider.address || 'Адрес не указан'}</span>
                </div>

                <div className="profile-hours">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>09:00 - 19:00</span>
                </div>

                {provider.has_training && (
                  <div className="training-badge">есть обучение</div>
                )}

                <div className="profile-rating">
                  <span>{provider.rating || '4.8'}</span>
                  <span className="material-symbols-outlined">star</span>
                </div>

                <div className="profile-actions">
                  <button className="btn-book" onClick={handleBook}>
                    ЗАПИСАТЬСЯ
                  </button>
                  {providerType === 'master' && (
                    <button 
                      className={`btn-profile-favorite ${isFavorite ? 'active' : ''}`}
                      onClick={handleToggleFavorite}
                    >
                      {isFavorite ? 'В ИЗБРАННОМ' : 'ДОБАВИТЬ В ИЗБРАННОЕ'}
                    </button>
                  )}
                  <button className="btn-review" onClick={handleWriteReview}>
                    ОСТАВИТЬ ОТЗЫВ
                  </button>
                </div>
              </div>
            </aside>

            {/* Основная колонка */}
            <main className="profile-main">
              {/* Навыки */}
              <section className="profile-section">
                <h2 className="section-title">НАВЫКИ</h2>
                
                {provider.skills?.hair && (
                  <div className="skills-group">
                    <h3 className="skill-category">Парикмахерские услуги и уход за волосами</h3>
                    <div className="skill-tags">
                      {provider.skills.hair.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {provider.skills?.nails && (
                  <div className="skills-group">
                    <h3 className="skill-category">Маникюр и педикюр</h3>
                    <div className="skill-tags">
                      {provider.skills.nails.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Информация */}
              <section className="profile-section">
                <h2 className="section-title">ИНФОРМАЦИЯ</h2>
                
                {provider.specialization && (
                  <div className="info-block">
                    <h3 className="info-title">Специализация</h3>
                    <ul className="info-list">
                      {provider.specialization.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {provider.education && (
                  <div className="info-block">
                    <h3 className="info-title">Обучение</h3>
                    <ul className="info-list">
                      {provider.education.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Портфолио */}
              <section className="profile-section">
                <h2 className="section-title">ПОРТФОЛИО</h2>
                
                <div className="portfolio-tabs">
                  <button 
                    className={`portfolio-tab ${activePortfolioTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActivePortfolioTab('all')}
                  >
                    Все рубрики
                  </button>
                  <button 
                    className={`portfolio-tab ${activePortfolioTab === 'hair' ? 'active' : ''}`}
                    onClick={() => setActivePortfolioTab('hair')}
                  >
                    Парикмахерские услуги и уход за волосами
                  </button>
                  <button 
                    className={`portfolio-tab ${activePortfolioTab === 'nails' ? 'active' : ''}`}
                    onClick={() => setActivePortfolioTab('nails')}
                  >
                    Маникюр и педикюр
                  </button>
                </div>

                <div className="portfolio-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="portfolio-item">
                      <img 
                        src={`https://via.placeholder.com/300x300?text=Work+${item}`}
                        alt={`Работа ${item}`}
                        className="portfolio-image"
                      />
                    </div>
                  ))}
                </div>

                <button className="btn-show-all">ВСЕ РАБОТЫ</button>
              </section>

              {/* Отзывы */}
              <section className="profile-section">
                <h2 className="section-title">ОТЗЫВЫ</h2>
                <ReviewsList 
                  masterId={providerType === 'master' ? providerId : undefined}
                  salonId={providerType === 'salon' ? providerId : undefined}
                  showForm={false}
                />
                <button className="btn-show-all">ВСЕ ОТЗЫВЫ</button>
              </section>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProviderProfile;
