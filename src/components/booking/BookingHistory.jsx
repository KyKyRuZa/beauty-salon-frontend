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
        params.status = filter === 'active' ? 'confirmed' : filter;
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
    if (filter === 'active') return booking.status === 'confirmed';
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

const BookingCard = ({ booking, onCancel }) => {
  // Парсим дату как локальную (не UTC), чтобы избежать сдвига часового пояса
  // start_time приходит в формате "2026-02-18T10:00:00.000Z" или "2026-02-18 10:00:00"
  const startTimeString = booking.start_time;
  const endTimeString = booking.end_time;
  
  // Извлекаем время из строки напрямую, чтобы избежать конвертации UTC
  const formatTimeFromIso = (isoString) => {
    if (!isoString) return '';
    // Если формат ISO с T и Z, извлекаем время из строки
    if (isoString.includes('T')) {
      const timePart = isoString.split('T')[1];
      return timePart.substring(0, 5); // HH:MM
    }
    // Если формат "YYYY-MM-DD HH:MM:SS", извлекаем время после пробела
    if (isoString.includes(' ')) {
      const timePart = isoString.split(' ')[1];
      return timePart.substring(0, 5); // HH:MM
    }
    return isoString;
  };
  
  const formattedTime = formatTimeFromIso(startTimeString);
  const formattedEndTime = formatTimeFromIso(endTimeString);
  
  // Для даты используем только дату без времени, чтобы избежать сдвига
  const formatDateFromIso = (isoString) => {
    if (!isoString) return '';
    const datePart = isoString.split('T')[0] || isoString.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formattedDate = formatDateFromIso(startTimeString);

  const statusLabels = {
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  };

  const statusClasses = {
    confirmed: 'status-confirmed',
    cancelled: 'status-cancelled',
    completed: 'status-completed'
  };

  const canCancel = ['confirmed'].includes(booking.status);

  const serviceName = booking.service?.name
    || booking.service?.title
    || booking.master_service?.name
    || 'Услуга';

  // Пытаемся получить имя мастера из разных источников
  // 1. Из booking.master (прямая ассоциация)
  // 2. Из booking.service.master_provider (через услугу)
  const master = booking.master || booking.service?.master_provider;
  
  const masterFirstName = master?.first_name || master?.firstName;
  const masterLastName = master?.last_name || master?.lastName;
  
  const masterName = masterFirstName
    ? `${masterFirstName} ${masterLastName || ''}`.trim()
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
          <span>{formattedTime} - {formattedEndTime}</span>
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
