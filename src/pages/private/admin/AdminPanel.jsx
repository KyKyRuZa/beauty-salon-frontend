import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import auth from '../../../api/auth';
import '../../../styles/admin/AdminPanel.css';

// Lazy loading для тяжёлых подкомпонентов
const Dashboard = lazy(() => import('./Dashboard'));
const UsersManagement = lazy(() => import('./UsersManagement'));
const CategoriesManagement = lazy(() => import('./CategoriesManagement'));
const SubcategoriesManagement = lazy(() => import('./SubcategoriesManagement'));
const ServicesManagement = lazy(() => import('./ServicesManagement'));
const OrdersManagement = lazy(() => import('./OrdersManagement'));
const AdminsManagement = lazy(() => import('./AdminsManagement'));
const AdminProfile = lazy(() => import('./AdminProfile'));

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/'); // Перенаправляем на главную страницу после выхода
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Дашборд', icon: '📊' },
    { path: '/admin/profile', label: 'Профиль', icon: '👤' },
    { path: '/admin/admins', label: 'Администраторы', icon: '👥' },
    { path: '/admin/users', label: 'Пользователи', icon: '👥' },
    { path: '/admin/categories', label: 'Категории', icon: '📂' },
    { path: '/admin/subcategories', label: 'Подкатегории', icon: '🗂️' },
    { path: '/admin/services', label: 'Услуги', icon: '🔧' },
    { path: '/admin/orders', label: 'Заказы', icon: '📦' }
  ];

  return (
    <div className="admin-panel">
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Админ-панель</h2>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <span className="icon">{item.icon}</span>
                  {sidebarOpen && <span className="label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={`admin-main-content ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <header className="admin-header">
          <button className="mobile-toggle-btn" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Административная панель</h1>
          <div className="admin-header-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Suspense fallback={<div className="loading-component">Загрузка раздела...</div>}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/admins" element={<AdminsManagement />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/categories" element={<CategoriesManagement />} />
              <Route path="/subcategories" element={<SubcategoriesManagement />} />
              <Route path="/services" element={<ServicesManagement />} />
              <Route path="/orders" element={<OrdersManagement />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;