import React from 'react';
import '../../style/booking/TimeSlotsSelector.css';

const TimeSlotsSelector = ({ 
  availableSlots = [], 
  selectedSlot, 
  onSlotSelect,
  selectedDate 
}) => {
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

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <div className="time-slots-selector">
        <h3 className="time-slots-title">
          Доступное время на {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
          }) : 'выбранную дату'}
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
        Доступное время на {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long'
        }) : 'выбранную дату'}
      </h3>
      
      <div className="time-slots-grid">
        {availableSlots.map((slot, index) => (
          <button
            key={index}
            className={`time-slot-item ${isSelected(slot) ? 'selected' : ''}`}
            onClick={() => onSlotSelect(slot)}
          >
            <span className="time-range">
              {formatDuration(slot.start_time, slot.end_time)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotsSelector;
