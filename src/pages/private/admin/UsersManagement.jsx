import React, { useReducer, useEffect, useCallback } from 'react';
import { logger } from '../../../utils/logger';
import { getAllUsers } from '../../../api/admin';

const initialState = {
  users: [],
  loading: true,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  search: ''
};

function usersManagementReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_USERS':
      return { ...state, users: action.value, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.value } };
    case 'SET_SEARCH':
      return { ...state, search: action.value };
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.value } };
    default:
      return state;
  }
}

const UsersManagement = () => {
  const [state, dispatch] = useReducer(usersManagementReducer, initialState);

  const fetchUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      const response = await getAllUsers({
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: state.search
      });
      dispatch({ type: 'SET_USERS', value: response.data.data });
      dispatch({ type: 'SET_PAGINATION', value: response.data.pagination });
    } catch (err) {
      logger.error('Ошибка загрузки пользователей:', err);
      dispatch({ type: 'SET_ERROR', value: 'Ошибка загрузки пользователей' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.pagination.page, state.pagination.limit, state.search]);

  useEffect(() => {
    fetchUsers();
  }, [state.pagination.page, state.search, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= state.pagination.pages) {
      dispatch({ type: 'SET_PAGE', value: newPage });
    }
  };

  if (state.loading) {
    return <div className="card"><h2>Загрузка пользователей...</h2></div>;
  }

  if (state.error) {
    return <div className="card"><h2>Ошибка: {state.error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление пользователями</h1>
      
      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Поиск пользователей..."
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
                <th>Email</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{user.is_active ? 'Активен' : 'Неактивен'}</td>
                  <td>
                    <button className="btn btn-primary">Редактировать</button>
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

export default UsersManagement;