import React, { useState, useEffect, useCallback } from 'react';
import {
  getMasterSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailabilityWithSlots,
  setAvailability
} from '../../api/timeslots';
import { getMasterServices } from '../../api/catalog';
import { useAuth } from '../../context/AuthContext';
import '../../styles/master/MasterSchedule.css';

const MasterSchedule = () => {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null); // Расписание на дату
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(''); // Выбранная услуга
  const [masterServices, setMasterServices] = useState([]); // Услуги мастера
  const [loadingServices, setLoadingServices] = useState(true);

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

  const loadMasterServices = useCallback(async () => {
    try {
      setLoadingServices(true);
      const response = await getMasterServices();
      console.log('Загрузка услуг мастера, ответ:', response);
      
      // Получаем данные из ответа
      // response.data.data - массив услуг, response.data.success - флаг успеха
      const servicesData = response?.data?.data || response?.data || response;
      
      if (servicesData && Array.isArray(servicesData)) {
        setMasterServices(servicesData);
        console.log('Услуги мастера загружены:', servicesData);
        // Если есть хотя бы одна услуга, выбираем первую по умолчанию
        if (servicesData.length > 0) {
          setSelectedService(servicesData[0].id.toString());
          console.log('Выбрана услуга по умолчанию:', servicesData[0].id, servicesData[0].name);
        }
      } else {
        console.warn('Услуги мастера не получены или пустые:', servicesData);
        setMasterServices([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки услуг мастера:', err);
      setError('Не удалось загрузить услуги мастера');
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Загрузка услуг мастера
  useEffect(() => {
    loadMasterServices();
  }, [loadMasterServices]);

  const loadScheduleAndSlots = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Загрузка расписания со слотами для даты:', date, 'услуга:', selectedService);
      
      // Если услуга не выбрана, не загружаем слоты
      if (!selectedService) {
        console.log('Услуга не выбрана, пропускаем загрузку слотов');
        setSlots([]);
        setAvailabilityData(null);
        setLoading(false);
        return;
      }
      
      // Получаем master_id из профиля (profile.id для мастера)
      const masterId = profile?.id;
      console.log('MasterSchedule: masterId из profile:', masterId, 'profile:', profile);
      
      if (!masterId) {
        console.error('MasterSchedule: masterId не найден');
        setSlots([]);
        setAvailabilityData(null);
        setLoading(false);
        return;
      }
      
      // Получаем расписание со слотами
      const response = await getAvailabilityWithSlots(date, masterId);
      console.log('Ответ getAvailabilityWithSlots:', response);

      if (response.data) {
        setAvailabilityData(response.data);
        let loadedSlots = response.data.slots || [];

        // Фильтруем слоты по выбранной услуге или null (универсальные)
        loadedSlots = loadedSlots.filter(slot =>
          slot.service_id === parseInt(selectedService) || slot.service_id === null
        );

        setSlots(loadedSlots);
        console.log('Установлены слоты из расписания:', loadedSlots?.length);
      } else {
        setAvailabilityData(null);
        setSlots([]);
        console.log('Расписание не найдено');
      }
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      console.error('Ошибка getAvailabilityWithSlots:', err.response?.data);
      // Если расписания нет (404), пробуем загрузить только слоты
      try {
        console.log('Пробуем загрузить только слоты...');
        const masterId = profile?.id;
        const slotsResponse = await getMasterSlots({ date, master_id: masterId });
        console.log('Ответ getMasterSlots:', slotsResponse);

        let loadedSlots = slotsResponse.data || [];
        // Фильтруем слоты по выбранной услуге или null (универсальные)
        loadedSlots = loadedSlots.filter(slot =>
          slot.service_id === parseInt(selectedService) || slot.service_id === null
        );

        setSlots(loadedSlots);
        setAvailabilityData(null);
        console.log('Установлены слоты напрямую:', loadedSlots?.length);
      } catch (slotsErr) {
        console.error('Ошибка getMasterSlots:', slotsErr.response?.data);
        setError('Не удалось загрузить расписание');
        setSlots([]);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedService, profile]);

  useEffect(() => {
    loadScheduleAndSlots(selectedDate);
  }, [selectedDate, selectedService, loadScheduleAndSlots]);

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
    
    // Парсим время из строки формата YYYY-MM-DDTHH:mm:ss или ISO
    const parseTime = (timeString) => {
      if (!timeString) return '00:00';
      // Извлекаем время из строки
      const timePart = timeString.includes('T') 
        ? timeString.split('T')[1].substring(0, 5) 
        : timeString.substring(0, 5);
      return timePart;
    };
    
    setSlotForm({
      start_time: parseTime(slot.start_time),
      end_time: parseTime(slot.end_time)
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSlot(null);
  };

  const handleSaveSlot = async () => {
    try {
      // Создаём дату с локальным временем и конвертируем в формат YYYY-MM-DDTHH:mm:ss
      const formatLocalTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };
      
      const startDateTime = new Date(`${selectedDate}T${slotForm.start_time}`);
      const endDateTime = new Date(`${selectedDate}T${slotForm.end_time}`);

      if (startDateTime >= endDateTime) {
        alert('Время окончания должно быть позже времени начала');
        return;
      }

      if (editingSlot) {
        await updateTimeSlot(editingSlot.id, {
          start_time: formatLocalTime(startDateTime),
          end_time: formatLocalTime(endDateTime)
        });
      } else {
        await createTimeSlot({
          start_time: formatLocalTime(startDateTime),
          end_time: formatLocalTime(endDateTime)
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
    console.log('selectedService:', selectedService);

    // Валидация: услуга обязательна
    if (!selectedService) {
      alert('Выберите услугу');
      return;
    }

    // Значения по умолчанию, если форма пуста
    const startTime = scheduleForm.start_time || '09:00';
    const endTime = scheduleForm.end_time || '18:00';
    const slotDuration = scheduleForm.slot_duration || 60;

    console.log('Подготовленные данные:', { startTime, endTime, slotDuration, serviceId: selectedService });

    try {
      console.log('Вызов setAvailability...');
      const requestData = {
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        slot_duration: parseInt(slotDuration),
        service_id: parseInt(selectedService) // Обязательно передаём service_id
      };
      
      const response = await setAvailability(requestData);
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
    if (!dateString) return '';
    
    // Если строка содержит время в формате HH:mm:ss или HH:mm
    if (dateString.includes(':')) {
      // Извлекаем время из строки (например, "09:00:00" или "2026-02-18T09:00:00.000Z")
      const timePart = dateString.includes('T') 
        ? dateString.split('T')[1].substring(0, 5) 
        : dateString.substring(0, 5);
      return timePart;
    }
    
    // Для обычных Date строк
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
          {availabilityData && availabilityData.start_time && availabilityData.end_time && (
            <div className="availabilityData-info">
              <span className="material-symbols-outlined">schedule</span>
              <span>
                {availabilityData.start_time} - {availabilityData.end_time}
                (слот по {availabilityData.slot_duration || 60} мин)
                {availabilityData.service_id && (() => {
                  const service = masterServices.find(s => s.id === availabilityData.service_id);
                  return service ? ` • ${service.name}` : '';
                })()}
              </span>
              <button
                onClick={() => {
                  setScheduleForm({
                    start_time: availabilityData.start_time,
                    end_time: availabilityData.end_time,
                    slot_duration: availabilityData.slot_duration || 60
                  });
                  setSelectedService(availabilityData.service_id?.toString() || '');
                }}
                className="btn-load-availabilityData"
              >
                Загрузить
              </button>
            </div>
          )}
        </div>
        
        {loadingServices ? (
          <div className="loading-services">Загрузка услуг...</div>
        ) : masterServices.length === 0 ? (
          <div className="no-services">
            <p>У вас пока нет услуг. Сначала создайте услугу в каталоге.</p>
          </div>
        ) : (
          <div className="creator-form">
            <div className="form-row">
              <div className="form-group">
                <label>Услуга *</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="service-select"
                >
                  {masterServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.price} ₽)
                    </option>
                  ))}
                </select>
              </div>
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
            <button onClick={handleCreateSchedule} className="btn-create-schedule" disabled={!selectedService}>
              Создать расписание на день
            </button>
          </div>
        )}
      </div>

      {/* Список слотов */}
      <div className="slots-section">
        <div className="slots-header">
          <h4 className="slots-title">
            Слоты на {formatDate(selectedDate)}
            {selectedService && (() => {
              const service = masterServices.find(s => s.id === parseInt(selectedService));
              return service ? ` • ${service.name}` : '';
            })()}
          </h4>
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
            {slots.map((slot) => {
              // Находим название услуги для слота
              const service = masterServices.find(s => s.id === slot.service_id);
              
              return (
                <div key={slot.id} className={`slot-item ${slot.status}`}>
                  <div className="slot-time">
                    <span className="start-time">{formatTime(slot.start_time)}</span>
                    <span className="separator">-</span>
                    <span className="end-time">{formatTime(slot.end_time)}</span>
                  </div>
                  <div className="slot-info">
                    {service && (
                      <span className="service-name" title={service.name}>
                        
                        {service.name}
                      </span>
                    )}
                    {!service && !slot.service_id && (
                      <span className="service-name universal">
                        <span className="material-symbols-outlined">all_inclusive</span>
                        Все услуги
                      </span>
                    )}
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
              );
            })}
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
