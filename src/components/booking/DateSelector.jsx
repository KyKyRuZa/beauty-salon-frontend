import React from 'react';
import '../../style/booking/DateSelector.css';

const DateSelector = ({ availableDates = [], selectedDate, onDateSelect }) => {
  // Если нет доступных дат, генерируем следующие 7 дней
  const dates = availableDates.length > 0 
    ? availableDates 
    : generateNextDays(7);

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';

    return date.toLocaleDateString('ru-RU', { weekday: 'long' });
  };

  const isSelected = (dateString) => {
    return selectedDate === dateString;
  };

  return (
    <div className="date-selector">
      <h3 className="date-selector-title">Выберите дату</h3>
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
    const dateString = date.toISOString().split('T')[0];
    result.push(dateString);
  }

  return result;
};

export default DateSelector;
