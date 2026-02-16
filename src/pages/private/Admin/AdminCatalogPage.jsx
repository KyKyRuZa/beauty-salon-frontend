import React from 'react';
import AdminCatalogManagement from './AdminCatalogManagement';
import './AdminCatalogPage.css';

const AdminCatalogPage = () => {
  return (
    <div className="admin-catalog-page">
      <h1>Администрирование каталога услуг</h1>
      <AdminCatalogManagement />
    </div>
  );
};

export default AdminCatalogPage;