import React, { useReducer, useCallback, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSlotsSelector from './TimeSlotsSelector';
import { getMasterSlots } from '../../api/timeslots';
import { createBooking } from '../../api/booking';
import { useToast } from '../../context/ToastContext';
import { logger } from '../../utils/logger';
import '../../styles/booking/BookingModal.css';

const initialState = {
  selectedDate: null,
  selectedSlot: null,
  availableSlots: [],
  loadingSlots: false
};

function bookingModalReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.value, selectedSlot: null };
    case 'SET_SELECTED_SLOT':
      return { ...state, selectedSlot: action.value };
    case 'SET_AVAILABLE_SLOTS':
      return { ...state, availableSlots: action.value };
    case 'SET_LOADING_SLOTS':
      return { ...state, loadingSlots: action.value };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const BookingModal = ({ isOpen, onClose, providerId, serviceId, serviceTitle }) => {
  const toast = useToast();
  const [state, dispatch] = useReducer(bookingModalReducer, initialState);

  const loadTimeSlots = useCallback(async () => {
    if (!state.selectedDate || !providerId) return;

    try {
      dispatch({ type: 'SET_LOADING_SLOTS', value: true });
      const params = {
        master_id: providerId,
        date: state.selectedDate
      };

      if (serviceId) {
        params.service_id = serviceId;
      }

      const response = await getMasterSlots(params);
      logger.debug('Полученные слоты:', response);

      let slots = [];
      if (response.success && Array.isArray(response.data)) {
        slots = response.data;
      } else if (Array.isArray(response)) {
        slots = response;
      }

      if (serviceId && slots.length > 0) {
        slots = slots.filter(slot => slot.service_id === serviceId || slot.service_id === null);
      }

      logger.debug('Отфильтрованные слоты:', slots);
      dispatch({ type: 'SET_AVAILABLE_SLOTS', value: slots });
    } catch (error) {
      logger.error('Ошибка загрузки временных слотов:', error);
      dispatch({ type: 'SET_AVAILABLE_SLOTS', value: [] });
    } finally {
      dispatch({ type: 'SET_LOADING_SLOTS', value: false });
    }
  }, [providerId, state.selectedDate, serviceId]);

  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET' });
    }
  }, [isOpen]);

  // Загружаем слоты при изменении даты, providerId или serviceId
  useEffect(() => {
    if (state.selectedDate && providerId && !state.loadingSlots) {
      loadTimeSlots();
    }
  }, [state.selectedDate, providerId, serviceId]);

  const handleDateSelect = (date) => {
    dispatch({ type: 'SET_SELECTED_DATE', value: date });
  };

  const handleSlotSelect = (slot) => {
    dispatch({ type: 'SET_SELECTED_SLOT', value: slot });
  };

  const handleConfirmBooking = async () => {
    if (!state.selectedDate || !state.selectedSlot) {
      toast.error('Пожалуйста, выберите дату и время');
      return;
    }

    try {
      const bookingData = {
        master_id: providerId,
        master_service_id: serviceId,
        start_time: state.selectedSlot.start_time,
        end_time: state.selectedSlot.end_time,
        time_slot_id: state.selectedSlot.id,
        comment: ''
      };

      logger.debug('Создание бронирования:', bookingData);

      const response = await createBooking(bookingData);

      if (response.success) {
        toast.success(`Запись успешно создана! ${state.selectedDate} ${state.selectedSlot.start_time.split('T')[1]?.substring(0, 5)}`);
        onClose();
      } else {
        toast.error(`Ошибка: ${response.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      logger.error('Ошибка создания бронирования:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Произошла ошибка при создании записи';
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" role="presentation" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="booking-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
        <button className="booking-modal-close" onClick={onClose} onKeyDown={(e) => e.key === 'Enter' && onClose()}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="booking-modal-header">
          <h2>Запись на услугу</h2>
          {serviceTitle && <p className="service-title">{serviceTitle}</p>}
        </div>

        <div className="booking-modal-body">
          <DateSelector
            masterId={providerId}
            serviceId={serviceId}
            selectedDate={state.selectedDate}
            onDateSelect={handleDateSelect}
          />

          {state.loadingSlots ? (
            <div className="slots-loading">Загрузка доступного времени...</div>
          ) : (
            <TimeSlotsSelector
              key={state.selectedDate || 'no-date'}
              availableSlots={state.availableSlots}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              onSlotSelect={handleSlotSelect}
            />
          )}
        </div>

        <div className="booking-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn-confirm"
            onClick={handleConfirmBooking}
            disabled={!state.selectedDate || !state.selectedSlot}
          >
            Подтвердить запись
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
