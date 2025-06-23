// components/LoadingScreen.tsx
import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="game-page loading">
    <h1>Загрузка игры...</h1>
    <p>Подключение к серверу...</p>
  </div>
);
export default LoadingScreen;