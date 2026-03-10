import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left'
};

const DEFAULT_DURATION = 5000;

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter(toast => toast.id !== action.payload);
    case 'CLEAR_TOASTS':
      return [];
    default:
      return state;
  }
}

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = DEFAULT_DURATION) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration,
      position: TOAST_POSITIONS.BOTTOM_RIGHT
    };

    dispatch({ type: 'ADD_TOAST', payload: toast });

    // Автоматическое удаление через duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: 'CLEAR_TOASTS' });
  }, []);

  // Удобные методы для разных типов уведомлений
  const toast = {
    success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
    info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
    warning: (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
    remove: removeToast,
    clear: clearToasts,
    toasts
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        <span className="material-symbols-outlined">{icons[type]}</span>
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="toast-progress" />
    </div>
  );
};

export default ToastContext;
