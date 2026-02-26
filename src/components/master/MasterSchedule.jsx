import React, { useReducer, useEffect, useCallback } from 'react';
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

const initialState = {
  selectedDate: new Date().toISOString().split('T')[0],
  slots: [],
  availabilityData: null,
  loading: false,
  error: null,
  selectedService: '',
  masterServices: [],
  loadingServices: true,
  modalOpen: false,
  editingSlot: null,
  slotForm: {
    start_time: '09:00',
    end_time: '10:00'
  },
  scheduleForm: {
    start_time: '09:00',
    end_time: '18:00',
    slot_duration: 60
  }
};

function masterScheduleReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.value };
    case 'SET_SLOTS':
      return { ...state, slots: action.value };
    case 'SET_AVAILABILITY_DATA':
      return { ...state, availabilityData: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_SELECTED_SERVICE':
      return { ...state, selectedService: action.value };
    case 'SET_MASTER_SERVICES':
      return { ...state, masterServices: action.value };
    case 'SET_LOADING_SERVICES':
      return { ...state, loadingServices: action.value };
    case 'SET_MODAL_OPEN':
      return { ...state, modalOpen: action.value };
    case 'SET_EDITING_SLOT':
      return { ...state, editingSlot: action.value };
    case 'SET_SLOT_FORM':
      return { ...state, slotForm: action.value };
    case 'UPDATE_SLOT_FORM':
      return { ...state, slotForm: { ...state.slotForm, ...action.value } };
    case 'SET_SCHEDULE_FORM':
      return { ...state, scheduleForm: action.value };
    case 'UPDATE_SCHEDULE_FORM':
      return { ...state, scheduleForm: { ...state.scheduleForm, ...action.value } };
    case 'RESET_MODAL':
      return {
        ...state,
        modalOpen: false,
        editingSlot: null,
        slotForm: { start_time: '09:00', end_time: '10:00' }
      };
    default:
      return state;
  }
}

