import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ClientProfile from "./client/ClientProfile";
import MasterProfile from "./master/MasterProfile";
import SalonProfile from "./salon/SalonProfile";
import Header from "../../components/ui/Header";
import '../../styles/Profile.css';

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading || authLoading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Header />
        <div className="container">
          <div className="error-container">
            <h3>Профиль не найден</h3>
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Рендерим соответствующий компонент в зависимости от роли
  switch (user?.role) {
    case 'client':
      return <ClientProfile handleLogout={handleLogout} />;
    case 'master':
      return <MasterProfile handleLogout={handleLogout} />;
    case 'salon':
      return <SalonProfile handleLogout={handleLogout} />;
    default:
      return (
        <div className="profile-page">
          <Header />
          <div className="container">
            <div className="error-container">
              <h3>Неизвестный тип профиля</h3>
              <p>Роль пользователя не определена</p>
              <button
                className="btn-primary"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      );
  }
};

export default Profile;
