import React from 'react';
import logo from '../../assets/alt_logo.svg';
import styles from '../../style/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.column}>
        <div className={styles.logo}>            
            <img src={logo} alt="logo" className={styles.footer_logo} />
        </div>
        <div className={styles.socials}>
          <a href="https://vk.com" target="_blank" rel="noreferrer" aria-label="ВКонтакте">
          </a>
          <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
          </a>
        </div>
        <div className={styles.bottomLinks}>
          <a href="/privacy">Политика конфиденциальности</a>
          <a href="/payments">Платежи</a>
        </div>
      </div>

      <div className={styles.column}>
        <h3 className={styles.menuTitle}>МЕНЮ</h3>
        <ul className={styles.menuList}>
          <li><a href="/services">Услуги</a></li>
          <li><a href="/reviews">Отзывы</a></li>
          <li><a href="/about">О нас</a></li>
          <li><a href="/team">Сотрудники</a></li>
        </ul>
      </div>
      <div className={styles.column}>
        <h3 className={styles.menuTitle}>МЕНЮ</h3>
        <ul className={styles.menuList}>
          <li><a href="/services">Услуги</a></li>
          <li><a href="/reviews">Отзывы</a></li>
          <li><a href="/about">О нас</a></li>
          <li><a href="/team">Сотрудники</a></li>
        </ul>
      </div>
      <div className={styles.column}>
        <h3 className={styles.menuTitle}>МЕНЮ</h3>
        <ul className={styles.menuList}>
          <li><a href="/services">Услуги</a></li>
          <li><a href="/reviews">Отзывы</a></li>
          <li><a href="/about">О нас</a></li>
          <li><a href="/team">Сотрудники</a></li>
        </ul>
      </div>
      <div className={styles.column}>
        <h3 className={styles.menuTitle}>МЕНЮ</h3>
        <ul className={styles.menuList}>
          <li><a href="/services">Услуги</a></li>
          <li><a href="/reviews">Отзывы</a></li>
          <li><a href="/about">О нас</a></li>
          <li><a href="/team">Сотрудники</a></li>
        </ul>
      </div>

      {/* Можно добавить ещё колонки при необходимости */}
    </footer>
  );
};

export default Footer;