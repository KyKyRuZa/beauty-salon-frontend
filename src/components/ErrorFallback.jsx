import React from 'react';
import '../styles/ErrorFallback.css';

const ErrorFallback = ({ error, onRetry, title = 'Произошла ошибка' }) => {
  return (
    <div className="error-fallback">
      <div className="error-content">
        <span className="material-symbols-outlined error-icon">error_outline</span>
        <h2 className="error-title">{title}</h2>
        {error && <p className="error-message">{error}</p>}
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            <span className="material-symbols-outlined">refresh</span>
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
