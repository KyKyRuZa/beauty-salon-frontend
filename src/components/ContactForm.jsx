// components/ContactForm/index.jsx
import React, { useState } from "react";
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    question: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="contact-section">
      <div className="container">
        <div className="contact-content">
          <div className="contact-text">
            <h2 className="contact-title">ОСТАЛИСЬ ВОПРОСЫ?</h2>
            <p className="contact-subtitle">
              Мы ответим на все, что Вас интересует :)
            </p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Камиль"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Телефон"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  name="question"
                  placeholder="Ваш вопрос"
                  value={formData.question}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="btn btn-submit">
                ОТПРАВИТЬ ФОРМУ
              </button>
            </form>
          </div>
          <div className="contact-image">
            <img src="/images/brush.png" alt="Makeup brush" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
