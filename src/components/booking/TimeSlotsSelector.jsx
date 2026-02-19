import React from 'react';
import '../../styles/booking/TimeSlotsSelector.css';

const TimeSlotsSelector = ({
  availableSlots = [],
  selectedSlot,
  onSlotSelect,
  selectedDate
}) => {
  const formatSelectedDate = (dateString) => {
    // Парсим дату как локальную
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = timeString.includes('T')
      ? timeString.split('T')[1].substring(0, 5)
      : timeString;
    return time;
  };

  const formatDuration = (startTime, endTime) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return `${start} - ${end}`;
  };

  const isSelected = (slot) => {
    if (!selectedSlot) return false;
    return selectedSlot.start_time === slot.start_time;
  };

  const isBooked = (slot) => {
    return slot.status === 'booked';
  };

  const isBlocked = (slot) => {
    return slot.status === 'blocked';
  };

  const isAvailable = (slot) => {
    return slot.status === 'free' || slot.status === undefined;
  };

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <div className="time-slots-selector">
        <h3 className="time-slots-title">
          Доступное время на {selectedDate ? formatSelectedDate(selectedDate) : 'выбранную дату'}
        </h3>
        <div className="no-slots">
          <span className="material-symbols-outlined">event_busy</span>
          <p>Нет доступного времени на эту дату</p>
          <p className="hint">Выберите другую дату</p>
        </div>
      </div>
    );
  } 

  return (
    <div className="time-slots-selector">
      <h3 className="time-slots-title">
        Доступное время на {selectedDate ? formatSelectedDate(selectedDate) : 'выбранную дату'}
      </h3>
      
      <div className="time-slots-grid">
        {availableSlots.map((slot, index) => {
          const uniqueKey = slot.id || `${slot.start_time}-${slot.end_time}-${index}`;
          const booked = isBooked(slot);
          const blocked = isBlocked(slot);
          const selected = isSelected(slot);
          
          let slotClass = 'time-slot-item';
          if (booked) slotClass += ' booked';
          else if (blocked) slotClass += ' blocked';
          else if (selected) slotClass += ' selected';
          
          return (
            <button
              key={uniqueKey}
              className={slotClass}
              onClick={() => !booked && !blocked && onSlotSelect(slot)}
              disabled={booked || blocked}
            >
              <span className="time-range">
                {formatDuration(slot.start_time, slot.end_time)}
              </span>
              {booked && <span className="slot-badge">Занято</span>}
              {blocked && <span className="slot-badge">Недоступно</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotsSelector;
