import React, { useReducer, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import ReviewsList from '../../components/reviews/ReviewsList';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite, checkFavorite } from '../../api/favorites';
import '../../styles/ProviderProfile.css';

const initialState = {
  provider: null,
  loading: true,
  isFavorite: false,
  activePortfolioTab: 'all',
  providerType: 'master'
};

function providerReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_PROVIDER':
      return { ...state, provider: action.data };
    case 'SET_IS_FAVORITE':
      return { ...state, isFavorite: action.value };
    case 'SET_ACTIVE_TAB':
      return { ...state, activePortfolioTab: action.value };
    case 'SET_PROVIDER_TYPE':
      return { ...state, providerType: action.value };
    case 'TOGGLE_FAVORITE':
      return { ...state, isFavorite: !state.isFavorite };
    default:
      return state;
  }
}

const ProviderProfile = () => {
  const { providerId, type = 'master' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(providerReducer, {
    ...initialState,
    providerType: type
  });

  const loadProviderData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', value: true });
    try {
      const endpoint = state.providerType === 'master' ? 'master' : 'salon';
      const response = await fetch(`/api/providers/${endpoint}/${providerId}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'SET_PROVIDER',
          data: {
            ...data.data,
            has_training: true,
            skills: {
              hair: ['Укладка и причёски', 'Ламинирование и ботокс волос', 'Лечение волос и кожи головы'],
              nails: ['Маникюр без покрытия', 'Маникюр с покрытием', 'Педикюр пальчики без покрытия', 'Дизайн ногтей', 'Ремонт одного ногтя', 'SPA-уход для рук и ног']
            },
            specialization: state.providerType === 'master' ? [
              'стрижки разных уровней сложности',
              'сухой метод стрижки кудрявых волос',
              'коктейльные укладки',
              'простые окрашивания',
              'смена образа'
            ] : ['Работаем с 2010 года', 'Маникюр и педикюр', 'Косметология'],
            education: state.providerType === 'master' ? [
              'Международная академия Долорес',
              'Участие в программах «Модный приговор»',
              'Постоянно повышает свою квалификацию'
            ] : ['Работаем с 2010 года', 'Все мастера сертифицированы']
          }
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [providerId, state.providerType]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || state.providerType !== 'master') return;
    try {
      const response = await checkFavorite(providerId);
      dispatch({ type: 'SET_IS_FAVORITE', value: response.data.isFavorite });
    } catch (error) {
      console.error('Ошибка проверки избранного:', error);
    }
  }, [providerId, user, state.providerType]);

  useEffect(() => {
    loadProviderData();
    checkFavoriteStatus();
  }, [providerId, loadProviderData, checkFavoriteStatus]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Для добавления в избранное необходимо войти в систему');
      return;
    }
    if (state.providerType !== 'master') {
      alert('В избранное можно добавлять только мастеров');
      return;
    }

    try {
      await toggleFavorite(providerId);
      dispatch({ type: 'TOGGLE_FAVORITE' });
    } catch (error) {
      console.error('Ошибка переключения избранного:', error);
      alert(error.response?.data?.message || 'Ошибка при изменении избранного');
    }
  };

  const handleBook = (serviceId) => {
    const url = `/catalog/provider/${providerId}/timeslots?type=${state.providerType}${serviceId ? `&service=${serviceId}` : ''}`;
    navigate(url);
  };

  const handleWriteReview = () => {
    navigate(`/reviews/write?provider=${providerId}&type=${state.providerType}`);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    dispatch({ type: 'SET_PROVIDER_TYPE', value: newType });
    navigate(`/provider/${providerId}?type=${newType}`);
  };

  if (state.loading) {
    return (
      <>
        <Header />
        <div className="provider-profile-loading">Загрузка профиля...</div>
        <Footer />
      </>
    );
  }

  if (!state.provider) {
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
                  <select value={state.providerType} onChange={handleTypeChange}>
                    <option value="master">Бьюти-мастер</option>
                    <option value="salon">Салон красоты</option>
                  </select>
                </div>

                <img
                  src={state.provider.image_url || 'https://via.placeholder.com/300'}
                  alt={state.provider.first_name || state.provider.name}
                  className="profile-avatar"
                />

                <h1 className="profile-name">
                  {state.providerType === 'master'
                    ? `${state.provider.first_name || ''} ${state.provider.last_name || ''}`.trim()
                    : state.provider.name || 'Салон'}
                </h1>

                {state.provider.experience && (
                  <p className="profile-experience">
                    Стаж работы: {state.provider.experience} лет
                  </p>
                )}

                <div className="profile-location">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{state.provider.address || 'Адрес не указан'}</span>
                </div>

                <div className="profile-hours">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>09:00 - 19:00</span>
                </div>

                {state.provider.has_training && (
                  <div className="training-badge">есть обучение</div>
                )}

                <div className="profile-rating">
                  <span>{state.provider.rating || '4.8'}</span>
                  <span className="material-symbols-outlined">star</span>
                </div>

                <div className="profile-actions">
                  <button className="btn-book" onClick={handleBook}>
                    ЗАПИСАТЬСЯ
                  </button>
                  {state.providerType === 'master' && (
                    <button
                      className={`btn-profile-favorite ${state.isFavorite ? 'active' : ''}`}
                      onClick={handleToggleFavorite}
                    >
                      {state.isFavorite ? 'В ИЗБРАННОМ' : 'ДОБАВИТЬ В ИЗБРАННОЕ'}
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

                {state.provider.skills?.hair && (
                  <div className="skills-group">
                    <h3 className="skill-category">Парикмахерские услуги и уход за волосами</h3>
                    <div className="skill-tags">
                      {state.provider.skills.hair.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {state.provider.skills?.nails && (
                  <div className="skills-group">
                    <h3 className="skill-category">Маникюр и педикюр</h3>
                    <div className="skill-tags">
                      {state.provider.skills.nails.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Информация */}
              <section className="profile-section">
                <h2 className="section-title">ИНФОРМАЦИЯ</h2>

                {state.provider.specialization && (
                  <div className="info-block">
                    <h3 className="info-title">Специализация</h3>
                    <ul className="info-list">
                      {state.provider.specialization.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {state.provider.education && (
                  <div className="info-block">
                    <h3 className="info-title">Обучение</h3>
                    <ul className="info-list">
                      {state.provider.education.map((item) => (
                        <li key={item}>{item}</li>
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
                    className={`portfolio-tab ${state.activePortfolioTab === 'all' ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', value: 'all' })}
                  >
                    Все рубрики
                  </button>
                  <button
                    className={`portfolio-tab ${state.activePortfolioTab === 'hair' ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', value: 'hair' })}
                  >
                    Парикмахерские услуги и уход за волосами
                  </button>
                  <button
                    className={`portfolio-tab ${state.activePortfolioTab === 'nails' ? 'active' : ''}`}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', value: 'nails' })}
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
                  masterId={state.providerType === 'master' ? providerId : undefined}
                  salonId={state.providerType === 'salon' ? providerId : undefined}
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