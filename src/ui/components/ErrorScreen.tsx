import React from 'react';
const ErrorScreen: React.FC<{ message?: string }> = ({ message }) => (
  <div className="game-page error">
    <h1>Ошибка</h1>
    <p>{message || 'Неизвестная ошибка'}</p>
    <button onClick={() => window.location.reload()}>Перезагрузить</button>
  </div>
);
export default ErrorScreen;