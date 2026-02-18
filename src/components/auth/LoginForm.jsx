import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "../../validations/zodResolver";
import { loginSchema } from "../../validations"; // Используем центральный экспорт
import auth from "../../api/auth";
import "../../styles/auth/AuthForms.css"

const LoginForm = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const result = await auth.login(data);
      
      if (result.success) {
        reset();
        navigate("/profile");
      } else {
        setError("root", {
          message: result.error || "Неверный email или пароль"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("root", {
        message: "Ошибка сервера. Попробуйте позже."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <h2>Вход в систему</h2>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
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
        <label htmlFor="password">Пароль</label>
        <div className="password-input-container">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={errors.password ? "input-error" : ""}
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

      {errors.root && (
        <div className="error-message form-error">
          {errors.root.message}
        </div>
      )}

      <div className="form-footer">
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Вход..." : "Войти"}
        </button>
        
        <p className="switch-text">
          Еще нет аккаунта?{" "}
          <button 
            type="button" 
            className="link-button" 
            onClick={onSwitchToRegister}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;