import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookingModal from '../../components/catalog/BookingModal';
import Header from '../../components/UI/Header';
import Footer from '../../components/UI/Footer';
import '../../style/catalog/TimeSlotsPage.css';

const TimeSlotsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('id');
  const providerType = searchParams.get('type'); // 'master' или 'salon'
  
  const [providerInfo, setProviderInfo] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTimeSlots();
  }, [providerId, providerType]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);

      // Здесь нужно будет получить информацию о провайдере
      // и доступные слоты времени из вариантов услуг
      
      // В реальной реализации нужно будет получить информацию о провайдере
      // и его варианты услуг, содержащие временные интервалы
      const mockProviderInfo = {
        name: 'Иванова Анна Петровна',
        specialization: 'Мастер маникюра',
        type: 'master'
      };

      setProviderInfo(mockProviderInfo);

      // Временная реализация - в реальности нужно будет получать 
      // информацию о вариантах услуг провайдера, содержащих временные интервалы
      // и использовать их для формирования доступных слотов
      
      // Пример получения вариантов услуг (в реальной реализации):
      // const response = await getProviderServiceVariations(providerId, providerType);
      // const serviceVariations = response.data.data;
      
      // Для демонстрации используем mock-данные с реальными временными интервалами
      const mockServiceVariations = [
        {
          id: 1,
          name: 'Маникюр комбинированный',
          time_slot_start: '10:00:00',
          time_slot_end: '11:00:00',
          date: '2026-02-12',
          is_available: true
        },
        {
          id: 2,
          name: 'Маникюр комбинированный',
          time_slot_start: '11:30:00',
          time_slot_end: '12:30:00',
          date: '2026-02-12',
          is_available: true
        },
        {
          id: 3,
          name: 'Маникюр комбинированный',
          time_slot_start: '14:00:00',
          time_slot_end: '15:00:00',
          date: '2026-02-12',
          is_available: false
        },
        {
          id: 4,
          name: 'Маникюр комбинированный',
          time_slot_start: '15:30:00',
          time_slot_end: '16:30:00',
          date: '2026-02-12',
          is_available: true
        }
      ];

      // Преобразуем варианты услуг в формат слотов времени
      const slots = mockServiceVariations.map(variation => ({
        id: `${variation.date}_${variation.time_slot_start}`,
        date: variation.date,
        time: `${variation.time_slot_start.substring(0, 5)} - ${variation.time_slot_end.substring(0, 5)}`,
        available: variation.is_available,
        serviceVariationId: variation.id,
        serviceName: variation.name
      }));

      setTimeSlots(slots);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки доступных слотов времени');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedDate(slot.date);
      setSelectedTime(slot.time);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время');
      return;
    }
    
    // Открыть модальное окно подтверждения
    setIsModalOpen(true);
  };
  
  const handleModalConfirm = () => {
    // Найти выбранный слот времени для получения ID варианта услуги
    const selectedSlot = timeSlots.find(slot => 
      slot.date === selectedDate && 
      slot.time === selectedTime && 
      slot.available
    );

    // Здесь будет логика отправки бронирования
    console.log('Бронирование подтверждено', {
      providerId,
      providerType,
      date: selectedDate,
      time: selectedTime,
      serviceVariationId: selectedSlot?.serviceVariationId
    });

    // Закрыть модальное окно
    setIsModalOpen(false);

    // Переход к подтверждению бронирования
    navigate(`/booking?provider=${providerId}&type=${providerType}&date=${selectedDate}&time=${selectedTime}&variationId=${selectedSlot?.serviceVariationId}`);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBackToProviders = () => {
    navigate(-1); // Возврат к предыдущей странице
  };

  if (loading) {
    return <div className="loading">Загрузка доступных слотов времени...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Группировка слотов по датам
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();

  return (
    <>
      <Header />
      <div className="time-slots-page">
        <div className="time-slots-header">
          <button className="back-button" onClick={handleBackToProviders}>
            ← Назад к провайдерам
          </button>
          <h1>Выберите время для {providerInfo?.name}</h1>
          <p>{providerInfo?.specialization}</p>
        </div>

        <div className="time-slots-content">
          <div className="date-selector">
            <h3>Выберите дату</h3>
            <div className="dates-grid">
              {dates.map(date => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
                const dayNumber = dateObj.toLocaleDateString('ru-RU', { day: 'numeric' });
                const monthName = dateObj.toLocaleDateString('ru-RU', { month: 'short' });
                
                return (
                  <button
                    key={date}
                    className={`date-option ${selectedDate === date ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="day-name">{dayName}</div>
                    <div className="day-number">{dayNumber}</div>
                    <div className="month-name">{monthName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="time-slots-selector">
              <h3>Доступное время</h3>
              <div className="time-slots-grid">
                {groupedSlots[selectedDate]?.map(slot => (
                  <button
                    key={slot.id}
                    className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${selectedTime === slot.time ? 'selected' : ''}`}
                    onClick={() => handleTimeSlotSelect(slot)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                    {!slot.available && <span className="unavailable-label">Занято</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="confirm-section">
            <div className="selected-time-summary">
              <h3>Ваш выбор</h3>
              {selectedDate && selectedTime ? (
                <p>{selectedDate} в {selectedTime}</p>
              ) : (
                <p>Дата и время не выбраны</p>
              )}
            </div>
            <button 
              className="confirm-booking-btn"
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime}
            >
              Подтвердить запись
            </button>
          </div>
        </div>
      </div>
      
      <BookingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        bookingDetails={{
          providerName: providerInfo?.name,
          serviceName: (() => {
            // Найти информацию о выбранной услуге из списка слотов
            const selectedSlot = timeSlots.find(slot => 
              slot.date === selectedDate && 
              slot.time === selectedTime && 
              slot.available
            );
            return selectedSlot?.serviceName || 'Выбранная услуга';
          })(),
          date: selectedDate,
          time: selectedTime,
          price: (() => {
            // В реальной реализации цена должна быть получена из варианта услуги
            // Здесь временно возвращаем фиксированное значение
            return 2500;
          })()
        }}
        onConfirm={handleModalConfirm}
      />
      
      <Footer />
    </>
  );
};

export default TimeSlotsPage;