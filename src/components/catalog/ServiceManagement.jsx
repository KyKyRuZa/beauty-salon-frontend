import React, { useReducer, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { useAuth } from '../../context/AuthContext';
import {
  getMasterServices,
  getSalonServices,
  createMasterService,
  createSalonService,
  updateMasterService,
  updateSalonService,
  deleteMasterService,
  deleteSalonService,
  getCatalogCategories
} from '../../api/catalog';
import '../../styles/catalog/ServiceManagement.css';

const initialState = {
  services: [],
  categories: [],
  salons: [],
  loading: true,
  error: null,
  showForm: false,
  editingService: null,
  formData: {
    salon_id: '',
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_active: true
  }
};

function serviceManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_SERVICES':
      return { ...state, services: action.value };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.value };
    case 'SET_SALONS':
      return { ...state, salons: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
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

const ServiceManagement = () => {
  const [state, dispatch] = useReducer(serviceManagementReducer, initialState);
  const { user: authUser, profile: authProfile } = useAuth();

  const isMaster = (authUser && authUser.role === 'master');
  const isSalon = (authUser && authUser.role === 'salon');

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCatalogCategories();
        dispatch({ type: 'SET_CATEGORIES', value: response.data.data || [] });
      } catch (err) {
        logger.error('Ошибка при загрузке категорий:', err);
        dispatch({ type: 'SET_ERROR', value: 'Ошибка при загрузке категорий: ' + (err.response?.data?.message || err.message) });
      }
    };
    fetchCategories();
  }, []);

  // Load current user's salon if they are a salon owner
  useEffect(() => {
    if (authUser && authUser.role === 'salon') {
      dispatch({ type: 'SET_SALONS', value: [authProfile] });
    }
  }, [authUser, authProfile]);

  // Load services based on user type
  useEffect(() => {
    const fetchServices = async () => {
      if (!(authUser && (isMaster || isSalon))) return;

      try {
        dispatch({ type: 'SET_LOADING', value: true });
        dispatch({ type: 'SET_ERROR', value: null });

        let response;
        if (isMaster) {
          response = await getMasterServices();
        } else if (isSalon) {
          response = await getSalonServices();
        }

        if (response) {
          dispatch({ type: 'SET_SERVICES', value: response.data.data || [] });
        }
      } catch (err) {
        logger.error('Ошибка при загрузке услуг:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          dispatch({ type: 'SET_ERROR', value: 'Для доступа к услугам требуется авторизация. Пожалуйста, войдите в систему снова.' });
        } else {
          dispatch({ type: 'SET_ERROR', value: 'Ошибка при загрузке услуг: ' + (err.response?.data?.message || err.message) });
        }
      } finally {
        dispatch({ type: 'SET_LOADING', value: false });
      }
    };

    fetchServices();
  }, [authUser, authProfile, isMaster, isSalon]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({ type: 'UPDATE_FORM_DATA', key: name, value: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let submitData = { ...state.formData };

      if (submitData.master_id && submitData.master_id !== '') {
        submitData.master_id = Number(submitData.master_id);
      } else if (submitData.master_id === '') {
        delete submitData.master_id;
      }

      if (submitData.salon_id && submitData.salon_id !== '') {
        submitData.salon_id = Number(submitData.salon_id);
      } else if (submitData.salon_id === '') {
        delete submitData.salon_id;
      }

      if (submitData.category_id && submitData.category_id !== '') {
        submitData.category_id = Number(submitData.category_id);
      } else if (submitData.category_id === '') {
        delete submitData.category_id;
      }

      if (submitData.price === '') {
        delete submitData.price;
      }

      if (state.editingService) {
        if (isMaster) {
          await updateMasterService(state.editingService.id, submitData);
        } else if (isSalon) {
          await updateSalonService(state.editingService.id, submitData);
        }
      } else {
        if (isMaster) {
          if (authProfile && authProfile.id) {
            submitData.master_id = Number(authProfile.id);
          } else if (authUser && authUser.id) {
            submitData.master_id = Number(authUser.id);
          }
          await createMasterService(submitData);
        } else if (isSalon) {
          if (authProfile && authProfile.id) {
            submitData.salon_id = Number(authProfile.id);
          } else if (authUser && authUser.id) {
            submitData.salon_id = Number(authUser.id);
          }
          await createSalonService(submitData);
        }
      }

      let response;
      if (isMaster) {
        response = await getMasterServices();
      } else if (isSalon) {
        response = await getSalonServices();
      }

      dispatch({ type: 'SET_SERVICES', value: response.data.data || [] });
      dispatch({ type: 'RESET_FORM' });
      dispatch({ type: 'SET_ERROR', value: null });
    } catch (err) {
      logger.error('Ошибка при сохранении услуги:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        dispatch({ type: 'SET_ERROR', value: 'Для выполнения этого действия требуется авторизация. Пожалуйста, войдите в систему снова.' });
      } else {
        dispatch({ type: 'SET_ERROR', value: 'Ошибка при сохранении услуги: ' + (err.response?.data?.message || err.message) });
      }
    }
  };

  const handleEdit = (service) => {
    dispatch({ type: 'SET_FORM_DATA', value: {
      salon_id: service.salon_id || service.salon?.id || '',
      category_id: service.category_id || service.category?.id || '',
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      is_active: service.is_active !== undefined ? service.is_active : true
    }});
    dispatch({ type: 'SET_EDITING_SERVICE', value: service });
    dispatch({ type: 'SET_SHOW_FORM', value: true });
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        if (isMaster) {
          await deleteMasterService(serviceId);
        } else if (isSalon) {
          await deleteSalonService(serviceId);
        }

        let response;
        if (isMaster) {
          response = await getMasterServices();
        } else if (isSalon) {
          response = await getSalonServices();
        }

        dispatch({ type: 'SET_SERVICES', value: response.data.data || [] });
        dispatch({ type: 'SET_ERROR', value: null });
      } catch (err) {
        logger.error('Ошибка при удалении услуги:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          dispatch({ type: 'SET_ERROR', value: 'Для выполнения этого действия требуется авторизация. Пожалуйста, войдите в систему снова.' });
        } else {
          dispatch({ type: 'SET_ERROR', value: 'Ошибка при удалении услуги: ' + (err.response?.data?.message || err.message) });
        }
      }
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  if ((state.loading && state.categories.length === 0)) return <div className="loading">Загрузка...</div>;
  if (state.error) return <div className="error">{state.error}</div>;

  return (
    <div className="service-management">
      <h2>Управление услугами</h2>

      {!(authUser && (isMaster || isSalon)) && (
        <p>Пожалуйста, войдите в систему как мастер или салон для управления услугами.</p>
      )}

      {authUser && (isMaster || isSalon) && (
        <>
          <button
            className="add-service-btn"
            onClick={() => {
              resetForm();
              dispatch({ type: 'SET_SHOW_FORM', value: true });
            }}
          >
            {state.editingService ? 'Отменить редактирование' : 'Добавить услугу'}
          </button>

          {state.showForm && (
            <form onSubmit={handleSubmit} className="service-form">
              <h3>{state.editingService ? 'Редактировать услугу' : 'Добавить новую услугу'}</h3>

              {state.salons.length > 0 && (
                <div className="form-group">
                  <label htmlFor="salon_id">Салон:</label>
                  <select
                    id="salon_id"
                    name="salon_id"
                    value={state.formData.salon_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите салон</option>
                    {state.salons.map(salon => (
                      <option key={salon.id} value={salon.id}>
                        {salon.name || salon.title || salon.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="category_id">Категория услуги:</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={state.formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Без категории</option>
                  {state.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Название услуги:</label>
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
                <label htmlFor="description">Описание:</label>
                <textarea
                  id="description"
                  name="description"
                  value={state.formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Цена:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={state.formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={state.formData.is_active}
                    onChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', key: 'is_active', value: e.target.checked })}
                  />
                  Активна
                </label>
              </div>


              <button type="submit" className="submit-btn">
                {state.editingService ? 'Обновить' : 'Создать'}
              </button>
              {state.editingService && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Отмена
                </button>
              )}
            </form>
          )}

          <div className="services-list">
            <h3>Ваши услуги</h3>
            {(state.services && Array.isArray(state.services) && state.services.length > 0) ? (
              <ul>
                {state.services.map(service => (
                  <li key={service.id} className="service-item">
                    <div className="service-info">
                      <h4>{service.name || 'Услуга'}</h4>
                      <p>{service.description}</p>
                      <p><strong>Цена:</strong> {service.price} руб</p>
                    </div>
                    <div className="service-actions">
                      <button
                        onClick={() => handleEdit(service)}
                        className="edit-btn"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="delete-btn"
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>У вас пока нет услуг. Добавьте первую услугу!</p>
            )}
          </div>
        </>
      )}
      
      {authUser && !(isMaster || isSalon) && (
        <p>Только мастера и салоны могут управлять услугами.</p>
      )}
    </div>
  );
};

export default ServiceManagement;