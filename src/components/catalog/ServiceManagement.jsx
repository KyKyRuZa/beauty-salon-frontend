import React, { useState, useEffect } from 'react';
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
import api from '../../api/api';
import '../../style/catalog/ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salons, setSalons] = useState([]); // Список салонов
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    salon_id: '', // ID салона (опционально)
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_active: true // По умолчанию услуга активна
  });

  const { user: authUser, profile: authProfile } = useAuth();

  // Определяем тип пользователя
  const isMaster = (authUser && authUser.role === 'master');

  const isSalon = (authUser && authUser.role === 'salon');

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCatalogCategories();
        // The API returns { success: true, data: [...] }
        // So we need to access response.data.data to get the array of categories
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Ошибка при загрузке категорий:', err);
        setError('Ошибка при загрузке категорий: ' + (err.response?.data?.message || err.message));
      }
    };

    fetchCategories();
  }, []);

  // Load current user's salon if they are a salon owner
  useEffect(() => {
    if (authUser && authUser.role === 'salon') {
      // If the current user is a salon owner, add their salon to the list
      setSalons([authProfile]); // assuming authProfile contains salon info
    }
  }, [authUser, authProfile]);


  // Load services based on user type
  useEffect(() => {
    const fetchServices = async () => {
      if (!(authUser && (isMaster || isSalon))) return;

      try {
        setLoading(true);
        setError(null); // Clear previous errors

        let response;
        // Check if user is master or salon based on profile data
        if (isMaster) {
          response = await getMasterServices();
        } else if (isSalon) {
          response = await getSalonServices();
        }

        if (response) {
          // The API returns { success: true, data: [...], pagination: {...} }
          // So we need to access response.data.data to get the array of services
          setServices(response.data.data || []);
        }
      } catch (err) {
        console.error('Ошибка при загрузке услуг:', err);

        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Для доступа к услугам требуется авторизация. Пожалуйста, войдите в систему снова.');
          // Optionally redirect to login or clear auth state
        } else {
          setError('Ошибка при загрузке услуг: ' + (err.response?.data?.message || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [authUser, authProfile, isMaster, isSalon]);

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
      // Подготовка данных для отправки
      let submitData = { ...formData };

      // Преобразуем ID в числа, если они существуют и не являются пустыми строками
      if (submitData.master_id && submitData.master_id !== '') {
        submitData.master_id = Number(submitData.master_id);
      } else if (submitData.master_id === '') {
        delete submitData.master_id; // Удаляем пустое значение
      }
      
      if (submitData.salon_id && submitData.salon_id !== '') {
        submitData.salon_id = Number(submitData.salon_id);
      } else if (submitData.salon_id === '') {
        delete submitData.salon_id; // Удаляем пустое значение
      }
      
      if (submitData.category_id && submitData.category_id !== '') {
        submitData.category_id = Number(submitData.category_id);
      } else if (submitData.category_id === '') {
        delete submitData.category_id; // Удаляем пустое значение
      }

      // Не конвертируем price в числа, 
      // т.к. схема валидации принимает как числа, так и строки
      // Проверим, что значение не пустое перед отправкой
      if (submitData.price === '') {
        delete submitData.price;
      }

      if (editingService) {
        // Update existing service
        if (isMaster) {
          await updateMasterService(editingService.id, submitData);
        } else if (isSalon) {
          await updateSalonService(editingService.id, submitData);
        }
      } else {
        // Create new service
        if (isMaster) {
          // Для мастеров автоматически добавляем master_id
          if (authProfile && authProfile.id) {
            submitData.master_id = Number(authProfile.id);
          } else if (authUser && authUser.id) {
            submitData.master_id = Number(authUser.id);
          }
          await createMasterService(submitData);
        } else if (isSalon) {
          // Для салонов автоматически добавляем salon_id
          if (authProfile && authProfile.id) {
            submitData.salon_id = Number(authProfile.id);
          } else if (authUser && authUser.id) {
            submitData.salon_id = Number(authUser.id);
          }
          await createSalonService(submitData);
        }
      }

      // Refresh services list
      let response;
      if (isMaster) {
        response = await getMasterServices();
      } else if (isSalon) {
        response = await getSalonServices();
      }

      setServices(response.data.data || []);
      resetForm();
      setError(null); // Clear any previous errors after successful operation
    } catch (err) {
      console.error('Ошибка при сохранении услуги:', err);

      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Для выполнения этого действия требуется авторизация. Пожалуйста, войдите в систему снова.');
      } else {
        setError('Ошибка при сохранении услуги: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEdit = (service) => {
    setFormData({
      salon_id: service.salon_id || service.salon?.id || '',
      category_id: service.category_id || service.category?.id || '',
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      is_active: service.is_active !== undefined ? service.is_active : true
    });
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      try {
        if (isMaster) {
          await deleteMasterService(serviceId);
        } else if (isSalon) {
          await deleteSalonService(serviceId);
        }

        // Refresh services list
        let response;
        if (isMaster) {
          response = await getMasterServices();
        } else if (isSalon) {
          response = await getSalonServices();
        }

        setServices(response.data.data || []);
        setError(null); // Clear any previous errors after successful operation
      } catch (err) {
        console.error('Ошибка при удалении услуги:', err);
        
        // Check if it's an authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Для выполнения этого действия требуется авторизация. Пожалуйста, войдите в систему снова.');
        } else {
          setError('Ошибка при удалении услуги: ' + (err.response?.data?.message || err.message));
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      salon_id: '',
      category_id: '',
      name: '',
      description: '',
      price: '',
      is_active: true // По умолчанию услуга активна
    });
    setEditingService(null);
    setShowForm(false);
  };

  if ((loading && categories.length === 0) ) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

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
              setShowForm(true);
            }}
          >
            {editingService ? 'Отменить редактирование' : 'Добавить услугу'}
          </button>
          
          {showForm && (
            <form onSubmit={handleSubmit} className="service-form">
              <h3>{editingService ? 'Редактировать услугу' : 'Добавить новую услугу'}</h3>

              {salons.length > 0 && (
                <div className="form-group">
                  <label htmlFor="salon_id">Салон:</label>
                  <select
                    id="salon_id"
                    name="salon_id"
                    value={formData.salon_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите салон</option>
                    {salons.map(salon => (
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
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Без категории</option>
                  {categories.map(category => (
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
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Цена:</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
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
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_active: e.target.checked
                    }))}
                  />
                  Активна
                </label>
              </div>


              <button type="submit" className="submit-btn">
                {editingService ? 'Обновить' : 'Создать'}
              </button>
              {editingService && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Отмена
                </button>
              )}
            </form>
          )}
          
          <div className="services-list">
            <h3>Ваши услуги</h3>
            {(services && Array.isArray(services) && services.length > 0) ? (
              <ul>
                {services.map(service => (
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