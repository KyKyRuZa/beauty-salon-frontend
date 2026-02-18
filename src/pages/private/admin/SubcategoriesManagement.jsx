import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../../../api/admin';

const SubcategoriesManagement = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    is_active: true
  });

  // Загружаем подкатегории и категории
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [pagination.page, search]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      // Временно используем заглушку, так как API для подкатегорий может быть не готов
      // const response = await getAllSubcategories({
      //   page: pagination.page,
      //   limit: pagination.limit,
      //   search: search
      // });
      // setSubcategories(response.data.data);
      // setPagination(response.data.pagination);
      
      // Заглушка данных
      setSubcategories([
        { id: 1, name: 'Маникюр', description: 'Услуги маникюра', category_id: 1, is_active: true, created_at: new Date() },
        { id: 2, name: 'Педикюр', description: 'Услуги педикюра', category_id: 1, is_active: true, created_at: new Date() }
      ]);
      setPagination({ page: 1, limit: 10, total: 2, pages: 1 });
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки подкатегорий:', err);
      setError('Ошибка загрузки подкатегорий');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ limit: 100 }); // Получаем все категории
      setCategories(response.data.data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubcategories();
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
    try {
      // Здесь будет вызов API для создания/обновления подкатегории
      console.log('Сохранение подкатегории:', formData);
      resetForm();
      fetchSubcategories();
    } catch (err) {
      setError('Ошибка сохранения подкатегории');
      console.error('Ошибка сохранения подкатегории:', err);
    }
  };

  const handleEdit = (subcategory) => {
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      category_id: subcategory.category_id,
      is_active: subcategory.is_active
    });
    setEditingSubcategory(subcategory);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подкатегорию?')) {
      try {
        // Здесь будет вызов API для удаления подкатегории
        console.log('Удаление подкатегории с ID:', id);
        fetchSubcategories();
      } catch (err) {
        setError('Ошибка удаления подкатегории');
        console.error('Ошибка удаления подкатегории:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      is_active: true
    });
    setEditingSubcategory(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="card"><h2>Загрузка подкатегорий...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление подкатегориями услуг</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Добавить подкатегорию
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingSubcategory ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}</h3>
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
              <label htmlFor="category_id">Категория *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingSubcategory ? 'Обновить' : 'Создать'}
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
            placeholder="Поиск подкатегорий..."
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
                <th>Категория</th>
                <th>Активна</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map(subcategory => (
                <tr key={subcategory.id}>
                  <td>{subcategory.id}</td>
                  <td>{subcategory.name}</td>
                  <td>{subcategory.description}</td>
                  <td>
                    {categories.find(cat => cat.id === subcategory.category_id)?.name || 'N/A'}
                  </td>
                  <td>{subcategory.is_active ? 'Да' : 'Нет'}</td>
                  <td>{new Date(subcategory.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(subcategory)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(subcategory.id)}
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

export default SubcategoriesManagement;