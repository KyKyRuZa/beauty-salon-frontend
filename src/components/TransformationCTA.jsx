import React from "react";
import { Link } from "react-router-dom";
import '../style/TransformationCTA.css';
import womanImage from '../assets/cta-woman.png';

const TransformationCTA = () => {
  return (
    <section className="transformation-cta">
      <div className="container">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">
              ГОТОВЫ К<br />ПРЕОБРАЖЕНИЮ?
            </h2>
            <p className="cta-description">
              Выберите услугу, салон, мастера и удобное время. Всё рядом и без лишних звонков —
              красота начинается с одного клика.
            </p>
            <Link to="/booking" className="btn btn-primary">
              ЗАПИСАТЬСЯ НА ПРИЕМ
            </Link>
          </div>
          <div className="cta-image">
            <img src={womanImage} alt="Преображение" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformationCTA;
