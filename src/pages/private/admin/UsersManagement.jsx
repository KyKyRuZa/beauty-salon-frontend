import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../../../api/admin';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search
      });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return <div className="card"><h2>Загрузка пользователей...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление пользователями</h1>
      
      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Поиск пользователей..."
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
              {users.map(user => (
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

export default UsersManagement;