import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../validation/zodResolver";
import { changePasswordSchema } from "../../validation";
import auth from "../../api/auth";

const ChangePasswordForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm({
    resolver: zodResolver(changePasswordSchema)
  });

  const onSubmit = async (data) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Вызов API для изменения пароля
      const result = await auth.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      });

      if (result.success) {
        setSuccessMessage("Пароль успешно изменен!");
        reset();
      } else {
        setErrorMessage(result.error || "Ошибка при изменении пароля");
      }
    } catch (error) {
      setErrorMessage(error.message || "Ошибка при изменении пароля");
    }
  };

  return (
    <div className="change-password-form">
      <h3>Изменить пароль</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="currentPassword">Текущий пароль</label>
          <div className="password-input-container">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              {...register("currentPassword")}
              className={errors.currentPassword ? "input-error" : ""}
              placeholder="Введите текущий пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-label={showCurrentPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {showCurrentPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.currentPassword && (
            <p className="error-message">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Новый пароль</label>
          <div className="password-input-container">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              className={errors.newPassword ? "input-error" : ""}
              placeholder="Придумайте новый пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {showNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.newPassword && (
            <p className="error-message">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmNewPassword">Подтвердите новый пароль</label>
          <div className="password-input-container">
            <input
              id="confirmNewPassword"
              type={showConfirmNewPassword ? "text" : "password"}
              {...register("confirmNewPassword")}
              className={errors.confirmNewPassword ? "input-error" : ""}
              placeholder="Повторите новый пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              aria-label={showConfirmNewPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {showConfirmNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="error-message">{errors.confirmNewPassword.message}</p>
          )}
        </div>

        {errorMessage && (
          <div className="error-message form-error">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="success-message form-success">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Изменение..." : "Изменить пароль"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;