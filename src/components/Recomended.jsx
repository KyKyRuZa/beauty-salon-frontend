import React, { useState } from 'react';
import '../styles/Recomended.css';
import RecomendedCard from './card/RecomendedCard';
import photo from '../assets/photo.png';

const Recomended = () => {
  const [favorites, setFavorites] = useState(new Set()); // ← начальные избранные: id 2 и 4

  const masters = [
    {
      id: 1,
      education: true,
      name: "Бондарев Егор",
      specialty: "Тайский массаж, хиджама",
      location: "Казань, Сибирский тракт 106",
      workHours: "10:00 – 18:00",
      rating: 4.8,
      photoUrl: photo,
      role: 'master',
    },
    {
      id: 2,
      education: false,
      name: "Красивые люди",
      specialty: "Маникюр",
      location: "Казань, Сибирский тракт 106",
      workHours: "9:00 – 18:00",
      rating: 4.8,
      photoUrl: photo,
      role: 'master',
    },
    {
      id: 3,
      education: false,
      name: "Зиновьева Евгения",
      specialty: "Женская стрижка",
      location: "Казань, Сибирский тракт 106",
      workHours: "12:00 – 19:00",
      rating: 4.1,
      photoUrl: photo,
      role: 'master',
    },
    {
      id: 4,
      education: true,
      name: "Степанова Полина",
      specialty: "Лазерная эпиляция",
      location: "Казань, Сибирский тракт 106",
      workHours: "16:00 – 21:00",
      rating: 4.8,
      photoUrl: photo,
      role: 'master',
    },
  ];

  const handleBook = (id) => {
    console.log("Запись к мастеру:", id);
  };

  const handleViewProfile = (id) => {
    console.log("Просмотр профиля:", id);
  };

  const handleToggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="recomended-container">
      <h1>РЕКОМЕНДУЕМ МАСТЕРОВ</h1>
      <div className="card-container">
        {masters.map((master) => (
          <RecomendedCard
            key={master.id}
            {...master}
            isFavorite={favorites.has(master.id)} // ← динамическое значение
            onBook={() => handleBook(master.id)}
            onViewProfile={() => handleViewProfile(master.id)}
            onToggleFavorite={() => handleToggleFavorite(master.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Recomended;