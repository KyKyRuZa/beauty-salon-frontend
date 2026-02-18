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
        <div className="catalog-header">
          <h1>КАТЕГОРИИ</h1>
        </div>

        <div className="catalog-content">
          <div className="categories-section">
            <div className="categories-grid">
              {categories.map((category) => (
                <ServiceCategory
                  key={category.id}
                  category={category}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CatalogPage;