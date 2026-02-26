import React, { useReducer, useEffect, useCallback } from 'react';
import { getAllAdmins, createAdmin } from '../../../api/admin';

const initialState = {
  admins: [],
  loading: true,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  search: '',
  showForm: false,
  formData: {
    user_id: '',
    role: 'admin',
    permissions: {},
    first_name: '',
    last_name: ''
  }
};

function adminsManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ADMINS':
      return { ...state, admins: action.value, error: null };
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
    case 'SET_FORM_DATA':
      return { ...state, formData: action.value };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, [action.key]: action.value } };
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialState.formData,
        showForm: false
      };
    default:
      return state;
  }
}

const AdminsManagement = () => {
  const [state, dispatch] = useReducer(adminsManagementReducer, initialState);

  const fetchAdmins = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const response = await getAllAdmins({
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: state.search
      });
      dispatch({ type: 'SET_ADMINS', value: response.data.data });
      dispatch({ type: 'SET_PAGINATION', value: response.data.pagination });
    } catch (err) {
      console.error('Ошибка загрузки администраторов:', err);
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки администраторов' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.pagination.page, state.pagination.limit, state.search]);

  useEffect(() => {
    fetchAdmins();
  }, [state.pagination.page, state.search, fetchAdmins]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmins();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= state.pagination.pages) {
      dispatch({ type: 'SET_PAGE', value: newPage });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FORM_DATA', key: name, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(state.formData);
      dispatch({ type: 'RESET_FORM' });
      fetchAdmins();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: 'Ошибка создания администратора' });
      console.error('Ошибка создания администратора:', err);
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  if (state.loading) {
    return <div className="card"><h2>Загрузка администраторов...</h2></div>;
  }

  if (state.error) {
    return <div className="card"><h2>Ошибка: {state.error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление администраторами</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            dispatch({ type: 'SET_SHOW_FORM', value: true });
          }}
        >
          Назначить администратора
        </button>
      </div>

      {state.showForm && (
        <div className="card">
          <h3>Назначить нового администратора</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user_id">Пользователь *</label>
              <select
                id="user_id"
                name="user_id"
                value={state.formData.user_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите пользователя</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="role">Роль *</label>
              <select
                id="role"
                name="role"
                value={state.formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="admin">Администратор</option>
                <option value="super_admin">Суперадминистратор</option>
                <option value="moderator">Модератор</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="first_name">Имя</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={state.formData.first_name}
                onChange={handleInputChange}
                placeholder="Введите имя администратора"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Фамилия</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={state.formData.last_name}
                onChange={handleInputChange}
                placeholder="Введите фамилию администратора"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Назначить
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
            placeholder="Поиск администраторов..."
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
                <th>Email пользователя</th>
                <th>Имя и Фамилия</th>
                <th>Роль</th>
                <th>Дата назначения</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {state.admins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.user?.email || 'N/A'}</td>
                  <td>{admin.first_name && admin.last_name ? `${admin.first_name} ${admin.last_name}` : 'N/A'}</td>
                  <td>{admin.role}</td>
                  <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td>{admin.is_active ? 'Активен' : 'Неактивен'}</td>
                  <td>
                    <button className="btn btn-warning">Редактировать</button>
                    <button className="btn btn-danger">Удалить</button>
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

export default AdminsManagement;