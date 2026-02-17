import React from 'react';
import { ServiceManagement } from '../../components/catalog';
import '../../style/catalog/ServiceManagementPage.css';

const ServiceManagementPage = () => {
  return (
    <div className="service-management-page">
      <div className="container">
        <h1>Управление услугами</h1>
        <p>Здесь вы можете создавать, редактировать и удалять ваши услуги в различных категориях</p>
        
        <ServiceManagement />
      </div>
    </div>
  );
};

export default ServiceManagementPage;