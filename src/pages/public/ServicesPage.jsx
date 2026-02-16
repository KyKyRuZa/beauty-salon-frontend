import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ServicesPage.module.css';
import Header from '../../components/UI/Header';
import Footer from '../../components/UI/Footer';
import { getCatalogServices as CatalogService } from '../../api/catalog';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await CatalogService();
        // API теперь возвращает услуги в формате { data: [...] }
        setServices(response.data.data || []);
      } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
        // В случае ошибки устанавливаем моковые данные
        setServices([
          {
            id: 'facial',
            title: 'Услуги для лица',
            description: 'Очищение, увлажнение и восстановление кожи для здорового сияния',
            image: 'https://via.placeholder.com/600x400?text=Услуги+для+лица',
          },
          {
            id: 'cosmetology',
            title: 'Косметология',
            description: 'Профессиональные процедуры для омоложения и коррекции состояния кожи',
            image: 'https://via.placeholder.com/600x400?text=Косметология',
          },
          {
            id: 'makeup',
            title: 'Макияж',
            description: 'Создание образа для любого события с учётом особенностей лица',
            image: 'https://via.placeholder.com/600x400?text=Макияж',
          },
          {
            id: 'brows',
            title: 'Услуги по уходу за бровями и ресницами',
            description: 'Коррекция формы, окрашивание и укрепление для выразительного взгляда',
            image: 'https://via.placeholder.com/600x400?text=Брови+и+ресницы',
          },
          {
            id: 'body',
            title: 'Уход за телом',
            description: 'Питание и восстановление кожи для поддержания тонуса и упругости',
            image: 'https://via.placeholder.com/600x400?text=Уход+за+телом',
          },
          {
            id: 'depilation',
            title: 'Депиляция / Эпиляция',
            description: 'Безопасное удаление нежелательных волос с долговременным эффектом гладкости',
            image: 'https://via.placeholder.com/600x400?text=Депиляция',
          },
          {
            id: 'hair',
            title: 'Парикмахерские услуги уход за волосами',
            description: 'Стрижка, окрашивание и восстановление волос для безупречного внешнего вида',
            image: 'https://via.placeholder.com/600x400?text=Парикмахерские',
          },
          {
            id: 'nails',
            title: 'Маникюр и педикюр',
            description: 'Профессиональный уход, дизайн и укрепление ногтей для идеального внешнего вида',
            image: 'https://via.placeholder.com/600x400?text=Маникюр',
          },
          {
            id: 'spa',
            title: 'Массаж и SPA',
            description: 'Расслабление, восстановление энергии и улучшение общего самочувствия',
            image: 'https://via.placeholder.com/600x400?text=SPA',
          },
          {
            id: 'tattoo',
            title: 'Тату и перманентный макияж',
            description: 'Долговременное оформление черт лица и декоративные рисунки',
            image: 'https://via.placeholder.com/600x400?text=Тату',
          },
          {
            id: 'men',
            title: 'Услуги для мужчин',
            description: 'Комплексный уход за внешностью с учётом мужских потребностей',
            image: 'https://via.placeholder.com/600x400?text=Мужские+услуги',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.grid}>
          {loading ? (
            <p>Загрузка услуг...</p>
          ) : services.length > 0 ? (
            services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className={styles.card}
              >
                <div
                  className={styles.imageWrapper}
                  style={{ backgroundImage: `url(${service.image || 'https://via.placeholder.com/600x400?text=Услуга'})` }}
                >
                  <div className={styles.overlay} />
                  <div className={styles.content}>
                    <h3 className={styles.title}>{service.name || service.title}</h3>
                    <p className={styles.description}>{service.description}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>Услуги временно недоступны</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;