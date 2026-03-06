import React, { useReducer, useEffect } from 'react';
import { logger } from '../../../utils/logger';
import {
  getCatalogCategories,
  createCatalogCategory,
  updateCatalogCategory,
  deleteCatalogCategory
} from '../../../api/catalog';
import '../../../styles/admin/AdminCatalogManagement.css';

const initialState = {
  categories: [],
  loading: true,
  error: null,
  showForm: false,
  editingCategory: null,
  formData: {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    is_popular: false,
    image_url: ''
  }
};

function adminCatalogReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_SHOW_FORM':
      return { ...state, showForm: action.value };
    case 'SET_EDITING_CATEGORY':
      return { ...state, editingCategory: action.value };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.value };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.value } };
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

const AdminCatalogManagement = () => {
  const [state, dispatch] = useReducer(adminCatalogReducer, initialState);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const response = await getCatalogCategories();
      dispatch({ type: 'SET_CATEGORIES', value: response.data.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки категорий' });
      logger.error('Ошибка загрузки категорий:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({ type: 'UPDATE_FORM_DATA', value: { [name]: type === 'checkbox' ? checked : value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (state.editingCategory) {
        await updateCatalogCategory(state.editingCategory.id, state.formData);
      } else {
        await createCatalogCategory(state.formData);
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
      category: category.category || '',
      subcategory: category.subcategory || '',
      is_popular: category.is_popular || false,
      image_url: category.image_url || ''
    }});
    dispatch({ type: 'SET_EDITING_CATEGORY', value: category });
    dispatch({ type: 'SET_SHOW_FORM', value: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await deleteCatalogCategory(id);
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

  if (state.loading && state.categories.length === 0) {
    return <div className="loading">Загрузка категорий...</div>;
  }

  return (
    <div className="admin-catalog-management">
      <h2>Управление каталогом услуг</h2>

      {state.error && <div className="error-message">{state.error}</div>}

      <div className="admin-actions">
        <button
          className="add-category-btn"
          onClick={() => {
            resetForm();
            dispatch({ type: 'SET_SHOW_FORM', value: true });
          }}
        >
          Добавить категорию
        </button>
      </div>

      {state.showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <h3>{state.editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h3>

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
            <label htmlFor="category">Основная категория</label>
            <input
              type="text"
              id="category"
              name="category"
              value={state.formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">Подкатегория</label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={state.formData.subcategory}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_popular"
                checked={state.formData.is_popular}
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
              value={state.formData.image_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              {state.editingCategory ? 'Сохранить' : 'Создать'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        <h3>Существующие категории</h3>
        {state.categories.length === 0 ? (
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
              {state.categories.map(category => (
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