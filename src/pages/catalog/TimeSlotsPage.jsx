import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/UI/Header';
import Footer from '../../components/UI/Footer';
import DateSelector from '../../components/booking/DateSelector';
import TimeSlotsSelector from '../../components/booking/TimeSlotsSelector';
import { createBooking, getAvailableSlots } from '../../api/booking';
import '../../style/booking/TimeSlotsPage.css';

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

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date) => {
    try {
      // Форматируем дату в YYYY-MM-DD
      const dateStr = new Date(date + 'T00:00:00').toISOString().split('T')[0];
      
      const params = {
        master_id: type === 'master' ? parseInt(providerId) : 1,
        date: dateStr
      };
      
      if (serviceId) {
        params.service_id = parseInt(serviceId);
      }

      const response = await getAvailableSlots(params);
      setAvailableSlots(response.data || []);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      // Fallback на моковые данные при ошибке
      const mockSlots = generateMockSlots(date);
      setAvailableSlots(mockSlots);
      setSelectedSlot(null);
    }
  };

  const handleDateSelect = (date) => {
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

    try {
      const bookingData = {
        master_id: type === 'master' ? parseInt(providerId) : 1,
        master_service_id: serviceId ? parseInt(serviceId) : 1,
        start_time: new Date(`${selectedDate}T${selectedSlot.start_time}`).toISOString(),
        end_time: new Date(`${selectedDate}T${selectedSlot.end_time}`).toISOString(),
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
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
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
                  {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '-'}
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