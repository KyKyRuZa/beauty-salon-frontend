import React, { useState, useEffect } from 'react';
import { getAvailableDates } from '../../api/timeslots';
import '../../styles/booking/DateSelector.css';

const DateSelector = ({ availableDates = [], selectedDate, onDateSelect, masterId, serviceId }) => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем доступные даты с сервера если передан masterId
  useEffect(() => {
    if (masterId) {
      loadAvailableDates();
    } else if (availableDates.length > 0) {
      setDates(availableDates);
    } else {
      // Fallback: генерируем следующие 7 дней
      setDates(generateNextDays(7));
    }
  }, [masterId, serviceId]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      const response = await getAvailableDates(masterId, serviceId);
      if (response.success && response.data) {
        // Извлекаем только даты из ответа
        const dateStrings = response.data.map(item => item.date);
        setDates(dateStrings);
      } else {
        setDates(generateNextDays(7));
      }
    } catch (error) {
      console.error('Ошибка загрузки доступных дат:', error);
      setDates(generateNextDays(7));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // Парсим дату как локальную, а не UTC
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDayName = (dateString) => {
    // Парсим дату как локальную
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Сравниваем по компонентам даты
    const isSameDay = (d1, d2) => 
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) return 'Сегодня';
    if (isSameDay(date, tomorrow)) return 'Завтра';

    return date.toLocaleDateString('ru-RU', { weekday: 'long' });
  };

  const isSelected = (dateString) => {
    return selectedDate === dateString;
  };

  return (
    <div className="date-selector">
      <h3 className="date-selector-title">Выберите дату</h3>
      {loading ? (
        <div className="dates-loading">Загрузка дат...</div>
      ) : (
        <div className="dates-grid">
          {dates.map((item) => {
            const dateString = typeof item === 'string' ? item : item.date;
            const isAvailable = item.available !== false;

            return (
              <button
                key={dateString}
                className={`date-item ${isSelected(dateString) ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => isAvailable && onDateSelect(dateString)}
                disabled={!isAvailable}
              >
                <span className="date-day-name">{getDayName(dateString)}</span>
                <span className="date-full">{formatDate(dateString)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Генерация следующих N дней
const generateNextDays = (days) => {
  const result = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    // Используем локальную дату вместо toISOString() чтобы избежать проблем с часовым поясом
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    result.push(dateString);
  }

  return result;
};

export default DateSelector;
