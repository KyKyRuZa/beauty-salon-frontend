import React, { useState, useEffect } from 'react';
import { getCatalogCategories } from '../../api/catalog';
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Загружаем категории
      const categoriesResponse = await getCatalogCategories();
      setCategories(categoriesResponse.data.data);

      setError(null);
    } catch (err) {
      setError('Ошибка загрузки категорий услуг');
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    // Переходим на страницу салонов/мастеров для выбранной категории
    navigate(`/catalog/category/${category.id}/providers`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Фильтрация категорий по поиску
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && categories.length === 0) {
    return <div className="loading">Загрузка каталога услуг...</div>;
  }

  if (error && !loading) {
    return <div className="error">{error}</div>;
  }

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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <ServiceCategory
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                  />
                ))
              ) : (
                <div className="no-results">
                  <p>Категории не найдены</p>
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