import React from 'react';
import '../../styles/SearchForm.css';


const SearchForm = ({ searchQuery, onSearchChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="search-form">
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск услуг..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
          aria-label="Поиск услуг"
        />
        <button type="submit" className="search-button" aria-label="Найти">
          <span className="material-symbols-outlined search-icon">search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
