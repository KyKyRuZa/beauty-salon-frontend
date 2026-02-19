import React, { useState, useEffect } from 'react';
import { getAllCategories } from '../../../api/admin';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    base_duration: '',
    subcategory_id: '',
    is_active: true
  });

  // Загружаем услуги, категории и подкатегории
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [pagination.page, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Временно используем заглушку, так как API для услуг может быть не готов
      // const response = await getAllServices({
      //   page: pagination.page,
      //   limit: pagination.limit,
      //   search: search
      // });
      // setServices(response.data.data);
      // setPagination(response.data.pagination);
      
      // Заглушка данных
      setServices([
        { id: 1, name: 'Покрытие гель-лаком', description: 'Стойкое покрытие с дизайном', base_price: 1500, base_duration: 120, subcategory_id: 1, is_active: true, created_at: new Date() },
        { id: 2, name: 'Обрезной маникюр', description: 'Классический обрезной маникюр', base_price: 800, base_duration: 60, subcategory_id: 1, is_active: true, created_at: new Date() }
      ]);
      setPagination({ page: 1, limit: 10, total: 2, pages: 1 });
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
      setError('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ limit: 100 }); // Получаем все категории
      setCategories(response.data.data);

      // Также получаем подкатегории для каждой категории
      // const allSubcategories = [];
      // for (const category of response.data.data) {
      //   // Здесь в реальности нужно будет получить подкатегории для каждой категории
      //   // const subcatResp = await getSubcategoriesByCategory(category.id);
      //   // allSubcategories.push(...subcatResp.data.data);
      // }
      // Временно используем заглушку для подкатегорий
      setSubcategories([
        { id: 1, name: 'Маникюр', category_id: 1 },
        { id: 2, name: 'Педикюр', category_id: 1 }
      ]);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
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
      // Здесь будет вызов API для создания/обновления услуги
      console.log('Сохранение услуги:', formData);
      resetForm();
      fetchServices();
    } catch (err) {
      setError('Ошибка сохранения услуги');
      console.error('Ошибка сохранения услуги:', err);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price,
      base_duration: service.base_duration,
      subcategory_id: service.subcategory_id,
      is_active: service.is_active
    });
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        // Здесь будет вызов API для удаления услуги
        console.log('Удаление услуги с ID:', id);
        fetchServices();
      } catch (err) {
        setError('Ошибка удаления услуги');
        console.error('Ошибка удаления услуги:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      base_duration: '',
      subcategory_id: '',
      is_active: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="card"><h2>Загрузка услуг...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление услугами</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Добавить услугу
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingService ? 'Редактировать услугу' : 'Добавить услугу'}</h3>
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
              <label htmlFor="base_price">Базовая цена *</label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="base_duration">Базовая продолжительность (мин) *</label>
              <input
                type="number"
                id="base_duration"
                name="base_duration"
                value={formData.base_duration}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subcategory_id">Подкатегория *</label>
              <select
                id="subcategory_id"
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите подкатегорию</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name} ({categories.find(cat => cat.id === subcategory.category_id)?.name || ''})
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
                {editingService ? 'Обновить' : 'Создать'}
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
            placeholder="Поиск услуг..."
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
                <th>Цена</th>
                <th>Продолжительность</th>
                <th>Подкатегория</th>
                <th>Активна</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.name}</td>
                  <td>{service.description}</td>
                  <td>{service.base_price} ₽</td>
                  <td>{service.base_duration} мин</td>
                  <td>
                    {subcategories.find(sub => sub.id === service.subcategory_id)?.name || 'N/A'}
                  </td>
                  <td>{service.is_active ? 'Да' : 'Нет'}</td>
                  <td>{new Date(service.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(service)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(service.id)}
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

export default ServicesManagement;