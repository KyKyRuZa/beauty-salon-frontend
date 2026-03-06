import React from 'react';
import '../../styles/PhoneInput.css';


const PhoneInput = ({
  id = 'phone',
  label = 'Номер телефона',
  value,
  onChange,
  onKeyDown,
  onPaste,
  errors,
  placeholder = '+7 (999) 999-99-99',
  disabled = false,
  required = true
}) => {
  const hasError = errors && errors[id];

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="tel"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className={hasError ? 'input-error' : ''}
        placeholder={placeholder}
        maxLength={18}
        disabled={disabled}
        required={required}
      />
      {hasError && (
        <p className="error-message">{hasError.message}</p>
      )}
    </div>
  );
};

export default PhoneInput;
