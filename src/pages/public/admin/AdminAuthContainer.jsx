import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import AdminLoginForm from '../../../components/admin/AdminLoginForm';
import AdminRegisterForm from '../../../components/admin/AdminRegisterForm';
import "../../../styles/auth/AuthContainer.css";

const AdminAuthContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'login';

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