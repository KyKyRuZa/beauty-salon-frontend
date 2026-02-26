import React, { useReducer, useEffect } from 'react';
import { getAllCategories } from '../../../api/admin';

const initialState = {
  subcategories: [],
  categories: [],
  loading: true,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  search: '',
  showForm: false,
  editingSubcategory: null,
  formData: {
    name: '',
    description: '',
    category_id: '',
    is_active: true
  }
};

function subcategoriesManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_SUBCATEGORIES':
      return { ...state, subcategories: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value };
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
    case 'SET_EDITING_SUBCATEGORY':
      return { ...state, editingSubcategory: action.value };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.value };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, [action.key]: action.value } };
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialState.formData,
        editingSubcategory: null,
        showForm: false
      };
    default:
      return state;
  }
}

const SubcategoriesManagement = () => {
  const [state, dispatch] = useReducer(subcategoriesManagementReducer, initialState);

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [state.pagination.page, state.search]);

  const fetchSubcategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });

      dispatch({ type: 'SET_SUBCATEGORIES', value: [
        { id: 1, name: 'Маникюр', description: 'Услуги маникюра', category_id: 1, is_active: true, created_at: new Date() },
        { id: 2, name: 'Педикюр', description: 'Услуги педикюра', category_id: 1, is_active: true, created_at: new Date() }
      ]});
      dispatch({ type: 'SET_PAGINATION', value: { page: 1, limit: 10, total: 2, pages: 1 } });
      dispatch({ type: 'SET_ERROR', value: null });
    } catch (err) {
      console.error('Ошибка загрузки подкатегорий:', err);
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки подкатегорий' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories({ limit: 100 });
      dispatch({ type: 'SET_CATEGORIES', value: response.data.data });
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubcategories();
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
      console.log('Сохранение подкатегории:', state.formData);
      dispatch({ type: 'RESET_FORM' });
      fetchSubcategories();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка сохранения подкатегории' });
      console.error('Ошибка сохранения подкатегории:', err);
    }
  };

  const handleEdit = (subcategory) => {
    dispatch({ type: 'SET_FORM_DATA', value: {
      name: subcategory.name,
      description: subcategory.description || '',
      category_id: subcategory.category_id,
      is_active: subcategory.is_active
    }});
    dispatch({ type: 'SET_EDITING_SUBCATEGORY', value: subcategory });
    dispatch({ type: 'SET_SHOW_FORM', value: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту подкатегорию?')) {
      try {
        console.log('Удаление подкатегории с ID:', id);
        fetchSubcategories();
      } catch (err) {
        dispatch({ type: 'SET_ERROR', value: 'Ошибка удаления подкатегории' });
        console.error('Ошибка удаления подкатегории:', err);
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  if (state.loading) {
    return <div className="card"><h2>Загрузка подкатегорий...</h2></div>;
  }

  if (state.error) {
    return <div className="card"><h2>Ошибка: {state.error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление подкатегориями услуг</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            dispatch({ type: 'SET_SHOW_FORM', value: true });
          }}
        >
          Добавить подкатегорию
        </button>
      </div>

      {state.showForm && (
        <div className="card">
          <h3>{state.editingSubcategory ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}</h3>
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
              <label htmlFor="category_id">Категория *</label>
              <select
                id="category_id"
                name="category_id"
                value={state.formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите категорию</option>
                {state.categories.map(category => (
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
                  checked={state.formData.is_active}
                  onChange={handleInputChange}
                />
                Активна
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {state.editingSubcategory ? 'Обновить' : 'Создать'}
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
                <th>Категория</th>
                <th>Активна</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {state.subcategories.map(subcategory => (
                <tr key={subcategory.id}>
                  <td>{subcategory.id}</td>
                  <td>{subcategory.name}</td>
                  <td>{subcategory.description}</td>
                  <td>
                    {state.categories.find(cat => cat.id === subcategory.category_id)?.name || 'N/A'}
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

export default SubcategoriesManagement;