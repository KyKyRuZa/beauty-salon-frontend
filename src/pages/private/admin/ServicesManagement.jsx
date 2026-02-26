import React, { useReducer, useEffect } from 'react';
import { getAllCategories } from '../../../api/admin';

const initialState = {
  services: [],
  categories: [],
  subcategories: [],
  loading: true,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  search: '',
  showForm: false,
  editingService: null,
  formData: {
    name: '',
    description: '',
    base_price: '',
    base_duration: '',
    subcategory_id: '',
    is_active: true
  }
};

function servicesManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_SERVICES':
      return { ...state, services: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value };
    case 'SET_SUBCATEGORIES':
      return { ...state, subcategories: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.value } };
    case 'SET_SEARCH':
      return { ...state, search: action.value };
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.value } };
    case 'SET_SHOW_FORM':
      return { ...state, showForm: action.value };
    case 'SET_EDITING_SERVICE':
      return { ...state, editingService: action.value };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.value };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, [action.key]: action.value } };
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialState.formData,
        editingService: null,
        showForm: false
      };
    default:
      return state;
  }
}

const ServicesManagement = () => {
  const [state, dispatch] = useReducer(servicesManagementReducer, initialState);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [state.pagination.page, state.search]);

  const fetchServices = async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });

      dispatch({ type: 'SET_SERVICES', value: [
        { id: 1, name: 'Покрытие гель-лаком', description: 'Стойкое покрытие с дизайном', base_price: 1500, base_duration: 120, subcategory_id: 1, is_active: true, created_at: new Date() },
        { id: 2, name: 'Обрезной маникюр', description: 'Классический обрезной маникюр', base_price: 800, base_duration: 60, subcategory_id: 1, is_active: true, created_at: new Date() }
      ] });
      dispatch({ type: 'SET_PAGINATION', value: { page: 1, limit: 10, total: 2, pages: 1 } });
      dispatch({ type: 'SET_ERROR', value: null });
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err);
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки услуг' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ limit: 100 });
      dispatch({ type: 'SET_CATEGORIES', value: response.data.data });

      dispatch({ type: 'SET_SUBCATEGORIES', value: [
        { id: 1, name: 'Маникюр', category_id: 1 },
        { id: 2, name: 'Педикюр', category_id: 1 }
      ] });
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= state.pagination.pages) {
      dispatch({ type: 'SET_PAGE', value: newPage });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({ type: 'UPDATE_FORM_DATA', key: name, value: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Сохранение услуги:', state.formData);
      dispatch({ type: 'RESET_FORM' });
      fetchServices();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка сохранения услуги' });
      console.error('Ошибка сохранения услуги:', err);
    }
  };

  const handleEdit = (service) => {
    dispatch({ type: 'SET_FORM_DATA', value: {
      name: service.name,
      description: service.description || '',
      base_price: service.base_price,
      base_duration: service.base_duration,
      subcategory_id: service.subcategory_id,
      is_active: service.is_active
    }});
    dispatch({ type: 'SET_EDITING_SERVICE', value: service });
    dispatch({ type: 'SET_SHOW_FORM', value: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        console.log('Удаление услуги с ID:', id);
        fetchServices();
      } catch (err) {
        dispatch({ type: 'SET_ERROR', value: 'Ошибка удаления услуги' });
        console.error('Ошибка удаления услуги:', err);
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  if (state.loading) {
    return <div className="card"><h2>Загрузка услуг...</h2></div>;
  }

  if (state.error) {
    return <div className="card"><h2>Ошибка: {state.error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление услугами</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            dispatch({ type: 'SET_SHOW_FORM', value: true });
          }}
        >
          Добавить услугу
        </button>
      </div>

      {state.showForm && (
        <div className="card">
          <h3>{state.editingService ? 'Редактировать услугу' : 'Добавить услугу'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Название *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={state.formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                name="description"
                value={state.formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="base_price">Базовая цена *</label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={state.formData.base_price}
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
                value={state.formData.base_duration}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subcategory_id">Подкатегория *</label>
              <select
                id="subcategory_id"
                name="subcategory_id"
                value={state.formData.subcategory_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите подкатегорию</option>
                {state.subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name} ({state.categories.find(cat => cat.id === subcategory.category_id)?.name || ''})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={state.formData.is_active}
                  onChange={handleInputChange}
                />
                Активна
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {state.editingService ? 'Обновить' : 'Создать'}
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
            value={state.search}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
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
              {state.services.map(service => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.name}</td>
                  <td>{service.description}</td>
                  <td>{service.base_price} ₽</td>
                  <td>{service.base_duration} мин</td>
                  <td>
                    {state.subcategories.find(sub => sub.id === service.subcategory_id)?.name || 'N/A'}
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
            onClick={() => handlePageChange(state.pagination.page - 1)}
            disabled={state.pagination.page === 1}
          >
            Назад
          </button>
          <span>Страница {state.pagination.page} из {state.pagination.pages}</span>
          <button
            onClick={() => handlePageChange(state.pagination.page + 1)}
            disabled={state.pagination.page === state.pagination.pages}
          >
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesManagement;