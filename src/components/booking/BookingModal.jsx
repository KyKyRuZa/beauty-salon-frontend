import React, { useState, useCallback, useEffect } from 'react';
import DateSelector from './DateSelector';
import TimeSlotsSelector from './TimeSlotsSelector';
import { getMasterSlots } from '../../api/timeslots';
import { createBooking } from '../../api/booking';
import '../../styles/booking/BookingModal.css';

const BookingModal = ({ isOpen, onClose, providerId, serviceId, serviceTitle }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadTimeSlots = useCallback(async () => {
    if (!selectedDate || !providerId) return;
    
    try {
      setLoadingSlots(true);
      const response = await getMasterSlots({
        master_id: providerId,
        date: selectedDate
      });
      console.log('Полученные слоты:', response);

      let slots = [];
      if (response.success && Array.isArray(response.data)) {
        slots = response.data;
      } else if (Array.isArray(response)) {
        slots = response;
      }

      // Фильтруем слоты по выбранной услуге (если serviceId передан)
      if (serviceId && slots.length > 0) {
        slots = slots.filter(slot => slot.service_id === serviceId);
      }

      console.log('Отфильтрованные слоты:', slots);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Ошибка загрузки временных слотов:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [providerId, selectedDate, serviceId]);

  // Сбрасываем состояние при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
  }, [isOpen]);

  // Загружаем слоты при выборе даты
  useEffect(() => {
    if (selectedDate && providerId) {
      loadTimeSlots();
    }
  }, [selectedDate, providerId, loadTimeSlots]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Сбрасываем выбранный слот при смене даты
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      alert('Пожалуйста, выберите дату и время');
      return;
    }

    try {
      // Формируем данные для бронирования
      const bookingData = {
        master_id: providerId,
        master_service_id: serviceId,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        time_slot_id: selectedSlot.id,
        comment: '' // Можно добавить поле для комментария
      };

      console.log('Создание бронирования:', bookingData);

      const response = await createBooking(bookingData);

      if (response.success) {
        alert(`✅ Запись успешно создана!\n\nДата: ${selectedDate}\nВремя: ${selectedSlot.start_time.split('T')[1]?.substring(0, 5)} - ${selectedSlot.end_time.split('T')[1]?.substring(0, 5)}\nУслуга: ${serviceTitle}`);
        onClose();
      } else {
        alert(`Ошибка при создании записи: ${response.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Произошла ошибка при создании записи';
      alert(`❌ ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="booking-modal-header">
          <h2>Запись на услугу</h2>
          {serviceTitle && <p className="service-title">{serviceTitle}</p>}
        </div>

        <div className="booking-modal-body">
          {/* Шаг 1: Выбор даты */}
          <DateSelector
            masterId={providerId}
            serviceId={serviceId}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          {/* Шаг 2: Выбор времени */}
          {loadingSlots ? (
            <div className="slots-loading">Загрузка доступного времени...</div>
          ) : (
            <TimeSlotsSelector
              availableSlots={availableSlots}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
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
            disabled={!selectedDate || !selectedSlot}
          >
            Подтвердить запись
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
