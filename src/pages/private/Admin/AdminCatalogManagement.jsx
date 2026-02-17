import React, { useState, useEffect } from 'react';
import {
  getCatalogCategories,
  createCatalogCategory,
  updateCatalogCategory,
  deleteCatalogCategory
} from '../../../api/catalog';
import '../../../style/catalog/AdminCatalogManagement.css';

const AdminCatalogManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    is_popular: false,
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCatalogCategories();
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки категорий');
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCatalogCategory(editingCategory.id, formData);
      } else {
        await createCatalogCategory(formData);
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError('Ошибка сохранения категории');
      console.error('Ошибка сохранения категории:', err);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      category: category.category || '',
      subcategory: category.subcategory || '',
      is_popular: category.is_popular || false,
      image_url: category.image_url || ''
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCatalogCategory(id);
        fetchCategories();
      } catch (err) {
        setError('Ошибка удаления категории');
        console.error('Ошибка удаления категории:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      is_popular: false,
      image_url: ''
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading && categories.length === 0) {
    return <div className="loading">Загрузка категорий...</div>;
  }

  return (
    <div className="admin-catalog-management">
      <h2>Управление каталогом услуг</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-actions">
        <button 
          className="add-category-btn" 
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Добавить категорию
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <h3>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h3>
          
          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Основная категория</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subcategory">Подкатегория</label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleInputChange}
              />
              Популярная категория
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="image_url">URL изображения</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingCategory ? 'Сохранить' : 'Создать'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        <h3>Существующие категории</h3>
        {categories.length === 0 ? (
          <p>Категории отсутствуют</p>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Популярная</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>{category.is_popular ? 'Да' : 'Нет'}</td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(category)}
                    >
                      Редактировать
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(category.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCatalogManagement;