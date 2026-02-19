import { useForm } from "react-hook-form";
import { useState } from "react";
import auth from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "../../validations/zodResolver";
import { getRegisterSchema } from "../../validations"; // Используем центральный экспорт
import "../../styles/auth/AuthForms.css"

const RegisterForm = ({ type, onTypeChange, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [phoneValue, setPhoneValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(getRegisterSchema(type))
  });

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    
    if (formatted.length > 0 && formatted[0] !== '7') {
      formatted = '7' + formatted;
    }
    
    if (formatted.length <= 1) return `+7`;
    if (formatted.length <= 4) return `+7 (${formatted.slice(1, 4)}`;
    if (formatted.length <= 7) return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}`;
    if (formatted.length <= 9) return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}`;
    return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhoneValue(formatted);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const handlePhoneKeyDown = (e) => {
    if ([8, 46, 9, 27, 13].includes(e.keyCode) || 
        (e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode) ||
        (e.keyCode >= 37 && e.keyCode <= 40) ||
        (e.keyCode >= 48 && e.keyCode <= 57) ||
        (e.keyCode >= 96 && e.keyCode <= 105)) {
      return;
    }
    e.preventDefault();
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '');
    const formatted = formatPhone(numbers);
    setPhoneValue(formatted);
    setValue("phone", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setRegistrationError("");

    const requestData = {
      role: type === 'user' ? 'client' : type,
      email: data.email,
      phone: data.phone?.replace(/\D/g, ''),
      password: data.password,
    };

    // Подготовка данных профиля
    const profileData = {};

    if (type === 'user' || type === 'master') {
      profileData.firstName = data.firstName;
      profileData.lastName = data.lastName;
    }

    if (type === 'master') {
      profileData.specialization = data.specialization;
    }

    if (type === 'salon') {
      profileData.name = data.salonName;  // В модели Salon поле называется name, а не salonName
      profileData.address = data.address;
      profileData.inn = data.inn;
    }

    // Добавляем profileData в requestData
    requestData.profileData = profileData;

    try {
      const result = await auth.register(requestData);

      if (result.success) {
        reset();
        setPhoneValue("");
        navigate("/profile");
      } else {
        if (result.error) {
          setRegistrationError(result.error);
        } else {
          setRegistrationError("Ошибка регистрации");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setRegistrationError("Ошибка сервера. Попробуйте позже.");
    }
  };

  const getTitle = () => {
    const titles = {
      user: "Регистрация клиента",
      master: "Регистрация мастера",
      salon: "Регистрация салона",
    };
    return titles[type] || "Регистрация";
  };

  return (
    <div className="register-form-container">
      <div className="sub-tabs-container">
        <button
          type="button"
          onClick={() => onTypeChange('salon')}
          className={`sub-tab-button ${type === 'salon' ? 'active' : ''}`}
        >
          Салон красоты
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('master')}
          className={`sub-tab-button ${type === 'master' ? 'active' : ''}`}
        >
          Бьюти-Мастер
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('user')}
          className={`sub-tab-button ${type === 'user' ? 'active' : ''}`}
        >
          Клиент
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>{getTitle()}</h2>
        
        {/* 1. Основная идентификация */}
        {(type === 'user' || type === 'master') && (
          <>
            <div className="form-group">
              <label htmlFor="name">Имя *</label>
              <input 
                id="name"
                {...register("name")}
                className={errors.name ? "input-error" : ""}
                placeholder="Иван"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="surname">Фамилия *</label>
              <input 
                id="surname"
                {...register("surname")}
                className={errors.surname ? "input-error" : ""}
                placeholder="Иванов"
                disabled={isSubmitting}
              />
              {errors.surname && (
                <p className="error-message">{errors.surname.message}</p>
              )}
            </div>
          </>
        )}
        
        {type === 'salon' && (
          <div className="form-group">
            <label htmlFor="salonName">Название салона *</label>
            <input 
              id="salonName"
              {...register("salonName")}
              className={errors.salonName ? "input-error" : ""}
              placeholder="Салон красоты"
              disabled={isSubmitting}
            />
            {errors.salonName && (
              <p className="error-message">{errors.salonName.message}</p>
            )}
          </div>
        )}
        
        {/* 2. Контактная информация */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input 
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "input-error" : ""}
            placeholder="example@mail.ru"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Номер телефона *</label>
          <input 
            id="phone"
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onPaste={handlePhonePaste}
            className={errors.phone ? "input-error" : ""}
            placeholder="+7 (999) 999-99-99"
            maxLength={18}
            disabled={isSubmitting}
            required
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>
        
        {/* 3. Дополнительные данные */}
        {type === 'master' && (
          <div className="form-group">
            <label htmlFor="specialization">Специализация *</label>
            <input 
              id="specialization"
              {...register("specialization")}
              className={errors.specialization ? "input-error" : ""}
              placeholder="Парикмахер"
              disabled={isSubmitting}
            />
            {errors.specialization && (
              <p className="error-message">{errors.specialization.message}</p>
            )}
          </div>
        )}
        
        {type === 'salon' && (
          <>
            <div className="form-group">
              <label htmlFor="address">Адрес *</label>
              <input 
                id="address"
                {...register("address")}
                className={errors.address ? "input-error" : ""}
                placeholder="ул. Примерная, 123"
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="error-message">{errors.address.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="inn">ИНН *</label>
              <input 
                id="inn"
                {...register("inn")}
                className={errors.inn ? "input-error" : ""}
                placeholder="1234567890"
                disabled={isSubmitting}
              />
              {errors.inn && (
                <p className="error-message">{errors.inn.message}</p>
              )}
            </div>
          </>
        )}
        
        {/* 4. Безопасность (пароли) */}
        <div className="password-section">
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={errors.password ? "input-error" : ""}
                placeholder="Придумайте надежный пароль"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder="Повторите пароль"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="terms"
            {...register("termsAccepted")} 
            disabled={isSubmitting}
          />
          <label htmlFor="terms">
            Я принимаю условия{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              политики конфиденциальности
            </a>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="error-message">{errors.termsAccepted.message}</p>
        )}

        {registrationError && (
          <div className="error-message form-error">
            {registrationError}
          </div>
        )}

        <div className="form-footer">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </button>
          
          <p className="switch-text">
            Уже есть аккаунт?{" "}
            <button 
              type="button" 
              className="link-button" 
              onClick={onSwitchToLogin}
            >
              Войти
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;