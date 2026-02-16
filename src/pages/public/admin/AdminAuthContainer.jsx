import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/UI/Header';
import AdminLoginForm from '../../../components/auth/AdminLoginForm';
import AdminRegisterForm from '../../../components/auth/AdminRegisterForm';
import "../../../style/auth/AuthContainer.css";

const AdminAuthContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Извлекаем параметры из URL
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'login';

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Обновляем состояние если URL изменился
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Обработчик переключения табов
  const handleTabChange = (tab) => {
    navigate(`?tab=${tab}`, { replace: true });
  };

  return (
    <main className="auth-container">
      <Header />

      <div className="auth-form-wrapper">
      
        {activeTab === 'login' ? (
          <AdminLoginForm onSwitchToRegister={() => handleTabChange('register')} />
        ) : (
          <AdminRegisterForm onSwitchToLogin={() => handleTabChange('login')} />
        )}
      </div>
    </main>
  );
};

export default AdminAuthContainer;