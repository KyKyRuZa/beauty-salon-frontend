import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from '../../validations';
import InputMask from "react-input-mask";
import { useSearchParams } from 'react-router-dom';
import { createBooking } from '../../api/booking';
import '../../styles/booking/BookingForm.css'

const formatAppointmentDate = (dateString, timeString) => {
  const date = new Date(dateString);
  const [hours, minutes] = timeString.split(':');

  // Устанавливаем правильное время
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  // Форматируем дату на русском языке
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const sendAppointmentToBot = async (data) => {
  try {
    const response = await fetch('/api/site-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'reminder',
        phone: data.phone.replace(/\D/g, ''),
        name: data.name,
        appointment_date: formatAppointmentDate(data.date, data.time)
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка отправки данных:', error);
    throw error;
  }
};

const BookingForm = () => {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const masterId = searchParams.get('master_id');
  const serviceId = searchParams.get('service_id');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: date || '',
      time: time || ''
    }
  });

  // Устанавливаем значения из URL при монтировании компонента
  React.useEffect(() => {
    if (date) setValue('date', date);
    if (time) setValue('time', time);
  }, [date, time, setValue]);

  const onSubmit = async (data) => {
  try {
    console.log("Отправляемые данные:", data);

    // Если есть masterId и serviceId, создаём бронирование через новую систему
    if (masterId && serviceId) {
      const bookingData = {
        master_id: parseInt(masterId),
        master_service_id: parseInt(serviceId),
        start_time: new Date(`${data.date}T${data.time}`).toISOString(),
        end_time: new Date(`${data.date}T${data.time}`).toISOString(), // Будет рассчитано на сервере
        comment: `Клиент: ${data.name}, Телефон: ${data.phone}`
      };
      
      const response = await createBooking(bookingData);
      console.log("Ответ сервера:", response);
    } else {
      // Старая логика - отправка в бот
      const response = await sendAppointmentToBot(data);
      console.log("Ответ сервера:", response);
    }

    alert("Заявка отправлена успешно! Ожидайте подтверждения записи.");
    reset({
      name: '',
      phone: '',
      date: date || '',  // Сохраняем дату из URL
      time: time || ''   // Сохраняем время из URL
    });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    alert("Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.");
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>Запись на прием</h2>
      
      {/* Отображение информации о провайдере и времени, если они переданы */}
      {(provider || date || time) && (
        <div className="booking-info">
          <h3>Информация о записи:</h3>
          {provider && <p><strong>Провайдер:</strong> {provider}</p>}
          {date && time && (
            <p><strong>Время записи:</strong> {new Date(`${date}T${time}`).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Имя*</label>
        <input
          id="name"
          {...register("name")}
          className={errors.name ? "error" : ""}
          placeholder="Имя"
        />
        {errors.name && (
          <p className="error-message">{errors.name.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Телефон*</label>
        <InputMask
          mask="+7 (999) 999-99-99"
          alwaysShowMask
          {...register("phone")}
          className={errors.phone ? "error" : ""}
          placeholder="+7 (___) ___-__-__"
        />
        {errors.phone && (
          <p className="error-message">{errors.phone.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date">Дата*</label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className={errors.date ? "error" : ""}
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.date && (
          <p className="error-message">{errors.date.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="time">Время*</label>
        <input
          id="time"
          type="time"
          {...register("time")}
          className={errors.time ? "error" : ""}
        />
        {errors.time && (
          <p className="error-message">{errors.time.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Отправка...' : 'Записаться'}
      </button>
    </form>
  );
};

export default BookingForm;