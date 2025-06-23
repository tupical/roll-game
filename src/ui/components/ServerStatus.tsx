// components/ServerStatus.tsx
import React from 'react';
const GameStatus: React.FC<{ connected: boolean }> = ({ connected }: { connected: boolean }) => (
  <div className="server-status">
    Статус сервера:{' '}
    <span className={connected ? 'success' : 'error'}>
      {connected ? 'Подключено' : 'Отключено'}
    </span>
  </div>
);
export default GameStatus;