import styles from './notfound.module.css'
import notfound from '../../assets/notfound.png';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.errorTitle}>ОШИБКА</h1>
        <div className={styles.notfound}>
          <img
            src={notfound}
            alt="404 Ошибка"
            className={styles.image}
          />
        </div>
        <p className={styles.message}>СТРАНИЦА НЕ НАЙДЕНА</p>
        <Link to="/" className={styles.homeButton}>
          НА ГЛАВНУЮ СТРАНИЦУ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
