import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { getCatalogCategories, searchCategories } from '../../api/catalog';
import { useNavigate } from 'react-router-dom';
import ServiceCategory from '../../components/catalog/ServiceCategory';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import '../../styles/catalog/CatalogPage.css';

const initialState = {
  categories: [],
  loading: true,
  error: null,
  searchQuery: '',
  filteredCategories: [],
  isSearching: false
};

function catalogPageReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value, filteredCategories: action.value, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.value };
    case 'SET_FILTERED_CATEGORIES':
      return { ...state, filteredCategories: action.value };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.value };
    default:
      return state;
  }
}

const CatalogPage = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(catalogPageReducer, initialState);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });

      const categoriesResponse = await getCatalogCategories();
      dispatch({ type: 'SET_CATEGORIES', value: categoriesResponse.data.data });
      dispatch({ type: 'SET_ERROR', value: null });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки категорий услуг' });
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  // Поиск с дебаунсом 300мс
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      dispatch({ type: 'SET_FILTERED_CATEGORIES', value: state.categories });
      dispatch({ type: 'SET_IS_SEARCHING', value: false });
      return;
    }

    dispatch({ type: 'SET_IS_SEARCHING', value: true });
    try {
      const response = await searchCategories(query);
      dispatch({ type: 'SET_FILTERED_CATEGORIES', value: response.data || [] });
    } catch (err) {
      console.error('Ошибка поиска категорий:', err);
      dispatch({ type: 'SET_FILTERED_CATEGORIES', value: [] });
    } finally {
      dispatch({ type: 'SET_IS_SEARCHING', value: false });
    }
  }, [state.categories]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    dispatch({ type: 'SET_SEARCH_QUERY', value: query });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (state.loading && state.categories.length === 0) {
    return <div className="loading">Загрузка каталога услуг...</div>;
  }

  if (state.error && !state.loading) {
    return <div className="error">{state.error}</div>;
  }

  const handleCategoryClick = (category) => {
    // Переходим на страницу салонов/мастеров для выбранной категории
    navigate(`/catalog/category/${category.id}/providers`);
  };

  return (
    <>
      <Header />
      <div className="catalog-page">
        <div className="catalog-banner">
          <img alt="Баннер" className="banner-image" />
        </div>

        <div className="catalog-header">
          <h1>КАТЕГОРИИ</h1>
          <div className="search-form catalog-search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск категорий..."
                value={state.searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <button type="button" className="search-button">
                <span className="material-symbols-outlined search-icon">search</span>
              </button>
            </div>
          </div>
        </div>

        <div className="catalog-content">
          <div className="categories-section">
            <div className="categories-grid">
              {state.isSearching ? (
                <div className="no-results">
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '10px' }}>searching</span>
                  <p>Поиск...</p>
                </div>
              ) : state.filteredCategories.length > 0 ? (
                state.filteredCategories.map((category) => (
                  <ServiceCategory
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                  />
                ))
              ) : state.searchQuery.length >= 2 ? (
                <div className="no-results">
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '10px' }}>search_off</span>
                  <p>Категории не найдены</p>
                  <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '10px' }}>
                    Попробуйте изменить поисковый запрос
                  </p>
                </div>
              ) : (
                <div className="no-results">
                  <p>Начните вводить название категории для поиска</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CatalogPage;