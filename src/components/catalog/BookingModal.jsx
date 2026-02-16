import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../style/catalog/BookingModal.css';

const BookingModal = ({ isOpen, onClose, bookingDetails, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Подтверждение записи</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="booking-summary">
            <h3>Ваша запись:</h3>
            <p><strong>Мастер/Салон:</strong> {bookingDetails.providerName}</p>
            <p><strong>Услуга:</strong> {bookingDetails.serviceName}</p>
            <p><strong>Дата:</strong> {bookingDetails.date}</p>
            <p><strong>Время:</strong> {bookingDetails.time}</p>
            <p><strong>Цена:</strong> {bookingDetails.price} ₽</p>
          </div>
          
          <div className="booking-form">
            <h3>Ваши данные</h3>
            <div className="form-group">
              <label htmlFor="name">Имя *</label>
              <input type="text" id="name" name="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Телефон *</label>
              <input type="tel" id="phone" name="phone" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" />
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Комментарий</label>
              <textarea id="comment" name="comment" rows="3"></textarea>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Отмена</button>
          <button className="confirm-button" onClick={onConfirm}>Подтвердить запись</button>
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingDetails: PropTypes.shape({
    providerName: PropTypes.string,
    serviceName: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    price: PropTypes.number
  }),
  onConfirm: PropTypes.func.isRequired
};

BookingModal.defaultProps = {
  bookingDetails: {}
};

export default BookingModal;