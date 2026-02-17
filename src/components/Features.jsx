import React from "react";
import '../style/Features.css';

const Features = () => {
  const features = [
    {
      title: "ТЫСЯЧИ ПРОВЕРЕННЫХ МАСТЕРОВ В ОДНОМ МЕСТЕ",
      description: "Широкая база специалистов по всем направлениям красоты. Выбор по рейтингу, услугам и локации"
    },
    {
      title: "ЗАПИСЬ ЗА ПАРУ КЛИКОВ БЕЗ ЗВОНКОВ",
      description: "Удобный онлайн-сервис для быстрой записи. Актуальное расписание, отзывы клиентов и подтверждение в реальном времени"
    },
    {
      title: "ЧЕСТНЫЕ ОТЗЫВЫ И РЕЙТИНГ ОТ КЛИЕНТОВ",
      description: "Реальные оценки после посещения. Только проверенные отзывы мастеров и салонов без накрученных звёзд"
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;