import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "../../validations/zodResolver";
import { loginSchema } from "../../validations";
import {logger} from "../../utils/logger"
import auth from "../../api/auth";
import PasswordInput from "../ui/PasswordInput";
import "../../styles/auth/AuthForms.css"

const LoginForm = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
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
        // Загружаем профиль сразу после логина
        const profileResult = await auth.getProfile();
        if (profileResult.success) {
          window.dispatchEvent(new CustomEvent('authChange'));
        }
        // Даем время на обновление контекста авторизации и редирект
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 300);
      } else {
        setError("root", {
          message: result.error || "Неверный email или пароль"
        });
      }
    } catch (error) {
      logger.error('Ошибка входа:', error);
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

      <PasswordInput
        id="password"
        label="Пароль"
        register={register("password")}
        errors={errors}
        disabled={isSubmitting}
      />

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