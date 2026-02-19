import React, { useState, useEffect, useCallback } from 'react';
import { getMasterReviews, getSalonReviews, createReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ReviewsList.css';

const ReviewsList = ({ masterId, salonId, showForm = false, onReviewCreated }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (masterId) {
        result = await getMasterReviews(masterId, { limit: 20 });
      } else if (salonId) {
        result = await getSalonReviews(salonId, { limit: 20 });
      }

      setReviews(result.data || []);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      setError('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  }, [masterId, salonId]);

  useEffect(() => {
    loadReviews();
  }, [masterId, salonId, loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Для создания отзыва необходимо войти в систему');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData = {
        master_id: masterId,
        salon_id: salonId,
        ...formData
      };

      await createReview(reviewData);

      // Очистка формы
      setFormData({ rating: 5, comment: '' });
      setShowReviewForm(false);

      // Перезагрузка списка
      await loadReviews();

      // Callback
      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (err) {
      console.error('Ошибка создания отзыва:', err);
      setError(err.response?.data?.message || 'Не удалось создать отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  if (loading) {
    return <div className="reviews-loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="reviews-list-container">
      <div className="reviews-header">
        <h3>Отзывы</h3>
        {showForm && user && !showReviewForm && (
          <button
            className="btn-write-review"
            onClick={() => setShowReviewForm(true)}
          >
            Написать отзыв
          </button>
        )}
      </div>

      {error && <div className="reviews-error">{error}</div>}

      {showForm && showReviewForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Ваш отзыв</h4>

          <div className="rating-input">
            <label>Ваша оценка:</label>
            <div className="stars-input">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= formData.rating ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Комментарий:</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Расскажите о вашем опыте..."
              maxLength={1000}
              rows={4}
            />
            <span className="char-count">{formData.comment.length}/1000</span>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Опубликовать'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowReviewForm(false)}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          Пока нет отзывов. Будьте первым!
        </div>
      ) : (
        <div className="reviews">
          {reviews.map(review => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Компонент отдельного отзыва
 */
const ReviewItem = ({ review }) => {
  const date = new Date(review.created_at).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-author">
          <span className="author-name">Клиент</span>
          <span className="review-date">{date}</span>
        </div>
        <div className="review-rating">
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </div>
      </div>
      {review.comment && (
        <div className="review-comment">
          {review.comment}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
