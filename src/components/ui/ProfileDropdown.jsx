import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ProfileDropdown.css';


const ProfileDropdown = ({
  isOpen,
  user,
  isAuthenticated,
  avatarUrl,
  userName,
  onProfile,
  onChat,
  onSettings,
  onLogout,
  onLogin,
  onRegister
}) => {
  return (
    <div
      className={`profile-dropdown ${isOpen ? 'profile-dropdown--open' : ''}`}
      role="menu"
      aria-label="Меню профиля"
    >
      {isAuthenticated ? (
        <>
          <div className="user-info">
            <div className="user-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Аватар"
                  className="user-avatar-img-small"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const initialsPlaceholder = e.target.parentElement.querySelector('.initials-placeholder');
                    if (initialsPlaceholder) {
                      initialsPlaceholder.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div className="initials-placeholder">
                  <span className="initials-placeholder-text">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="user-details">
              <strong>{userName}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <hr className="profile-divider" />

          <button className="profile-option" onClick={onProfile} role="menuitem">
            <span className="material-symbols-outlined option-icon" style={{ fontSize: '1rem' }}>account_circle</span>
            Профиль
          </button>
          <button className="profile-option" onClick={onChat} role="menuitem">
            <span className="material-symbols-outlined option-icon" style={{ fontSize: '1rem' }}>chat</span>
            Чат
          </button>
          <button className="profile-option" onClick={onSettings} role="menuitem">
            <span className="material-symbols-outlined option-icon" style={{ fontSize: '1rem' }}>settings</span>
            Настройки
          </button>
          <hr className="profile-divider" />
          <button className="profile-option logout" onClick={onLogout} role="menuitem">
            <span className="material-symbols-outlined option-icon" style={{ fontSize: '1rem' }}>logout</span>
            Выйти
          </button>
        </>
      ) : (
        <>
          <button className="profile-option" onClick={onLogin} role="menuitem">
            Вход
          </button>
          <button className="profile-option" onClick={onRegister} role="menuitem">
            Регистрация
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
