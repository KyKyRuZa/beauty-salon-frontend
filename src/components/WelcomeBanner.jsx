import React from "react";
import '../styles/Welcome.css'
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleServices = () => {
    navigate('/services');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Тематический заголовок “Бьюти Окна”</h1>
        <p className="welcome-subtitle">
          Тематическое описание сайта компании “Бьюти Окна”,
          Тематическое описание сайта компании “Бьюти Окна”
        </p>
        <button className="welcome-button" onClick={handleServices}>Записаться на услугу</button>
      </div>
    </div>
  );
};

export default Welcome;