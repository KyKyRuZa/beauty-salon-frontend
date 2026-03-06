import React, { useReducer, useCallback, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../api/admin';

const initialState = {
  categories: [],
  loading: true,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  search: '',
  showForm: false,
  editingCategory: null,
  formData: {
    name: '',
    description: '',
    is_active: true,
    is_popular: false
  }
};

function categoriesManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value, error: null };
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
    case 'SET_EDITING_CATEGORY':
      return { ...state, editingCategory: action.value };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.value };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, [action.key]: action.value } };
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialState.formData,
        editingCategory: null,
        showForm: false
      };
    default:
      return state;
  }
}

const CategoriesManagement = () => {
  const [state, dispatch] = useReducer(categoriesManagementReducer, initialState);

  const fetchCategories = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const response = await getAllCategories({
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: state.search
      });
      dispatch({ type: 'SET_CATEGORIES', value: response.data.data });
      dispatch({ type: 'SET_PAGINATION', value: response.data.pagination });
    } catch (err) {
      logger.error('Ошибка загрузки категорий:', err);
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки категорий' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.pagination.page, state.pagination.limit, state.search]);

  useEffect(() => {
    fetchCategories();
  }, [state.pagination.page, state.search, fetchCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories();
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

    const transformedData = {
      name: state.formData.name,
      description: state.formData.description,
      isActive: state.formData.is_active,
      isPopular: state.formData.is_popular,
    };

    try {
      if (state.editingCategory) {
        await updateCategory(state.editingCategory.id, transformedData);
      } else {
        await createCategory(transformedData);
      }
      dispatch({ type: 'RESET_FORM' });
      fetchCategories();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка сохранения категории' });
      logger.error('Ошибка сохранения категории:', err);
    }
  };

  const handleEdit = (category) => {
    dispatch({ type: 'SET_FORM_DATA', value: {
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
      is_popular: category.is_popular
    }});
    dispatch({ type: 'SET_EDITING_CATEGORY', value: category });
    dispatch({ type: 'SET_SHOW_FORM', value: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        dispatch({ type: 'SET_ERROR', value: 'Ошибка удаления категории' });
        logger.error('Ошибка удаления категории:', err);
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  if (state.loading) {
    return <div className="card"><h2>Загрузка категорий...</h2></div>;
  }

  if (state.error) {
    return <div className="card"><h2>Ошибка: {state.error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление категориями услуг</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            dispatch({ type: 'SET_SHOW_FORM', value: true });
          }}
        >
          Добавить категорию
        </button>
      </div>

      {state.showForm && (
        <div className="card">
          <h3>{state.editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h3>
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

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_popular"
                  checked={state.formData.is_popular}
                  onChange={handleInputChange}
                />
                Популярная
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {state.editingCategory ? 'Обновить' : 'Создать'}
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
                <th>Активна</th>
                <th>Популярная</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {state.categories.map(category => (
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

export default CategoriesManagement;