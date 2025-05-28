import React from 'react';
import { GameStatusProps } from '../interfaces/ui.interfaces';

const GameStatus: React.FC<GameStatusProps> = ({ player, isConnected, eventMessage, error }) => {
  return (
    <div className="game-status">
      <div className="server-status">
        Статус сервера: <span className={isConnected ? "success" : "error"}>
          {isConnected ? "Подключено" : "Отключено"}
        </span>
      </div>
      
      {player && (
        <div className="player-info">
          <div className="username">Игрок: {player.username}</div>
          <div className="position">Позиция: X:{player.position?.x || 0}, Y:{player.position?.y || 0}</div>
        </div>
      )}
      
      <div className="event-message">
        Событие: {eventMessage || 'Нет событий'}
      </div>
      
      {error && (
        <div className="error-message">
          Ошибка: {error}
        </div>
      )}
    </div>
  );
};

export default GameStatus;
