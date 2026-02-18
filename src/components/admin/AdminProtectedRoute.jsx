import { Navigate, useLocation } from 'react-router-dom';
import auth from '../../api/auth';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Проверяем, авторизован ли пользователь
  if (!auth.isAuthenticated()) {
    // Перенаправляем на страницу входа администратора с сохранением текущего пути
    return <Navigate to="/admin/auth?tab=login" state={{ from: location }} replace />;
  }

  // Проверяем, является ли пользователь администратором
  const currentUser = auth.getCurrentUser();
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    // Если пользователь не администратор, перенаправляем на главную
    return <Navigate to="/" replace />;
  }

  // Если всё в порядке, показываем дочерние компоненты
  return children;
};

export default AdminProtectedRoute;