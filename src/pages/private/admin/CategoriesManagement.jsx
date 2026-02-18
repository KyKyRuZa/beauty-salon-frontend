import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../api/admin';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    is_popular: false
  });

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories({
        page: pagination.page,
        limit: pagination.limit,
        search: search
      });
      setCategories(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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
    
    // Преобразуем данные формы к формату, ожидаемому схемой валидации
    const transformedData = {
      name: formData.name,
      description: formData.description,
      isActive: formData.is_active,
      isPopular: formData.is_popular,
    };
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, transformedData);
      } else {
        await createCategory(transformedData);
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
      is_active: category.is_active,
      is_popular: category.is_popular
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCategory(id);
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
      is_active: true,
      is_popular: false
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="card"><h2>Загрузка категорий...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление категориями услуг</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Добавить категорию
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h3>
          <form onSubmit={handleSubmit}>
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
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Активна
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_popular"
                  checked={formData.is_popular}
                  onChange={handleInputChange}
                />
                Популярная
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingCategory ? 'Обновить' : 'Создать'}
              </button>
              <button type="button" className="btn btn-warning" onClick={resetForm}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Поиск категорий..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Поиск</button>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Активна</th>
                <th>Популярная</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>{category.is_active ? 'Да' : 'Нет'}</td>
                  <td>{category.is_popular ? 'Да' : 'Нет'}</td>
                  <td>{new Date(category.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(category)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(category.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Назад
          </button>
          <span>Страница {pagination.page} из {pagination.pages}</span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;