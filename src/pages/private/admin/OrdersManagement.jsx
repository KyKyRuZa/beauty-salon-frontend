import React, { useState, useEffect } from 'react';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [showDetails, setShowDetails] = useState(null);

  // Загружаем заказы
  useEffect(() => {
    fetchOrders();
  }, [pagination.page, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Временно используем заглушку, так как API для заказов может быть не готов
      
      // Заглушка данных
      setOrders([
        { 
          id: 1, 
          user_email: 'user@example.com', 
          total_amount: 3000, 
          status: 'completed', 
          created_at: new Date(), 
          items: [
            { service_name: 'Покрытие гель-лаком', quantity: 1, price: 1500 },
            { service_name: 'Дизайн ногтей', quantity: 1, price: 1500 }
          ] 
        },
        { 
          id: 2, 
          user_email: 'another@example.com', 
          total_amount: 2000, 
          status: 'pending', 
          created_at: new Date(), 
          items: [
            { service_name: 'Обрезной маникюр', quantity: 1, price: 2000 }
          ] 
        }
      ]);
      setPagination({ page: 1, limit: 10, total: 2, pages: 1 });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#2ecc71';
      case 'pending':
        return '#f39c12';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  if (loading) {
    return <div className="card"><h2>Загрузка заказов...</h2></div>;
  }

  if (error) {
    return <div className="card"><h2>Ошибка: {error}</h2></div>;
  }

  return (
    <div>
      <h1>Управление заказами</h1>

      <div className="card">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Поиск заказов (по email пользователя)..."
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
                <th>Пользователь</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user_email}</td>
                  <td>{order.total_amount} ₽</td>
                  <td>
                    <span
                      style={{
                        color: getStatusColor(order.status),
                        fontWeight: 'bold'
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                    >
                      {showDetails === order.id ? 'Скрыть' : 'Детали'}
                    </button>
                    <button className="btn btn-warning">Изменить</button>
                    <button className="btn btn-danger">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Детали заказа #{showDetails}</h3>
            <table>
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
                    <td>{item.price} ₽</td>
                    <td>{item.price * item.quantity} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

export default OrdersManagement;