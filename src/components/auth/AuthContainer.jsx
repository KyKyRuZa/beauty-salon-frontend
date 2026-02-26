import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../ui/Header';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import "../../styles/auth/AuthContainer.css"

const AuthContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'login';
  const registrationType = searchParams.get('type') || 'user';

  const handleMainTabChange = (tab) => {
    navigate(`?tab=${tab}&type=${registrationType}`, { replace: true });
  };

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