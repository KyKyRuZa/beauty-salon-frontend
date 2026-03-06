import React, { useState } from 'react';
import '../../styles/PasswordInput.css';


const PasswordInput = ({
  id = 'password',
  label = 'Пароль',
  register,
  errors,
  placeholder = 'Придумайте надежный пароль',
  disabled = false,
  required = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = errors && errors[id];

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-container">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...register}
          className={hasError ? 'input-error' : ''}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          className="password-toggle-button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {hasError && (
        <p className="error-message">{hasError.message}</p>
      )}
    </div>
  );
};

export default PasswordInput;
