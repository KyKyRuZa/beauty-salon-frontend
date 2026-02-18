import React, { useState, useEffect } from 'react';
import '../../../styles/admin/OrdersManagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Заглушка данных с корректным временем
      setOrders([
        {
          id: 1,
          user_email: 'user@example.com',
          total_amount: 3000,
          status: 'confirmed',
          created_at: new Date('2026-02-18T10:00:00'),
          booking_time: { start: '10:00', end: '11:00' },
          items: [
            { service_name: 'Покрытие гель-лаком', quantity: 1, price: 1500 },
            { service_name: 'Дизайн ногтей', quantity: 1, price: 1500 }
          ]
        },
        {
          id: 2,
          user_email: 'another@example.com',
          total_amount: 2000,
          status: 'confirmed',
          created_at: new Date('2026-02-18T14:00:00'),
          booking_time: { start: '14:00', end: '15:30' },
          items: [
            { service_name: 'Обрезной маникюр', quantity: 1, price: 2000 }
          ]
        },
        {
          id: 3,
          user_email: 'client3@example.com',
          total_amount: 4500,
          status: 'completed',
          created_at: new Date('2026-02-17T12:00:00'),
          booking_time: { start: '12:00', end: '13:30' },
          items: [
            { service_name: 'Педикюр', quantity: 1, price: 3000 },
            { service_name: 'Парафинотерапия', quantity: 1, price: 1500 }
          ]
        },
        {
          id: 4,
          user_email: 'client4@example.com',
          total_amount: 2500,
          status: 'cancelled',
          created_at: new Date('2026-02-16T16:00:00'),
          booking_time: { start: '16:00', end: '17:00' },
          items: [
            { service_name: 'Наращивание ногтей', quantity: 1, price: 2500 }
          ]
        }
      ]);
      setPagination({ page: 1, limit: 10, total: 4, pages: 1 });
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено',
      pending: 'Ожидает'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      pending: 'status-pending'
    };
    return classes[status] || '';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTimeRange = (bookingTime) => {
    if (!bookingTime) return '-';
    return `${bookingTime.start} - ${bookingTime.end}`;
  };

  if (loading) {
    return <div className="orders-loading">Загрузка заказов...</div>;
  }

  if (error) {
    return <div className="orders-error">{error}</div>;
  }

  return (
    <div className="orders-management">
      <h1 className="page-title">Управление заказами</h1>

      <div className="orders-card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Поиск заказов (по email пользователя)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-search">
            <span className="material-symbols-outlined">search</span>
            Поиск
          </button>
        </form>
      </div>

      <div className="orders-card">
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Дата и время</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className={showDetails === order.id ? 'expanded' : ''}>
                  <td className="order-id">#{order.id}</td>
                  <td className="order-email">{order.user_email}</td>
                  <td className="order-datetime">
                    <div className="datetime-row">
                      <span className="material-symbols-outlined icon">calendar_today</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div className="datetime-row">
                      <span className="material-symbols-outlined icon">schedule</span>
                      <span className="time-range">{formatTimeRange(order.booking_time)}</span>
                    </div>
                  </td>
                  <td className="order-amount">{order.total_amount.toLocaleString('ru-RU')} ₽</td>
                  <td className="order-status">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="order-actions">
                    <button
                      className="btn-details"
                      onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                    >
                      <span className="material-symbols-outlined">
                        {showDetails === order.id ? 'expand_less' : 'expand_more'}
                      </span>
                      {showDetails === order.id ? 'Скрыть' : 'Детали'}
                    </button>
                    <button className="btn-edit">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="btn-delete">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="order-details-panel">
            <div className="details-header">
              <h3>Детали заказа #{showDetails}</h3>
              <button className="btn-close" onClick={() => setShowDetails(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Количество</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {orders.find(o => o.id === showDetails)?.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.service_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString('ru-RU')} ₽</td>
                    <td className="item-total">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">Итого:</td>
                  <td className="total-amount">
                    {orders.find(o => o.id === showDetails)?.total_amount.toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-page"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Назад
          </button>
          <span className="page-info">
            Страница {pagination.page} из {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn-page"
          >
            Вперед
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
