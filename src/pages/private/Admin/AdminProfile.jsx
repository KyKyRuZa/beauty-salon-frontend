import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentAdmin, updateCurrentAdmin } from '../../../api/admin';
import '../../../style/AdminProfile.css';

const AdminProfile = () => {
  const { user, profile } = useAuth();
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const fetchAdminInfo = async () => {
    try {
      setLoading(true);
      // Получаем информацию о текущем администраторе
      const response = await getCurrentAdmin();
      
      if (response.data.success && response.data.data) {
        const currentAdmin = response.data.data;
        setAdminInfo(currentAdmin);
        setEditData({
          first_name: currentAdmin.first_name || '',
          last_name: currentAdmin.last_name || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки информации администратора:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      // При открытии редактирования, устанавливаем текущие значения
      setEditData({
        first_name: adminInfo?.first_name || '',
        last_name: adminInfo?.last_name || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Обновляем информацию об администраторе
      const response = await updateCurrentAdmin({
        first_name: editData.first_name,
        last_name: editData.last_name
      });
      
      // Обновляем локальное состояние
      if (response.data.success && response.data.data) {
        setAdminInfo(response.data.data);
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Ошибка сохранения информации администратора:', error);
    }
  };

  if (loading) {
    return <div className="admin-profile-card"><h2>Загрузка профиля администратора...</h2></div>;
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-card">
        <div className="admin-profile-header">
          <h2>Профиль Администратора</h2>
          <div className="admin-profile-actions">
            <button className="btn btn-secondary" onClick={handleEditToggle}>
              {editing ? 'Отмена' : 'Редактировать'}
            </button>
          </div>
        </div>

        <div className="admin-profile-info">
          <div className="profile-field">
            <label>ID Администратора:</label>
            <span>{adminInfo?.id || 'N/A'}</span>
          </div>

          <div className="profile-field">
            <label>Роль:</label>
            <span>{adminInfo?.role || 'N/A'}</span>
          </div>

          {editing ? (
            <>
              <div className="profile-field">
                <label htmlFor="first_name">Имя:</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={editData.first_name}
                  onChange={handleInputChange}
                  placeholder="Введите имя"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="last_name">Фамилия:</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={editData.last_name}
                  onChange={handleInputChange}
                  placeholder="Введите фамилию"
                />
              </div>
            </>
          ) : (
            <>
              <div className="profile-field">
                <label>Имя:</label>
                <span>{adminInfo?.first_name || 'Не указано'}</span>
              </div>

              <div className="profile-field">
                <label>Фамилия:</label>
                <span>{adminInfo?.last_name || 'Не указано'}</span>
              </div>
            </>
          )}

          <div className="profile-field">
            <label>Email:</label>
            <span>{user?.email || profile?.email || 'N/A'}</span>
          </div>

          <div className="profile-field">
            <label>Дата создания:</label>
            <span>{adminInfo?.created_at ? new Date(adminInfo.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>

          <div className="profile-field">
            <label>Статус:</label>
            <span>{adminInfo?.is_active ? 'Активен' : 'Неактивен'}</span>
          </div>
        </div>

        {editing && (
          <div className="admin-profile-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;