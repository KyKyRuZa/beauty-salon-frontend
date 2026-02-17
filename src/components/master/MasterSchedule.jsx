import React, { useState, useEffect, useCallback } from 'react';
import {
  getMasterSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  createSchedule,
  setAvailability,
  getAvailabilityWithSlots,
  updateAvailability,
  deleteAvailability
} from '../../api/timeslots';
import '../../style/master/MasterSchedule.css';

const MasterSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [availability, setAvailability] = useState(null); // Расписание на дату
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Состояние для модального окна создания/редактирования
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    start_time: '09:00',
    end_time: '10:00'
  });

  // Состояние для пакетного создания расписания
  const [scheduleForm, setScheduleForm] = useState({
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 60
  });

  // Загрузка слотов при изменении даты
  useEffect(() => {
    loadScheduleAndSlots(selectedDate);
  }, [selectedDate]);

  const loadScheduleAndSlots = async (date) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Загрузка расписания со слотами для даты:', date);
      // Получаем расписание со слотами
      const response = await getAvailabilityWithSlots(date);
      console.log('Ответ getAvailabilityWithSlots:', response);

      if (response.data) {
        setAvailability(response.data);
        setSlots(response.data.slots || []);
        console.log('Установлены слоты из расписания:', response.data.slots?.length);
      } else {
        setAvailability(null);
        setSlots([]);
        console.log('Расписание не найдено');
      }
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      console.error('Ошибка getAvailabilityWithSlots:', err.response?.data);
      // Если расписания нет (404), пробуем загрузить только слоты
      try {
        console.log('Пробуем загрузить только слоты...');
        const slotsResponse = await getMasterSlots({ date });
        console.log('Ответ getMasterSlots:', slotsResponse);
        setSlots(slotsResponse.data || []);
        setAvailability(null);
        console.log('Установлены слоты напрямую:', slotsResponse.data?.length);
      } catch (slotsErr) {
        console.error('Ошибка getMasterSlots:', slotsErr.response?.data);
        setError('Не удалось загрузить расписание');
        setSlots([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSlot(null);
    setSlotForm({
      start_time: '09:00',
      end_time: '10:00'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (slot) => {
    setEditingSlot(slot);
    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);
    setSlotForm({
      start_time: startTime.toTimeString().slice(0, 5),
      end_time: endTime.toTimeString().slice(0, 5)
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSlot(null);
  };

  const handleSaveSlot = async () => {
    try {
      const startDateTime = new Date(`${selectedDate}T${slotForm.start_time}`);
      const endDateTime = new Date(`${selectedDate}T${slotForm.end_time}`);

      if (startDateTime >= endDateTime) {
        alert('Время окончания должно быть позже времени начала');
        return;
      }

      if (editingSlot) {
        await updateTimeSlot(editingSlot.id, {
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        });
      } else {
        await createTimeSlot({
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString()
        });
      }

      await loadScheduleAndSlots(selectedDate);
      handleCloseModal();
    } catch (err) {
      console.error('Ошибка сохранения слота:', err);
      alert(err.response?.data?.message || 'Ошибка при сохранении слота');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Вы уверены, что хотите удалить этот слот?')) return;

    try {
      await deleteTimeSlot(slotId);
      await loadScheduleAndSlots(selectedDate);
    } catch (err) {
      console.error('Ошибка удаления слота:', err);
      alert(err.response?.data?.message || 'Ошибка при удалении слота');
    }
  };

  const handleCreateSchedule = async () => {
    console.log('=== handleCreateSchedule START ===');
    console.log('scheduleForm:', scheduleForm);
    console.log('selectedDate:', selectedDate);
    
    // Значения по умолчанию, если форма пуста
    const startTime = scheduleForm.start_time || '09:00';
    const endTime = scheduleForm.end_time || '18:00';
    const slotDuration = scheduleForm.slot_duration || 60;
    
    console.log('Подготовленные данные:', { startTime, endTime, slotDuration });
    
    try {
      console.log('Вызов setAvailability...');
      const response = await setAvailability({
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        slot_duration: parseInt(slotDuration)
      });
      console.log('Расписание создано:', response);
      await loadScheduleAndSlots(selectedDate);
      alert('Расписание успешно создано');
    } catch (err) {
      console.error('Ошибка создания расписания:', err);
      console.error('Ответ сервера:', err.response?.data);
      alert(err.response?.data?.message || 'Ошибка при создании расписания');
    }
    console.log('=== handleCreateSchedule END ===');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="master-schedule">
      <div className="schedule-header">
        <h3 className="schedule-title">Управление расписанием</h3>
        <input
          type="date"
          value={selectedDate}
          min={getMinDate()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      {/* Форма пакетного создания расписания */}
      <div className="schedule-creator">
        <div className="creator-header">
          <h4 className="creator-title">Быстрое создание расписания</h4>
          {availability && availability.start_time && availability.end_time && (
            <div className="availability-info">
              <span className="material-symbols-outlined">schedule</span>
              <span>
                {availability.start_time} - {availability.end_time} 
                (слот по {availability.slot_duration || 60} мин)
              </span>
              <button
                onClick={() => {
                  setScheduleForm({
                    start_time: availability.start_time,
                    end_time: availability.end_time,
                    slot_duration: availability.slot_duration || 60
                  });
                }}
                className="btn-load-availability"
              >
                Загрузить
              </button>
            </div>
          )}
        </div>
        <div className="creator-form">
          <div className="form-row">
            <div className="form-group">
              <label>Начало работы</label>
              <input
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                className="time-input"
              />
            </div>
            <div className="form-group">
              <label>Окончание работы</label>
              <input
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                className="time-input"
              />
            </div>
            <div className="form-group">
              <label>Длительность слота (мин)</label>
              <input
                type="number"
                value={scheduleForm.slot_duration}
                onChange={(e) => setScheduleForm({ ...scheduleForm, slot_duration: e.target.value })}
                min="15"
                step="15"
                className="duration-input"
              />
            </div>
          </div>
          <button onClick={handleCreateSchedule} className="btn-create-schedule">
            Создать расписание на день
          </button>
        </div>
      </div>

      {/* Список слотов */}
      <div className="slots-section">
        <div className="slots-header">
          <h4 className="slots-title">Слоты на {formatDate(selectedDate)}</h4>
          <button onClick={handleOpenCreateModal} className="btn-add-slot">
            <span className="material-symbols-outlined">add</span>
            Добавить слот
          </button>
        </div>

        {loading && <div className="loading">Загрузка...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && slots.length === 0 && (
          <div className="no-slots">
            <span className="material-symbols-outlined">event_busy</span>
            <p>Нет слотов на эту дату</p>
            <p className="hint">Создайте расписание или добавьте слоты вручную</p>
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <div className="slots-list">
            {slots.map((slot) => (
              <div key={slot.id} className={`slot-item ${slot.status}`}>
                <div className="slot-time">
                  <span className="start-time">{formatTime(slot.start_time)}</span>
                  <span className="separator">-</span>
                  <span className="end-time">{formatTime(slot.end_time)}</span>
                </div>
                <div className="slot-status">
                  <span className={`status-badge ${slot.status}`}>
                    {slot.status === 'free' && 'Свободен'}
                    {slot.status === 'booked' && 'Забронирован'}
                    {slot.status === 'blocked' && 'Заблокирован'}
                  </span>
                </div>
                <div className="slot-actions">
                  {slot.status === 'free' && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(slot)}
                        className="btn-edit"
                        title="Редактировать"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="btn-delete"
                        title="Удалить"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания/редактирования */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <h4 className="modal-title">
              {editingSlot ? 'Редактировать слот' : 'Новый слот'}
            </h4>

            <div className="modal-form">
              <div className="form-group">
                <label>Время начала</label>
                <input
                  type="time"
                  value={slotForm.start_time}
                  onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label>Время окончания</label>
                <input
                  type="time"
                  value={slotForm.end_time}
                  onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                  className="time-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCloseModal} className="btn-cancel">
                Отмена
              </button>
              <button onClick={handleSaveSlot} className="btn-confirm">
                {editingSlot ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSchedule;
