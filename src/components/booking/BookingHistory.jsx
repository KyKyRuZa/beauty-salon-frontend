import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../api/booking';
import '../../styles/booking/BookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter !== 'all') {
        params.status = filter === 'active' ? 'pending,confirmed' : filter;
      }

      const response = await getMyBookings(params);
      setBookings(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
      setError('Не удалось загрузить историю записей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите отменить запись?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      console.error('Ошибка отмены бронирования:', err);
      alert('Не удалось отменить запись');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed'].includes(booking.status);
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  if (loading) {
    return <div className="booking-history-loading">Загрузка записей...</div>;
  }

  if (error) {
    return <div className="booking-history-error">{error}</div>;
  }

  return (
    <div className="booking-history-container">
      <h2 className="section-title">МОИ ЗАПИСИ</h2>

      <div className="booking-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Активные
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Завершённые
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Отменённые
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          {filter === 'all'
            ? 'У вас пока нет записей'
            : `Нет ${filter === 'active' ? 'активных' : filter === 'completed' ? 'завершённых' : 'отменённых'} записей`}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Карточка бронирования
 */
const BookingCard = ({ booking, onCancel }) => {
  const startDate = new Date(booking.start_time);
  const formattedDate = startDate.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusLabels = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  };

  const statusClasses = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    completed: 'status-completed'
  };

  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  // Получаем данные из вложенных объектов
  const serviceName = booking.service?.name || 'Услуга';
  const masterName = booking.master?.first_name 
    ? `${booking.master.first_name} ${booking.master.last_name || ''}`
    : 'Мастер';

  return (
    <div className={`booking-card ${statusClasses[booking.status]}`}>
      <div className="booking-header">
        <div className="service-info">
          <h3 className="service-name">{serviceName}</h3>
          <p className="master-name">
            <span className="material-symbols-outlined icon">person</span>
            {masterName}
          </p>
        </div>
        <div className={`booking-status ${statusClasses[booking.status]}`}>
          {statusLabels[booking.status] || booking.status}
        </div>
      </div>

      <div className="booking-details">
        <div className="detail-item">
          <span className="material-symbols-outlined icon">calendar_today</span>
          <span>{formattedDate}</span>
        </div>
        <div className="detail-item">
          <span className="material-symbols-outlined icon">schedule</span>
          <span>{formattedTime}</span>
        </div>
        {booking.price && (
          <div className="detail-item">
            <span className="material-symbols-outlined icon">attach_money</span>
            <span>{booking.price} ₽</span>
          </div>
        )}
        {booking.comment && (
          <div className="detail-item comment">
            <span className="material-symbols-outlined icon">comment</span>
            <span>{booking.comment}</span>
          </div>
        )}
      </div>

      {canCancel && (
        <div className="booking-actions">
          <button
            className="btn-cancel"
            onClick={() => onCancel(booking.id)}
          >
            Отменить запись
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
