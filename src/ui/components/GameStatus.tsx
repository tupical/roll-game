// components/GameStatus.tsx
import React from 'react';
import { GameStatusProps } from '../interfaces/ui.interfaces';
import ServerStatus from './ServerStatus';

const GameStatus: React.FC<GameStatusProps> = ({ player, isConnected, eventMessage, error }) => (
  <div className="game-status">
    <ServerStatus connected={isConnected} />
    {player && (
      <div className="player-info">
        <div>Игрок: {player.username}</div>
        <div>Позиция: X:{player.position.x}, Y:{player.position.y}</div>
      </div>
    )}
    <div className="event-message">Событие: {eventMessage || 'Нет событий'}</div>
    {error && <div className="error-message">Ошибка: {error}</div>}
  </div>
);

export default GameStatus;
