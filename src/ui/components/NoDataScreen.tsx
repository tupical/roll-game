import React from 'react';
const NoDataScreen: React.FC<{ player?: any; map?: any }> = (player, map) => (
  <div className="game-page no-data">
    <h1>Ожидание данных</h1>
    <p>Игрок: {player ? 'Есть' : 'Нет'}, Карта: {map ? 'Есть' : 'Нет'}</p>
  </div>
);export default NoDataScreen;