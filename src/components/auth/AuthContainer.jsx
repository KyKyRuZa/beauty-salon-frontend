import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../UI/Header';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import "../../style/auth/AuthContainer.css"

const AuthContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Извлекаем параметры из URL
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'login';
  const typeFromUrl = searchParams.get('type') || 'user';

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [registrationType, setRegistrationType] = useState(typeFromUrl);

  // Обновляем состояние если URL изменилось
  useEffect(() => {
    setActiveTab(tabFromUrl);
    setRegistrationType(typeFromUrl);
  }, [tabFromUrl, typeFromUrl]);

  // Обработчик переключения основных табов
  const handleMainTabChange = (tab) => {
    navigate(`?tab=${tab}&type=${registrationType}`, { replace: true });
  };

  // Обработчик изменения типа регистрации
  const handleRegistrationTypeChange = (type) => {
    navigate(`?tab=register&type=${type}`, { replace: true });
  };

  return (
    <main className="auth-container">
      <Header />

      <div className="auth-form-wrapper">
        {activeTab === 'login' ? (
          <LoginForm onSwitchToRegister={() => handleMainTabChange('register')} />
        ) : (
          <RegisterForm
            type={registrationType}
            onTypeChange={handleRegistrationTypeChange}
            onSwitchToLogin={() => handleMainTabChange('login')}
          />
        )}
      </div>
    </main>
  );
};

export default AuthContainer;