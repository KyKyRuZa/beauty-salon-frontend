import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { logger } from "../../../utils/logger";
import ChangePasswordForm from "../../../components/auth/ChangePasswordForm";
import Header from "../../../components/ui/Header";
import "../../../styles/EditProfile.css";

const EditProfile = () => {
  const { user, profile, loading: authLoading, updateProfile, getFullProfile, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Загружаем текущий профиль и инициализируем форму
  useEffect(() => {
    if (authLoading) return; // Ждем завершения инициализации аутентификации

    if (!getCurrentUser()) {
      navigate("/");
      return;
    }

    // Формируем данные для инициализации формы
    const defaultValues = {
      email: user?.email || "",
      phone: user?.phone || "",
    };

    // Устанавливаем имя и фамилию только для клиентов и мастеров
    if (user?.role === 'client' || user?.role === 'master') {
      defaultValues.firstName = profile?.firstName || user?.firstName || '';
      defaultValues.lastName = profile?.lastName || user?.lastName || '';
    }

    if (profile) {
      if (user?.role === 'master') {
        defaultValues.specialization = profile.specialization;
        defaultValues.experience = profile.experience;
      }

      if (user?.role === 'salon') {
        defaultValues.salonName = profile.name;
        defaultValues.address = profile.address;
        defaultValues.inn = profile.inn;
        defaultValues.description = profile.description;
      }
    } else {
      logger.debug('Profile data is missing, user may need to create profile');
    }

    // Инициализируем форму одним вызовом
    reset(defaultValues);
    setLoading(false);
  }, [user, profile, authLoading, reset, navigate, getCurrentUser]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      logger.debug('Данные формы перед фильтрацией:', data);

      // Фильтруем только непустые значения
      const filteredData = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          // Если значение - FileList, извлекаем файл
          if (value instanceof FileList && value.length > 0) {
            filteredData[key] = value[0]; // Берем первый файл из списка
          } else if (value !== '') {
            filteredData[key] = value;
          }
        }
      }

      logger.debug('Отфильтрованные данные перед отправкой:', filteredData);

      // Получаем полные данные профиля для проверки наличия профиля
      const fullProfile = getFullProfile();

      // Если профиль отсутствует, добавляем флаг для создания профиля на сервере
      if (!fullProfile || !fullProfile.profile) {
        filteredData.createProfile = true;
      }

      // Map salonName to name for salon profiles
      if (filteredData.salonName) {
        filteredData.name = filteredData.salonName;
        delete filteredData.salonName; // Remove the temporary field
      }
      const result = await updateProfile(filteredData);

      if (result.success) {
        setSuccess("Профиль успешно обновлен!");
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        setError(result.error || "Ошибка при обновления профиля");
      }
    } catch (error) {
      logger.error('Ошибка при обновлении профиля:', error);
      setError(error.message || "Ошибка сервера. Попробуйте позже.");
    } finally {
      setSaving(false);
    }
  };

  const currentUser = getCurrentUser();

  if (loading || authLoading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="container">
        <div className="edit-profile-container">
          <h1>Редактирование профиля</h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
            <div className="form-section">
              <h3>Основная информация</h3>

              {(currentUser && currentUser.role === 'client') && (
                <>
                  <div className="form-group">
                    <label htmlFor="firstName">Имя *</label>
                    <input
                      id="firstName"
                      type="text"
                      {...register("firstName", { required: "Имя обязательно" })}
                      className={errors.firstName ? "input-error" : ""}
                    />
                    {errors.firstName && (
                      <p className="error-text">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Фамилия *</label>
                    <input
                      id="lastName"
                      type="text"
                      {...register("lastName", { required: "Фамилия обязательна" })}
                      className={errors.lastName ? "input-error" : ""}
                    />
                    {errors.lastName && (
                      <p className="error-text">{errors.lastName.message}</p>
                    )}
                  </div>
                </>
              )}

              {(currentUser && currentUser.role === 'master') && (
                <>
                  <div className="form-group">
                    <label htmlFor="firstName">Имя *</label>
                    <input
                      id="firstName"
                      type="text"
                      {...register("firstName", { required: "Имя обязательно" })}
                      className={errors.firstName ? "input-error" : ""}
                    />
                    {errors.firstName && (
                      <p className="error-text">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Фамилия *</label>
                    <input
                      id="lastName"
                      type="text"
                      {...register("lastName", { required: "Фамилия обязательна" })}
                      className={errors.lastName ? "input-error" : ""}
                    />
                    {errors.lastName && (
                      <p className="error-text">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialization">Специализация *</label>
                    <input
                      id="specialization"
                      type="text"
                      {...register("specialization", { required: "Специализация обязательна" })}
                      className={errors.specialization ? "input-error" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Опыт работы (лет) *</label>
                    <input
                      id="experience"
                      type="number"
                      {...register("experience", {
                        required: "Опыт работы обязателен",
                        min: {
                          value: 0,
                          message: "Опыт не может быть отрицательным"
                        },
                        max: {
                          value: 50,
                          message: "Опыт не может превышать 50 лет"
                        }
                      })}
                      className={errors.experience ? "input-error" : ""}
                      placeholder="Введите количество лет опыта"
                    />
                    {errors.experience && (
                      <p className="error-text">{errors.experience.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email обязателен" })}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <p className="error-text">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone", { required: "Телефон обязателен" })}
                  className={errors.phone ? "input-error" : ""}
                  placeholder="+7 (999) 999-99-99"
                />
                {errors.phone && (
                  <p className="error-text">{errors.phone.message}</p>
                )}
              </div>

              {(currentUser && currentUser.role === 'salon') && (
                <>
                  <div className="form-group">
                    <label htmlFor="salonName">Название салона *</label>
                    <input
                      id="salonName"
                      type="text"
                      {...register("salonName", { required: "Название салона обязательно" })}
                      className={errors.salonName ? "input-error" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Адрес *</label>
                    <input
                      id="address"
                      type="text"
                      {...register("address", { required: "Адрес обязателен" })}
                      className={errors.address ? "input-error" : ""}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Описание салона</label>
                    <textarea
                      id="description"
                      {...register("description")}
                      className={errors.description ? "input-error" : ""}
                      placeholder="Введите описание вашего салона..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inn">ИНН *</label>
                    <input
                      id="inn"
                      type="text"
                      {...register("inn", {
                        required: "ИНН обязателен",
                        pattern: {
                          value: /^\d{10}$|^\d{12}$/,
                          message: "ИНН должен содержать 10 или 12 цифр"
                        }
                      })}
                      className={errors.inn ? "input-error" : ""}
                    />
                    {errors.inn && (
                      <p className="error-text">{errors.inn.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/profile")}
                disabled={saving}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </form>

          <div className="change-password-section">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;