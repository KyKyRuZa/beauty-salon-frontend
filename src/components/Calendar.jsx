// import React, { useState } from 'react';
// import DatePicker from 'react-datepicker';
// import { format, addDays, addWeeks } from 'date-fns';
// import { ru } from 'date-fns/locale';
// import '../style/booking/Calendar.css'
// import 'react-datepicker/dist/react-datepicker.css';

// const AppointmentScheduler = () => {
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [currentWeek, setCurrentWeek] = useState(new Date());

//   const timeSlots = ['10:15', '11:00', '14:30', '16:30', '18:30', '19:00', '20:30'];

//   // Генерация дней недели
//   const generateWeekDays = () => {
//     const days = [];
//     const startOfWeek = currentWeek;
    
//     for (let i = 0; i < 7; i++) {
//       const date = addDays(startOfWeek, i);
//       days.push(date);
//     }
//     return days;
//   };

//   const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
//   const prevWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));

//   return (
//     <div className="appointment-scheduler">
//       {/* Заголовок специалиста */}
//       <div className="specialist-info">
//         <h2>Галимов Камиль</h2>
//         <div className="rating">★ 5.0 (19)</div>
//         <div className="price">1200.00 RUB · 1 час 15 мин</div>
//       </div>

//       {/* Навигация по неделям */}
//       <div className="week-navigation">
//         <button onClick={prevWeek}>‹</button>
//         <span>
//           {format(currentWeek, 'MMMM yyyy', { locale: ru })}
//         </span>
//         <button onClick={nextWeek}>›</button>
//       </div>

//       {/* Сетка дней недели */}
//       <div className="week-grid">
//         {generateWeekDays().map((date, index) => (
//           <div
//             key={index}
//             className={`day-cell ${selectedDate && selectedDate.toDateString() === date.toDateString() ? 'selected' : ''}`}
//             onClick={() => setSelectedDate(date)}
//           >
//             <div className="day-name">
//               {format(date, 'EEE', { locale: ru })}
//             </div>
//             <div className="day-number">
//               {format(date, 'd')}
//             </div>
//             <div className="month-name">
//               {format(date, 'MMM', { locale: ru })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Выбор времени */}
//       {selectedDate && (
//         <div className="time-selection">
//           <h3>Доступное время:</h3>
//           <div className="time-slots">
//             {timeSlots.map((time, index) => (
//               <button
//                 key={index}
//                 className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
//                 onClick={() => setSelectedTime(time)}
//               >
//                 {time}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Кнопка подтверждения */}
//       {selectedDate && selectedTime && (
//         <button className="confirm-button">
//           Записаться на {format(selectedDate, 'd MMMM', { locale: ru })} в {selectedTime}
//         </button>
//       )}
//     </div>
//   );
// };

// export default AppointmentScheduler;