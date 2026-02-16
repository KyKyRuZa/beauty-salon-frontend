import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getDashboardStats } from '../../../api/admin';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card"><h2>Загрузка статистики...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Дашборд администратора</h1>
      <p>Добро пожаловать, {user?.email}!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Всего пользователей</div>
          <div className="value">{stats.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Клиентов</div>
          <div className="value">{stats.totalClients || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Мастеров</div>
          <div className="value">{stats.totalMasters || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Салонов</div>
          <div className="value">{stats.totalSalons || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Категорий услуг</div>
          <div className="value">{stats.totalCategories || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Услуг</div>
          <div className="value">{stats.totalServices || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Заказов сегодня</div>
          <div className="value">{stats.todayBookings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Доход в месяц</div>
          <div className="value">{stats.monthlyRevenue || 0} ₽</div>
        </div>
      </div>

      <div className="card">
        <h2>Недавние активности</h2>
        <p>Здесь будет отображаться информация о недавних событиях в системе</p>
      </div>
    </div>
  );
};

export default Dashboard;