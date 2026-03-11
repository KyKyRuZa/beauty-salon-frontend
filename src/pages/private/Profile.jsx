import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/ui/Header";
import '../../styles/Profile.css';

const ClientProfile = lazy(() => import('./client/ClientProfile'));
const MasterProfile = lazy(() => import('./master/MasterProfile'));
const SalonProfile = lazy(() => import('./salon/SalonProfile'));

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

  switch (user?.role) {
    case 'client':
      return <Suspense fallback={<div className="loading-component">Загрузка профиля...</div>}><ClientProfile handleLogout={handleLogout} /></Suspense>;
    case 'master':
      return <Suspense fallback={<div className="loading-component">Загрузка профиля...</div>}><MasterProfile handleLogout={handleLogout} /></Suspense>;
    case 'salon':
      return <Suspense fallback={<div className="loading-component">Загрузка профиля...</div>}><SalonProfile handleLogout={handleLogout} /></Suspense>;
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
