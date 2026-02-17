import React from "react";
import { Link } from "react-router-dom";
import '../style/ServiceCategories.css';
import firstImage from '../assets/1.png';
import secondImage from '../assets/2.png';
import thirdImage from '../assets/3.png';

const ServiceCategories = () => {
  const categories = [
    {
      title: "Услуги для лица",
      image: firstImage,
      description: "Очищение, увлажнение и восстановление кожи для здорового сияния"
    },
    {
      title: "Косметология",
      image: secondImage,
      description: "Профессиональные процедуры для омоложения и коррекции состояния кожи"
    },
    {
      title: "Макияж",
      image: thirdImage,
      description: "Создание образа для любого события с учётом особенностей лица"
    }
  ];

  return (
    <section className="categories-section">
      <div className="categories-container">
        <div className="categories">
          {categories.map((category, index) => (
            <div
              key={index}
              className="category-card"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              <div className="category-overlay">
                <div className="category-header">
                  <h3 className="home-category-title">{category.title}</h3>
                  <span className="category-arrow">›</span>
                </div>
                <p className="home-category-description">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="categories-cta">
          <Link to="/categories" className="btn btn-cta">
            ВСЕ КАТЕГОРИИ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
