import React, { useReducer, useEffect, useCallback } from 'react';
import { logger } from '../../utils/logger';
import { getMasterReviews, getSalonReviews, createReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ReviewsList.css';

const initialState = {
  reviews: [],
  loading: true,
  error: null,
  showReviewForm: false,
  submitting: false,
  formData: {
    rating: 5,
    comment: ''
  }
};

function reviewsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.data };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_SHOW_FORM':
      return { ...state, showReviewForm: action.value };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.data } };
    case 'RESET_FORM':
      return { ...state, formData: { rating: 5, comment: '' }, showReviewForm: false };
    default:
      return state;
  }
}

const ReviewsList = ({ masterId, salonId, showForm = false, onReviewCreated }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reviewsReducer, initialState);

  const loadReviews = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', value: true });
      dispatch({ type: 'SET_ERROR', error: null });

      let result;
      if (masterId) {
        result = await getMasterReviews(masterId, { limit: 20 });
      } else if (salonId) {
        result = await getSalonReviews(salonId, { limit: 20 });
      }

      dispatch({ type: 'SET_REVIEWS', data: result.data || [] });
    } catch (err) {
      logger.error('Ошибка загрузки отзывов:', err);
      dispatch({ type: 'SET_ERROR', error: 'Не удалось загрузить отзывы' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }, [masterId, salonId]);

  useEffect(() => {
    loadReviews();
  }, [masterId, salonId, loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      dispatch({ type: 'SET_ERROR', error: 'Для создания отзыва необходимо войти в систему' });
      return;
    }

    try {
      dispatch({ type: 'SET_SUBMITTING', value: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const reviewData = {
        master_id: masterId,
        salon_id: salonId,
        ...state.formData
      };

      await createReview(reviewData);

      dispatch({ type: 'RESET_FORM' });
      await loadReviews();

      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (err) {
      logger.error('Ошибка создания отзыва:', err);
      dispatch({ type: 'SET_ERROR', error: err.response?.data?.message || 'Не удалось создать отзыв' });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  };

  const handleRatingClick = (rating) => {
    dispatch({ type: 'SET_FORM_DATA', data: { rating } });
  };

  if (state.loading) {
    return <div className="reviews-loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="reviews-list-container">
      <div className="reviews-header">
        <h3>Отзывы</h3>
        {showForm && user && !state.showReviewForm && (
          <button
            className="btn-write-review"
            onClick={() => dispatch({ type: 'SET_SHOW_FORM', value: true })}
          >
            Написать отзыв
          </button>
        )}
      </div>

      {state.error && <div className="reviews-error">{state.error}</div>}

      {showForm && state.showReviewForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Ваш отзыв</h4>

          <div className="rating-input">
            <span>Ваша оценка:</span>
            <div className="stars-input">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= state.formData.rating ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRatingClick(star)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Оценка ${star}`}
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
              value={state.formData.comment}
              onChange={(e) => dispatch({ type: 'SET_FORM_DATA', data: { comment: e.target.value } })}
              placeholder="Расскажите о вашем опыте..."
              maxLength={1000}
              rows={4}
            />
            <span className="char-count">{state.formData.comment.length}/1000</span>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={state.submitting}>
              {state.submitting ? 'Отправка...' : 'Опубликовать'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => dispatch({ type: 'SET_SHOW_FORM', value: false })}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {state.reviews.length === 0 ? (
        <div className="no-reviews">
          Пока нет отзывов. Будьте первым!
        </div>
      ) : (
        <div className="reviews">
          {state.reviews.map(review => (
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
