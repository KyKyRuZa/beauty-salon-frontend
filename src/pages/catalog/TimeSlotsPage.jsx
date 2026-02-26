import React, { useReducer, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import DateSelector from '../../components/booking/DateSelector';
import TimeSlotsSelector from '../../components/booking/TimeSlotsSelector';
import { createBooking, getAvailableSlots } from '../../api/booking';
import '../../styles/booking/TimeSlotsPage.css';

const initialState = {
  selectedDate: null,
  selectedSlot: null,
  availableSlots: [],
  bookingModalOpen: false,
  bookingComment: ''
};

function timeSlotsReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.value };
    case 'SET_SELECTED_SLOT':
      return { ...state, selectedSlot: action.value };
    case 'SET_AVAILABLE_SLOTS':
      return { ...state, availableSlots: action.value, selectedSlot: null };
    case 'SET_BOOKING_MODAL':
      return { ...state, bookingModalOpen: action.value };
    case 'SET_BOOKING_COMMENT':
      return { ...state, bookingComment: action.value };
    case 'RESET_BOOKING':
      return { ...state, bookingModalOpen: false, bookingComment: '' };
    default:
      return state;
  }
}

const TimeSlotsPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(timeSlotsReducer, initialState);

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
        console.log('serviceId не указан, показываем все слоты:', slots.length);
      }

      dispatch({ type: 'SET_AVAILABLE_SLOTS', value: slots });
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      const mockSlots = generateMockSlots(date);
      dispatch({ type: 'SET_AVAILABLE_SLOTS', value: mockSlots });
    }
  }, [providerId, serviceId, type]);

  useEffect(() => {
    if (state.selectedDate) {
      loadAvailableSlots(state.selectedDate);
    }
  }, [state.selectedDate, loadAvailableSlots]);

  const handleDateSelect = (date) => {
    console.log('handleDateSelect: выбрана дата', date, 'type:', typeof date);
    dispatch({ type: 'SET_SELECTED_DATE', value: date });
  };

  const handleSlotSelect = (slot) => {
    dispatch({ type: 'SET_SELECTED_SLOT', value: slot });
  };

  const handleBookNow = () => {
    if (!user) {
      alert('Для записи необходимо войти в систему');
      return;
    }
    dispatch({ type: 'SET_BOOKING_MODAL', value: true });
  };

  const handleConfirmBooking = async () => {
    if (!state.selectedSlot || !providerId) {
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
        time_slot_id: state.selectedSlot.id,
        start_time: state.selectedSlot.start_time,
        end_time: state.selectedSlot.end_time,
        comment: state.bookingComment
      };

      await createBooking(bookingData);

      alert('Запись успешно создана!');
      dispatch({ type: 'RESET_BOOKING' });
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
              selectedDate={state.selectedDate}
              onDateSelect={handleDateSelect}
              masterId={type === 'master' ? parseInt(providerId) : 1}
              serviceId={serviceId ? parseInt(serviceId) : null}
            />

            {state.selectedDate && (
              <TimeSlotsSelector
                availableSlots={state.availableSlots}
                selectedSlot={state.selectedSlot}
                onSlotSelect={handleSlotSelect}
                selectedDate={state.selectedDate}
              />
            )}

            {state.selectedSlot && state.selectedDate && (
              <div className="booking-summary">
                <h3 className="summary-title">Вы выбрали:</h3>
                <div className="summary-details">
                  <div className="summary-item">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span>
                      {formatSelectedDate(state.selectedDate)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>
                      {formatTime(state.selectedSlot.start_time)} - {formatTime(state.selectedSlot.end_time)}
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

      {state.bookingModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
          onKeyDown={(e) => e.key === 'Escape' && dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
          tabIndex={-1}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
            tabIndex={0}
          >
            <button
              className="modal-close"
              onClick={() => dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
              onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'SET_BOOKING_MODAL', value: false })}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="modal-title">Подтверждение записи</h2>

            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Дата:</span>
                <span className="detail-value">
                  {state.selectedDate ? formatSelectedDate(state.selectedDate) : '-'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Время:</span>
                <span className="detail-value">
                  {state.selectedSlot ? `${formatTime(state.selectedSlot.start_time)} - ${formatTime(state.selectedSlot.end_time)}` : '-'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Комментарий (необязательно)</label>
              <textarea
                id="comment"
                value={state.bookingComment}
                onChange={(e) => dispatch({ type: 'SET_BOOKING_COMMENT', value: e.target.value })}
                placeholder="Ваши пожелания..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => dispatch({ type: 'SET_BOOKING_MODAL', value: false })}>
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