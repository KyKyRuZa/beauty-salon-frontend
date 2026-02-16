import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation";
import { useNavigate } from "react-router-dom";
import auth from "../../api/auth";
import "../../style/auth/AuthForms.css";

const AdminLoginForm = ({ onSwitchToRegister }) => {
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
      const result = await auth.adminLogin(data);

      if (result.success) {
        reset();
        navigate("/admin/dashboard"); // Перенаправляем на дашборд админ-панели
      } else {
        setError("root", {
          message: result.error || "Неверный email или пароль"
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("root", {
        message: "Ошибка сервера. Попробуйте позже."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <h2>Вход администратора</h2>

      <div className="form-group">
        <label htmlFor="email">Email</label>
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

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "input-error" : ""}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
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

export default AdminLoginForm;