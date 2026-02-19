import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminRegisterSchema } from "../../validations";
import { useState } from "react";
import auth from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/AuthForms.css";

const AdminRegisterForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [phoneValue, setPhoneValue] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(adminRegisterSchema),
    mode: 'onSubmit',
    defaultValues: {
      termsAccepted: false
    }
  });

  const termsAccepted = watch("termsAccepted");

  const handleTermsChange = (e) => {
    setValue("termsAccepted", e.target.checked, { shouldValidate: true });
  };

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

    console.log("Form data:", data);
    console.log("termsAccepted value:", data.termsAccepted);

    const requestData = {
      email: data.email?.trim(),
      phone: data.phone?.replace(/\D/g, ''),
      password: data.password,
      confirmPassword: data.confirmPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'admin',
      termsAccepted: data.termsAccepted === true
    };

    console.log("Request data:", requestData);

    try {
      const result = await auth.adminRegister(requestData);

      if (result.success) {
        reset();
        setPhoneValue("");
        navigate("/admin/dashboard"); // Переходим на дашборд админ-панели
      } else {
        if (result.error) {
          setRegistrationError(result.error);
        } else {
          setRegistrationError("Ошибка регистрации администратора");
        }
      }
    } catch (error) {
      console.error("Admin registration error:", error);
      setRegistrationError("Ошибка сервера. Попробуйте позже.");
    }
  };

  return (
    <div className="register-form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Регистрация администратора</h2>

        {/* First Name */}
        <div className="form-group">
          <label htmlFor="first_name">Имя *</label>
          <input
            id="first_name"
            type="text"
            {...register("first_name")}
            className={errors.first_name ? "input-error" : ""}
            placeholder="Введите ваше имя"
            disabled={isSubmitting}
          />
          {errors.first_name && (
            <p className="error-message">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label htmlFor="last_name">Фамилия *</label>
          <input
            id="last_name"
            type="text"
            {...register("last_name")}
            className={errors.last_name ? "input-error" : ""}
            placeholder="Введите вашу фамилию"
            disabled={isSubmitting}
          />
          {errors.last_name && (
            <p className="error-message">{errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "input-error" : ""}
            placeholder="admin@example.com"
            disabled={isSubmitting}
            autoComplete="username"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
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

        {/* Password */}
        <div className="password-section">
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "input-error" : ""}
              placeholder="Придумайте надежный пароль"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Повторите пароль"
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted || false}
            onChange={handleTermsChange}
            disabled={isSubmitting}
          />
          <label htmlFor="terms">
            Я принимаю условия{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              политики конфиденциальности
            </a>
          </label>
          {errors.termsAccepted && (
            <p className="error-message">{errors.termsAccepted.message}</p>
          )}
        </div>

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

export default AdminRegisterForm;