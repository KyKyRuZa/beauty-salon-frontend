import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCatalogCategories, searchCategories } from '../../api/catalog';
import { useNavigate } from 'react-router-dom';
import ServiceCategory from '../../components/catalog/ServiceCategory';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import '../../styles/catalog/CatalogPage.css';

const CatalogPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Загружаем категории
      const categoriesResponse = await getCatalogCategories();
      setCategories(categoriesResponse.data.data);
      setFilteredCategories(categoriesResponse.data.data);

      setError(null);
    } catch (err) {
      setError('Ошибка загрузки категорий услуг');
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(false);
    }
  };

  // Поиск с дебаунсом 300мс
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      // Если запрос короче 2 символов, показываем все категории
      setFilteredCategories(categories);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchCategories(query);
      setFilteredCategories(response.data || []);
    } catch (err) {
      console.error('Ошибка поиска категорий:', err);
      setFilteredCategories([]);
    } finally {
      setIsSearching(false);
    }
  }, [categories]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Устанавливаем новый таймер с дебаунсом 300мс
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

  if (loading && categories.length === 0) {
    return <div className="loading">Загрузка каталога услуг...</div>;
  }

  if (error && !loading) {
    return <div className="error">{error}</div>;
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
          <form onSubmit={(e) => e.preventDefault()} className="search-form catalog-search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск категорий..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <span className="material-symbols-outlined search-icon">search</span>
              </button>
            </div>
          </form>
        </div>

        <div className="catalog-content">
          <div className="categories-section">
            <div className="categories-grid">
              {isSearching ? (
                <div className="no-results">
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '10px' }}>searching</span>
                  <p>Поиск...</p>
                </div>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <ServiceCategory
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                  />
                ))
              ) : searchQuery.length >= 2 ? (
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