const MasterSchedule = () => {
  const { profile } = useAuth();
  const [state, dispatch] = useReducer(masterScheduleReducer, initialState);

  const loadMasterServices = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_SERVICES', value: true });
      const response = await getMasterServices();
      console.log('Загрузка услуг мастера, ответ:', response);

      const servicesData = response?.data?.data || response?.data || response;

      if (servicesData && Array.isArray(servicesData)) {
        dispatch({ type: 'SET_MASTER_SERVICES', value: servicesData });
        console.log('Услуги мастера загружены:', servicesData);
        if (servicesData.length > 0) {
          dispatch({ type: 'SET_SELECTED_SERVICE', value: servicesData[0].id.toString() });
          console.log('Выбрана услуга по умолчанию:', servicesData[0].id, servicesData[0].name);
        }
      } else {
        console.warn('Услуги мастера не получены или пустые:', servicesData);
        dispatch({ type: 'SET_MASTER_SERVICES', value: [] });
      }
    } catch (err) {
      console.error('Ошибка загрузки услуг мастера:', err);
      dispatch({ type: 'SET_ERROR', value: 'Не удалось загрузить услуги мастера' });
    } finally {
      dispatch({ type: 'SET_LOADING_SERVICES', value: false });
    }
  }, []);

  useEffect(() => {
    loadMasterServices();
  }, [loadMasterServices]);

  const loadScheduleAndSlots = useCallback(async (date) => {
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', value: null });
    try {
      console.log('Загрузка расписания со слотами для даты:', date, 'услуга:', state.selectedService);

      if (!state.selectedService) {
        console.log('Услуга не выбрана, пропускаем загрузку слотов');
        dispatch({ type: 'SET_SLOTS', value: [] });
        dispatch({ type: 'SET_AVAILABILITY_DATA', value: null });
        dispatch({ type: 'SET_LOADING', value: false });
        return;
      }

      const masterId = profile?.id;
      console.log('MasterSchedule: masterId из profile:', masterId, 'profile:', profile);

      if (!masterId) {
        console.error('MasterSchedule: masterId не найден');
        dispatch({ type: 'SET_SLOTS', value: [] });
        dispatch({ type: 'SET_AVAILABILITY_DATA', value: null });
        dispatch({ type: 'SET_LOADING', value: false });
        return;
      }

      const response = await getAvailabilityWithSlots(date, masterId, state.selectedService ? parseInt(state.selectedService) : null);
      console.log('Ответ getAvailabilityWithSlots:', response);

      if (response.data) {
        dispatch({ type: 'SET_AVAILABILITY_DATA', value: response.data });
        let loadedSlots = response.data.slots || [];

        loadedSlots = loadedSlots.filter(slot =>
          slot.service_id === parseInt(state.selectedService) || slot.service_id === null
        );

        dispatch({ type: 'SET_SLOTS', value: loadedSlots });
        console.log('Установлены слоты из расписания:', loadedSlots?.length);
      } else {
        dispatch({ type: 'SET_AVAILABILITY_DATA', value: null });
        dispatch({ type: 'SET_SLOTS', value: [] });
        console.log('Расписание не найдено');
      }
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      console.error('Ошибка getAvailabilityWithSlots:', err.response?.data);
      try {
        console.log('Пробуем загрузить только слоты...');
        const masterId = profile?.id;
        const slotsResponse = await getMasterSlots({ date, master_id: masterId });
        console.log('Ответ getMasterSlots:', slotsResponse);

        let loadedSlots = slotsResponse.data || [];
        loadedSlots = loadedSlots.filter(slot =>
          slot.service_id === parseInt(state.selectedService) || slot.service_id === null
        );

        dispatch({ type: 'SET_SLOTS', value: loadedSlots });
        dispatch({ type: 'SET_AVAILABILITY_DATA', value: null });
        console.log('Установлены слоты напрямую:', loadedSlots?.length);
      } catch (slotsErr) {
        console.error('Ошибка getMasterSlots:', slotsErr.response?.data);
        dispatch({ type: 'SET_ERROR', value: 'Не удалось загрузить расписание' });
        dispatch({ type: 'SET_SLOTS', value: [] });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [state.selectedService, profile]);

  useEffect(() => {
    loadScheduleAndSlots(state.selectedDate);
  }, [state.selectedDate, state.selectedService, loadScheduleAndSlots]);

  const handleOpenCreateModal = () => {
    dispatch({ type: 'SET_EDITING_SLOT', value: null });
    dispatch({ type: 'SET_SLOT_FORM', value: { start_time: '09:00', end_time: '10:00' } });
    dispatch({ type: 'SET_MODAL_OPEN', value: true });
  };

  const handleOpenEditModal = (slot) => {
    dispatch({ type: 'SET_EDITING_SLOT', value: slot });

    const parseTime = (timeString) => {
      if (!timeString) return '00:00';
      const timePart = timeString.includes('T')
        ? timeString.split('T')[1].substring(0, 5)
        : timeString.substring(0, 5);
      return timePart;
    };

    dispatch({ type: 'SET_SLOT_FORM', value: {
      start_time: parseTime(slot.start_time),
      end_time: parseTime(slot.end_time)
    }});
    dispatch({ type: 'SET_MODAL_OPEN', value: true });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'RESET_MODAL' });
  };

  const handleSaveSlot = async () => {
    try {
      const formatLocalTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const startDateTime = new Date(`${state.selectedDate}T${state.slotForm.start_time}`);
      const endDateTime = new Date(`${state.selectedDate}T${state.slotForm.end_time}`);

      if (startDateTime >= endDateTime) {
        alert('Время окончания должно быть позже времени начала');
        return;
      }

      if (state.editingSlot) {
        await updateTimeSlot(state.editingSlot.id, {
          start_time: formatLocalTime(startDateTime),
          end_time: formatLocalTime(endDateTime)
        });
      } else {
        await createTimeSlot({
          start_time: formatLocalTime(startDateTime),
          end_time: formatLocalTime(endDateTime)
        });
      }

      await loadScheduleAndSlots(state.selectedDate);
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
      await loadScheduleAndSlots(state.selectedDate);
    } catch (err) {
      console.error('Ошибка удаления слота:', err);
      alert(err.response?.data?.message || 'Ошибка при удалении слота');
    }
  };

  const handleCreateSchedule = async () => {
    console.log('=== handleCreateSchedule START ===');
    console.log('scheduleForm:', state.scheduleForm);
    console.log('selectedDate:', state.selectedDate);
    console.log('selectedService:', state.selectedService);

    if (!state.selectedService) {
      alert('Выберите услугу');
      return;
    }

    const startTime = state.scheduleForm.start_time || '09:00';
    const endTime = state.scheduleForm.end_time || '18:00';
    const slotDuration = state.scheduleForm.slot_duration || 60;

    console.log('Подготовленные данные:', { startTime, endTime, slotDuration, serviceId: state.selectedService });

    try {
      console.log('Вызов setAvailability...');
      const requestData = {
        date: state.selectedDate,
        start_time: startTime,
        end_time: endTime,
        slot_duration: parseInt(slotDuration),
        service_id: parseInt(state.selectedService)
      };

      const response = await setAvailability(requestData);
      console.log('Расписание создано:', response);
      await loadScheduleAndSlots(state.selectedDate);
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
          value={state.selectedDate}
          min={getMinDate()}
          onChange={(e) => dispatch({ type: 'SET_SELECTED_DATE', value: e.target.value })}
          className="date-picker"
        />
      </div>

      <div className="schedule-creator">
        <div className="creator-header">
          <h4 className="creator-title">Быстрое создание расписания</h4>
          {state.availabilityData && state.availabilityData.start_time && state.availabilityData.end_time && (
            <div className="availabilityData-info">
              <span className="material-symbols-outlined">schedule</span>
              <span>
                {state.availabilityData.start_time} - {state.availabilityData.end_time}
                (слот по {state.availabilityData.slot_duration || 60} мин)
                {state.availabilityData.service_id && (() => {
                  const service = state.masterServices.find(s => s.id === state.availabilityData.service_id);
                  return service ? ` • ${service.name}` : '';
                })()}
              </span>
              <button
                onClick={() => {
                  dispatch({ type: 'SET_SCHEDULE_FORM', value: {
                    start_time: state.availabilityData.start_time,
                    end_time: state.availabilityData.end_time,
                    slot_duration: state.availabilityData.slot_duration || 60
                  }});
                  dispatch({ type: 'SET_SELECTED_SERVICE', value: state.availabilityData.service_id?.toString() || '' });
                }}
                className="btn-load-availabilityData"
              >
                Загрузить
              </button>
            </div>
          )}
        </div>

        {state.loadingServices ? (
          <div className="loading-services">Загрузка услуг...</div>
        ) : state.masterServices.length === 0 ? (
          <div className="no-services">
            <p>У вас пока нет услуг. Сначала создайте услугу в каталоге.</p>
          </div>
        ) : (
          <div className="creator-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="schedule-service">Услуга *</label>
                <select
                  id="schedule-service"
                  value={state.selectedService}
                  onChange={(e) => dispatch({ type: 'SET_SELECTED_SERVICE', value: e.target.value })}
                  className="service-select"
                >
                  {state.masterServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.price} ₽)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="schedule-start-time">Начало работы</label>
                <input
                  id="schedule-start-time"
                  type="time"
                  value={state.scheduleForm.start_time}
                  onChange={(e) => dispatch({ type: 'UPDATE_SCHEDULE_FORM', value: { start_time: e.target.value } })}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="schedule-end-time">Окончание работы</label>
                <input
                  id="schedule-end-time"
                  type="time"
                  value={state.scheduleForm.end_time}
                  onChange={(e) => dispatch({ type: 'UPDATE_SCHEDULE_FORM', value: { end_time: e.target.value } })}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="schedule-slot-duration">Длительность слота (мин)</label>
                <input
                  id="schedule-slot-duration"
                  type="number"
                  value={state.scheduleForm.slot_duration}
                  onChange={(e) => dispatch({ type: 'UPDATE_SCHEDULE_FORM', value: { slot_duration: e.target.value } })}
                  min="15"
                  step="15"
                  className="duration-input"
                />
              </div>
            </div>
            <button onClick={handleCreateSchedule} className="btn-create-schedule" disabled={!state.selectedService}>
              Создать расписание на день
            </button>
          </div>
        )}
      </div>

      {/* Список слотов */}
      <div className="slots-section">
        <div className="slots-header">
          <h4 className="slots-title">
            Слоты на {formatDate(state.selectedDate)}
            {state.selectedService && (() => {
              const service = state.masterServices.find(s => s.id === parseInt(state.selectedService));
              return service ? ` • ${service.name}` : '';
            })()}
          </h4>
          <button onClick={handleOpenCreateModal} className="btn-add-slot">
            <span className="material-symbols-outlined">add</span>
            Добавить слот
          </button>
        </div>

        {state.loading && <div className="loading">Загрузка...</div>}
        {state.error && <div className="error">{state.error}</div>}

        {!state.loading && !state.error && state.slots.length === 0 && (
          <div className="no-slots">
            <span className="material-symbols-outlined">event_busy</span>
            <p>Нет слотов на эту дату</p>
            <p className="hint">Создайте расписание или добавьте слоты вручную</p>
          </div>
        )}

        {!state.loading && !state.error && state.slots.length > 0 && (
          <div className="slots-list">
            {state.slots.map((slot) => {
              const service = state.masterServices.find(s => s.id === slot.service_id);

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
      {state.modalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={handleCloseModal}
          onKeyDown={(e) => e.key === 'Escape' && handleCloseModal()}
          tabIndex={-1}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && handleCloseModal()}
            tabIndex={0}
          >
            <button className="modal-close" onClick={handleCloseModal} onKeyDown={(e) => e.key === 'Enter' && handleCloseModal()}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <h4 className="modal-title">
              {state.editingSlot ? 'Редактировать слот' : 'Новый слот'}
            </h4>

            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="slot-start-time">Время начала</label>
                <input
                  id="slot-start-time"
                  type="time"
                  value={state.slotForm.start_time}
                  onChange={(e) => dispatch({ type: 'UPDATE_SLOT_FORM', value: { start_time: e.target.value } })}
                  className="time-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="slot-end-time">Время окончания</label>
                <input
                  id="slot-end-time"
                  type="time"
                  value={state.slotForm.end_time}
                  onChange={(e) => dispatch({ type: 'UPDATE_SLOT_FORM', value: { end_time: e.target.value } })}
                  className="time-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCloseModal} className="btn-cancel">
                Отмена
              </button>
              <button onClick={handleSaveSlot} className="btn-confirm">
                {state.editingSlot ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterSchedule;
