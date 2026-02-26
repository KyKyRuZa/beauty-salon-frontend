import { useReducer } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "../../validations/zodResolver";
import { changePasswordSchema } from "../../validations";
import auth from "../../api/auth";

const initialState = {
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmNewPassword: false,
  successMessage: "",
  errorMessage: ""
};

function changePasswordReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_CURRENT_PASSWORD':
      return { ...state, showCurrentPassword: !state.showCurrentPassword };
    case 'TOGGLE_NEW_PASSWORD':
      return { ...state, showNewPassword: !state.showNewPassword };
    case 'TOGGLE_CONFIRM_PASSWORD':
      return { ...state, showConfirmNewPassword: !state.showConfirmNewPassword };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.message, errorMessage: "" };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.message, successMessage: "" };
    case 'CLEAR_MESSAGES':
      return { ...state, successMessage: "", errorMessage: "" };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ChangePasswordForm = () => {
  const [state, dispatch] = useReducer(changePasswordReducer, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(changePasswordSchema)
  });

  const onSubmit = async (data) => {
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const result = await auth.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      });

      if (result.success) {
        dispatch({ type: 'SET_SUCCESS', message: "Пароль успешно изменен!" });
        reset();
      } else {
        dispatch({ type: 'SET_ERROR', message: result.error || "Ошибка при изменении пароля" });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', message: error.message || "Ошибка при изменении пароля" });
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
              type={state.showCurrentPassword ? "text" : "password"}
              {...register("currentPassword")}
              className={errors.currentPassword ? "input-error" : ""}
              placeholder="Введите текущий пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => dispatch({ type: 'TOGGLE_CURRENT_PASSWORD' })}
              aria-label={state.showCurrentPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {state.showCurrentPassword ? "visibility_off" : "visibility"}
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
              type={state.showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              className={errors.newPassword ? "input-error" : ""}
              placeholder="Придумайте новый пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => dispatch({ type: 'TOGGLE_NEW_PASSWORD' })}
              aria-label={state.showNewPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {state.showNewPassword ? "visibility_off" : "visibility"}
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
              type={state.showConfirmNewPassword ? "text" : "password"}
              {...register("confirmNewPassword")}
              className={errors.confirmNewPassword ? "input-error" : ""}
              placeholder="Повторите новый пароль"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => dispatch({ type: 'TOGGLE_CONFIRM_PASSWORD' })}
              aria-label={state.showConfirmNewPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              <span className="material-symbols-outlined">
                {state.showConfirmNewPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="error-message">{errors.confirmNewPassword.message}</p>
          )}
        </div>

        {state.errorMessage && (
          <div className="error-message form-error">
            {state.errorMessage}
          </div>
        )}

        {state.successMessage && (
          <div className="success-message form-success">
            {state.successMessage}
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