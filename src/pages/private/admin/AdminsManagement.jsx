import React, { useState, useEffect } from 'react';
import { getAllAdmins, createAdmin } from '../../../api/admin';

const AdminsManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    role: 'admin',
    permissions: {},
    first_name: '',
    last_name: ''
  });

  // Загружаем администраторов и пользователей
  useEffect(() => {
    fetchAdmins();
    // Здесь в реальности нужно будет получить список пользователей для выбора
    // fetchUsers();
  }, [pagination.page, search]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins({
        page: pagination.page,
        limit: pagination.limit,
        search: search
      });
      setAdmins(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки администраторов:', err);
      setError('Ошибка загрузки администраторов');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // В реальности здесь будет вызов API для получения списка пользователей
      // const response = await getAllUsers({ limit: 100 });
      // setUsers(response.data.data);
      
      // Заглушка данных
      setUsers([
        { id: 1, email: 'admin@example.com', first_name: 'Админ', last_name: 'Главный' },
        { id: 2, email: 'moderator@example.com', first_name: 'Модератор', last_name: 'Проверяющий' }
      ]);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmins();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(formData);
      resetForm();
      fetchAdmins();
    } catch (err) {
      setError('Ошибка создания администратора');
      console.error('Ошибка создания администратора:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      role: 'admin',
      permissions: {},
      first_name: '',
      last_name: ''
    });
    setShowForm(false);
  };

  if (loading) {
    return <div className="card"><h2>Загрузка администраторов...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление администраторами</h1>
      
      <div className="card">
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Назначить администратора
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Назначить нового администратора</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user_id">Пользователь *</label>
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите пользователя</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.first_name} {user.last_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="role">Роль *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
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
                value={formData.first_name}
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
                value={formData.last_name}
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
                <th>Email пользователя</th>
                <th>Имя и Фамилия</th>
                <th>Роль</th>
                <th>Дата назначения</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
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

export default AdminsManagement;