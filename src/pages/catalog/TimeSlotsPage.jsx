import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import DateSelector from '../../components/booking/DateSelector';
import TimeSlotsSelector from '../../components/booking/TimeSlotsSelector';
import { createBooking, getAvailableSlots } from '../../api/booking';
import '../../styles/booking/TimeSlotsPage.css';

const TimeSlotsPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingComment, setBookingComment] = useState('');

  const serviceId = searchParams.get('service');
  const type = searchParams.get('type') || 'master';

  const loadAvailableSlots = useCallback(async (date) => {
    try {
      const dateStr = date;

      const params = {
        master_id: type === 'master' ? parseInt(providerId) : 1,
        date: dateStr
      };

      if (serviceId) {
        params.service_id = parseInt(serviceId);
      }

      console.log('Загрузка слотов для мастера', params.master_id, 'дата:', dateStr, 'услуга:', serviceId);

      const response = await getAvailableSlots(params);

      let slots = response.data || [];
      console.log('Загруженные слоты:', slots);

      if (serviceId) {
        slots = slots.filter(slot =>
          slot.service_id === parseInt(serviceId) || slot.service_id === null
        );
        console.log('Отфильтрованные слоты для услуги', serviceId, ':', slots);
      } else {
        // Если serviceId не указан, показываем все слоты
        console.log('serviceId не указан, показываем все слоты:', slots.length);
      }

      setAvailableSlots(slots);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      // Fallback на моковые данные при ошибке
      const mockSlots = generateMockSlots(date);
      setAvailableSlots(mockSlots);
      setSelectedSlot(null);
    }
  }, [providerId, serviceId, type]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, loadAvailableSlots]);

  const handleDateSelect = (date) => {
    console.log('handleDateSelect: выбрана дата', date, 'type:', typeof date);
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookNow = () => {
    if (!user) {
      alert('Для записи необходимо войти в систему');
      return;
    }
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !providerId) {
      alert('Выберите время');
      return;
    }

    if (!serviceId) {
      alert('Услуга не выбрана');
      return;
    }

    try {
      const bookingData = {
        master_id: type === 'master' ? parseInt(providerId) : 1,
        master_service_id: parseInt(serviceId),
        time_slot_id: selectedSlot.id,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        comment: bookingComment
      };

      await createBooking(bookingData);

      alert('Запись успешно создана!');
      setBookingModalOpen(false);
      navigate('/profile');
    } catch (error) {
      console.error('Ошибка создания записи:', error);
      alert(error.response?.data?.message || 'Ошибка при создании записи');
    }
  };

  return (
    <>
      <Header />
      <div className="time-slots-page">
        <div className="container">
          <div className="time-slots-content">
            <div className="time-slots-header">
              <h1 className="page-title">Запись на услугу</h1>
              <p className="page-subtitle">
                {type === 'master' ? 'Мастер' : 'Салон'} #{providerId}
                {serviceId ? ` • Услуга #${serviceId}` : ''}
              </p>
            </div>

            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              masterId={type === 'master' ? parseInt(providerId) : 1}
              serviceId={serviceId ? parseInt(serviceId) : null}
            />

            {selectedDate && (
              <TimeSlotsSelector
                availableSlots={availableSlots}
                selectedSlot={selectedSlot}
                onSlotSelect={handleSlotSelect}
                selectedDate={selectedDate}
              />
            )}

            {selectedSlot && selectedDate && (
              <div className="booking-summary">
                <h3 className="summary-title">Вы выбрали:</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span>
                      {formatSelectedDate(selectedDate)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>
                      {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-book-now"
                  onClick={handleBookNow}
                >
                  ЗАПИСАТЬСЯ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {bookingModalOpen && (
        <div className="modal-overlay" onClick={() => setBookingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBookingModalOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="modal-title">Подтверждение записи</h2>

            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Дата:</span>
                <span className="detail-value">
                  {selectedDate ? formatSelectedDate(selectedDate) : '-'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Время:</span>
                <span className="detail-value">
                  {selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : '-'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Комментарий (необязательно)</label>
              <textarea
                id="comment"
                value={bookingComment}
                onChange={(e) => setBookingComment(e.target.value)}
                placeholder="Ваши пожелания..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setBookingModalOpen(false)}>
                Отмена
              </button>
              <button className="btn-confirm" onClick={handleConfirmBooking}>
                Подтвердить запись
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const time = timeString.includes('T')
    ? timeString.split('T')[1].substring(0, 5)
    : timeString;
  return time;
};

const formatSelectedDate = (dateString) => {
  // Парсим дату как локальную
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const generateMockSlots = () => {
  const slots = [];
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      start_time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
      available: true
    });
  }

  return slots;
};

export default TimeSlotsPage;